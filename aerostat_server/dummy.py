import socket
import threading

# Define the IP address and ports to listen on
host = '0.0.0.0'
ports = [4002, 4003, 4004, 4005, 4006, 4007]

# Data template for port 4007
data_4007_template = "@A01,25.5,{0},{1},{2},{3}\r\n"

# Default state for the four fields in the packet for port 4007
state_4007 = {
    "field1": "ON",  # First field
    "field2": "ON",  # Second field
    "field3": "OFF", # Third field
    "field4": "1"    # Fourth field
}

# Variables to track current values and directions for ports 4004 and 4005
state_4004 = {
    "value": 0,
    "increasing": True
}

state_4005 = {
    "value": 0,
    "increasing": True
}

# Data to be sent to clients on each port
data_dict = {
    4002: b"$HCHDT,128.0,T*22\r\n$WIMDA,29.2878,I,0.9918,B,18.8,C,,,,,,,,,,,,,,*36\r\n$WIMWV,158.4,R,1.9,N,A*23\r\n",
    4003: b"$PTNTHPR,240.1,N,0.8,N,2.2,N*3B\r\n",
    4004: b"#01CP=0.0712\r\n",
    4005: b"#01CP=-0.3984\r\n",
    4006: b">12\r\n"
}

# Function to update dynamic values for port 4004 and 4005
def update_dynamic_state(state):
    if state["increasing"]:
        if state["value"] < 6:
            state["value"] += 1
        else:
            state["increasing"] = False
            state["value"] -= 1
    else:
        if state["value"] > 0:
            state["value"] -= 1
        else:
            state["increasing"] = True
            state["value"] += 1

# Function to handle client connections
def handle_client(conn, addr, port):
    print(f"Connected by {addr} on port {port}")
    try:
        if port == 4007:
            while True:
                received_data = conn.recv(1024)
                if not received_data:
                    break
                received_command = received_data.decode('utf-8').strip()
                print(f"Received data from {addr} on port {port}: {received_command}")

                # Check the received command and update values for the packet
                if received_command.startswith("@01DO"):
                    command_type = received_command[5:7]
                    if command_type == "00":
                        state_4007.update({"field1": "ON", "field2": "ON"})
                    elif command_type == "01":
                        state_4007.update({"field1": "OFF", "field2": "ON"})
                    elif command_type == "02":
                        state_4007.update({"field1": "ON", "field2": "OFF"})
                    elif command_type == "03":
                        state_4007.update({"field1": "OFF", "field2": "OFF"})
                    elif command_type == "10":
                        state_4007.update({"field3": "ON", "field4": "1"})
                    elif command_type == "11":
                        state_4007.update({"field3": "OFF", "field4": "1"})
                    elif command_type == "12":
                        state_4007.update({"field3": "ON", "field4": "0"})
                    elif command_type == "13":
                        state_4007.update({"field3": "OFF", "field4": "0"})

                # Send the updated data back to the client
                response = data_4007_template.format(state_4007["field1"], state_4007["field2"], state_4007["field3"], state_4007["field4"])
                conn.sendall(response.encode('utf-8'))
                print(f"Sent data to {addr} on port {port}: {response}")
        
        elif port == 4004:
            # Update and send dynamic value for port 4004
            update_dynamic_state(state_4004)
            response = f"#01CP={state_4004['value']:.2f}\r\n"
            conn.sendall(response.encode('utf-8'))
            print(f"Sent data to {addr} on port {port}: {response}")
        
        elif port == 4005:
            # Update and send dynamic value for port 4005
            update_dynamic_state(state_4005)
            response = f"#01CP={state_4005['value']:.2f}\r\n"
            conn.sendall(response.encode('utf-8'))
            print(f"Sent data to {addr} on port {port}: {response}")

        # For other ports, send predefined data
        elif port in data_dict:
            conn.sendall(data_dict[port])
            print(f"Sent data to {addr} on port {port}")
        else:
            print(f"No data configured for port {port}")
        
    except socket.error as e:
        print(f"Error handling client on port {port}: {e}")
    finally:
        conn.close()

# Function to set up a server socket and listen for connections
def start_server(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.bind((host, port))
        server_socket.listen()
        print(f"Server listening on port {port}")
        
        while True:
            conn, addr = server_socket.accept()
            client_thread = threading.Thread(target=handle_client, args=(conn, addr, port))
            client_thread.start()

# Start servers on the specified ports
for port in ports:
    server_thread = threading.Thread(target=start_server, args=(port,))
    server_thread.start()
