from pymodbus.client.sync import ModbusTcpClient
import time

# Client configuration
client = ModbusTcpClient('localhost', port=5003)

# AHRS/GPS Register Details
AHRS_GPS_REGISTERS = {
    'roll': 0x3D, 'pitch': 0x3E, 'yaw': 0x3F,
    'LonL': 0x49, 'LonH': 0x4A, 'LatL': 0x4B, 'LatH': 0x4C,
    'GPSHeight': 0x4D, 'GPSYAW': 0x4E, 'GPSVL': 0x4F, 'GPSVH': 0x50,
    'PDOP': 0x51, 'HDOP': 0x52, 'VDOP': 0x53
}

def calculate_position_accuracy(pdop, hdop, vdop):
    # Placeholder for actual position accuracy calculation
    return (pdop + hdop + vdop) / 3.0

# Function to read and print AHRS/GPS data
def read_ahrs_data(client):
    running = True
    while running:
        try:
            data = {}
            position_accuracy = 0.0  # Initialize position_accuracy to a default value
            for key, reg in AHRS_GPS_REGISTERS.items():
                response = client.read_holding_registers(reg, 1, slave=0x50)
                if not response.isError():
                    data[key] = response.registers[0]

            # Extract AHRS readings
            roll = (data.get('roll', 0) / 2048.0) * 180.0
            pitch = (data.get('pitch', 0) / 2048.0) * 180.0
            yaw = (data.get('yaw', 0) / 2048.0) * 180.0
            longitude = ((data.get('LonH', 0) << 16) | data.get('LonL', 0)) / 1000000.0
            latitude = ((data.get('LatH', 0) << 16) | data.get('LatL', 0)) / 1000000.0
            altitude = data.get('GPSHeight', 0) / 10.0
            heading = data.get('GPSYAW', 0) / 100.0
            ground_speed = ((data.get('GPSVH', 0) << 16) | data.get('GPSVL', 0)) * 0.01
            pdop = data.get('PDOP', 0) / 100.0
            hdop = data.get('HDOP', 0) / 100.0
            vdop = data.get('VDOP', 0) / 100.0

            # Calculate Position Accuracy using PDOP, HDOP, and VDOP
            position_accuracy = calculate_position_accuracy(pdop, hdop, vdop)

            # Print the values
            print(f"Roll: {roll:.2f} °, Pitch: {pitch:.2f} °, Yaw: {yaw:.2f} °")
            print(f"Longitude: {longitude:.6f}, Latitude: {latitude:.6f}")
            print(f"Altitude: {altitude:.1f} m, Heading: {heading:.3f}°")
            print(f"Ground Speed: {ground_speed:.2f} m/s, PDOP: {pdop:.2f}, HDOP: {hdop:.2f}, VDOP: {vdop:.2f}")
            print(f"Position Accuracy: {position_accuracy:.2f}%")

        except Exception as e:
            error_message = f"Error reading AHRS/GPS data: {e}"
            print(error_message)  # Print the error message for debugging

        time.sleep(0.2)

# Connect to the client and read data
if client.connect():
    read_ahrs_data(client)
    client.close()
else:
    print("Unable to connect to the Modbus server.")