from flask import Flask, jsonify, request  # type: ignore
from flask_cors import CORS  # type: ignore
import socket

app = Flask(__name__)
CORS(app)

# Initially, host and ports are empty and need to be set via /update-config
host = None
ports = []
target_port = 4007  # Default target port for fan and lights command

# Function to connect to specific port and fetch data
def connect_to_port(port):
    if not host or not ports:
        return "Host and ports are not configured", 500

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

# GET endpoint to fetch data from multiple ports
@app.route('/get-port-data', methods=['GET'])
def get_port_data():
    if not host or not ports:
        return jsonify({"error": "Host and ports are not configured"}), 500

    port_data = {}
    for port in ports:
        data = connect_to_port(port)
        if data:
            port_data[f"port_{port}"] = data
    return jsonify(port_data)

# Function to send commands to the target port
def connect_and_send_to_port(command):
    if not host:
        return "Host is not configured", 500

    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.connect((host, target_port))
            print(f"Connected to {host}:{target_port}")
            sock.sendall(command.encode())  # Send the command
            response_data = sock.recv(1024)  # Receive response from server
            print(f"Response from port {target_port}: {response_data.decode('utf-8')}")
            return response_data.decode('utf-8')
    except socket.error as e:
        print(f"Error on port {target_port}: {e}")
        return None

# POST endpoint to handle device commands (Fans and Lights)
@app.route('/send-device-commands', methods=['POST'])
def send_device_commands():
    if not host:
        return jsonify({"error": "Host is not configured"}), 500

    json_data = request.json
    if not json_data:
        return jsonify({"error": "No JSON data received"}), 400
    
    fans_command = json_data.get("Fans")
    lights_command = json_data.get("Lights")

    if not fans_command and not lights_command:
        return jsonify({"error": "No valid commands provided"}), 400

    # Send Fans command to the target port and get the response
    if fans_command:
        fans_response = connect_and_send_to_port(fans_command)
    else:
        fans_response = "No Fans command provided"

    # Send Lights command to the target port and get the response
    if lights_command:
        lights_response = connect_and_send_to_port(lights_command)
    else:
        lights_response = "No Lights command provided"

    return jsonify({
        "FansResponse": fans_response,
        "LightsResponse": lights_response
    })

# POST endpoint to update the IP and port configuration
@app.route('/update-config', methods=['POST'])
def update_config():
    global host, ports

    json_data = request.json
    if not json_data:
        return jsonify({"error": "No JSON data received"}), 400

    # Ensure both IP and all ports are provided in the request
    if not json_data.get('ip'):
        return jsonify({"error": "IP address is required"}), 400

    required_ports = ['weather', 'hmr', 'ballonet', 'helium', 'adam', 'ebox']
    if not all(key in json_data for key in required_ports):
        return jsonify({"error": "All port configurations are required"}), 400

    # Update host IP and port configuration based on the received data
    host = json_data['ip']
    ports = [
        int(json_data['weather']),
        int(json_data['hmr']),
        int(json_data['ballonet']),
        int(json_data['helium']),
        int(json_data['adam']),
        int(json_data['ebox'])
    ]

    return jsonify({
        "message": "Configuration updated successfully",
        "ip": host,
        "ports": ports
    })

if __name__ == '__main__':
    app.run(port=5000)
