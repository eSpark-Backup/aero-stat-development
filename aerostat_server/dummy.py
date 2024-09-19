import socket
import threading

# Define the IP address and ports to listen on
host = '0.0.0.0'
ports = [4002, 4003, 4004, 4005, 4006, 4007]

# Data to be sent to clients on each port
data_dict = {
    4002: b"$HCHDT,128.0,T*22\r\n$WIMDA,29.2878,I,0.9918,B,18.8,C,,,,,,,,,,,,,,*36\r\n$WIMWV,158.4,R,1.9,N,A*23\r\n",
    4003: b"$PTNTHPR,240.1,N,0.8,N,2.2,N*3B\r\n",
    4004: b"#01CP=0.0712\r\n",
    4005: b"#01CP=-0.3984\r\n",
    4006: b">12\r\n",
    4007: b"@A01,25.5,ON,OFF,ON,1\r\n"
}

# Function to handle client connections
def handle_client(conn, addr, port):
    print(f"Connected by {addr} on port {port}")
    try:
        # Send the appropriate data based on the port
        if port in data_dict:
            conn.sendall(data_dict[port])
            print(f"Sent data to {addr} on port {port}")
        else:
            print(f"No data configured for port {port}")
        
        # Optionally, receive data from the client
        received_data = conn.recv(1024)
        if received_data:
            print(f"Received data from {addr} on port {port}: {received_data.decode('utf-8')}")
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