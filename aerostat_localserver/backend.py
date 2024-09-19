from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS
import socket

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# import socket

# IP address and ports
host = '192.168.18.152'
ports = [4002, 4003, 4004, 4005, 4006, 4007]

def connect_to_port(port):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.connect((host, port))
            print(f"Connected to {host}:{port}")
            sock.sendall(b'Hello Server')
            data = sock.recv(1024)
            print(f"Data from port {port}: {data.decode('utf-8')}")
            return data.decode('utf-8')
    except socket.error as e:
        print(f"Error on port {port}: {e}")
        return None

# # Iterate over all ports and attempt connection
# for port in ports:
#     connect_to_port(port)

@app.route('/get-port-data', methods=['GET'])
def get_port_data():
    port_data = {}
    for port in ports:
        data = connect_to_port(port)
        if data:
            port_data[f"port_{port}"] = data
    return jsonify(port_data)

if __name__ == '__main__':
    app.run(port=5000)  # You can choose any port you prefer
