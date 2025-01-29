import socket
import threading
import time

# Define the IP address and ports to listen on
host = '0.0.0.0'
ports = [4002, 4003, 4004, 4005, 4006]

# Variables to track current values and directions for ports 4004 and 4005
state_4004 = {
    "value": 0,
    "increasing": True
}

state_4005 = {
    "value": 0,
    "increasing": True
}

state_4006 = {
    "value": 0.0,  # Start value for port 4006
    "increasing": True  # Track whether we are incrementing or decrementing
}

data_dicts = [
    {
        4002: b"$HCHDT,128.0,T*22\r\n$WIMDA,29.2878,I,0.9918,B,18.8,C,,,,,,,,,,,,,,*36\r\n$WIMWV,158.4,R,1.9,N,A*23\r\n",
        4003: b"$PTNTHPR,240.1,N,0.8,N,2.2,N*3B\r\n",
        4004: "#01CP={:.2f}\r\n",
        4005: "#01CP={:.2f}\r\n",
        4006: ">{:.1f}\r\n"
    },
    {
        4002: b"$HCHDT,130.0,T*22\r\n$WIMDA,29.3012,I,0.9925,B,19.0,C,,,,,,,,,,,,,,*37\r\n$WIMWV,160.0,R,2.1,N,A*24\r\n",
        4003: b"$PTNTHPR,242.5,N,1.0,N,2.5,N*3C\r\n",
        4004: "#01CP={:.2f}\r\n",
        4005: "#01CP={:.2f}\r\n",
        4006: ">{:.1f}\r\n"
    },
    {
        4002: b"$HCHDT,130.0,T*22\r\n$WIMDA,29.2000,I,0.9935,B,17.0,C,,,,,,,,,,,,,,*37\r\n$WIMWV,170.0,R,2.7,N,A*24\r\n",
        4003: b"$PTNTHPR,230.5,N,0.7,N,2.3,N*3D\r\n",
        4004: "#01CP={:.2f}\r\n",
        4005: "#01CP={:.2f}\r\n",
        4006: ">{:.1f}\r\n"
    }
]
current_data_index = 0  # Track the active data dictionary

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

def update_state_4006(state):
    if state["increasing"]:
        state["value"] += 50
        if state["value"] >= 300:  # Set a threshold for switching to decrementing phase
            state["increasing"] = False
    else:
        state["value"] -= 20
        if state["value"] <= 0:  # Set a threshold for switching to incrementing phase
            state["increasing"] = True

# Function to handle client connections
def handle_client(conn, addr, port):
    print(f"Connected by {addr} on port {port}")
    try:
        while True:
            data_dict = data_dicts[current_data_index]
            if port == 4004:
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

            elif port == 4006:
                # Update the value by incrementing by 50 or decrementing by 20 for port 4006
                update_state_4006(state_4006)
                response = f">{state_4006['value']:.1f}\r\n"
                conn.sendall(response.encode('utf-8'))
                print(f"Sent data to {addr} on port {port}: {response}")

            # For other ports, send predefined data
            elif port in data_dict:
                conn.sendall(data_dict[port])
                print(f"Sent data to {addr} on port {port}")
            else:
                print(f"No data configured for port {port}")
            
            time.sleep(0.5)  # Adjust the sleep duration as needed

    except socket.error as e:
        print(f"Error handling client on port {port}: {e}")
    finally:
        conn.close()
        print(f"Connection closed for {addr} on port {port}")

def switch_data_dict():
    global current_data_index
    while True:
        time.sleep(1)  # Switch data every 10 seconds
        current_data_index = (current_data_index + 1) % len(data_dicts)
        print(f"Switched to data dictionary {current_data_index}")

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

switch_thread = threading.Thread(target=switch_data_dict, daemon=True)
switch_thread.start()

# Start servers on the specified ports
for port in ports:
    server_thread = threading.Thread(target=start_server, args=(port,))
    server_thread.start()