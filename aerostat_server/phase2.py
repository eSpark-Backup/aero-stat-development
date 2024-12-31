from pymodbus.server.sync import StartTcpServer
from pymodbus.datastore import ModbusSlaveContext, ModbusServerContext
from pymodbus.datastore import ModbusSequentialDataBlock
from pymodbus.device import ModbusDeviceIdentification
import logging
import threading
import time
import random
import struct

# Configure logging
logging.basicConfig(level=logging.INFO)
log = logging.getLogger()

# TCP Server Settings
TCP_IP = '0.0.0.0'
PORTS = {
    "LOAD_CELL_PORT": 5005,
    "ULTRASONIC_PORT": 5004,
    "WEATHER_STATION_PORT": 5007,
    "BALLONET_PRESSURE_PORT": 5002,
    "HULL_PRESSURE_PORT": 5001,
    "AHRS_PORT": 5003,
    "TEMP_HUMIDITY_TCP_PORT": 5006,
    "RELAY_PORT": 4196
}

# Modbus registers for temperature and humidity
HUMIDITY_REGISTER = 0
TEMPERATURE_REGISTER = 1

# Register Details
LOAD_CELL_REGISTER = 0x9C40
ULTRASONIC_REGISTER = 0x0101
PRESSURE_SENSOR_REGISTER = 0x0004

# Define relay button configurations
relay_configs = [
    {"name": "Primary Blower", "relay_num": 3},
    {"name": "Secondary Blower", "relay_num": 5},
    {"name": "Strobe Lights", "relay_nums": [4, 6]},  # Controls both relays 4 and 6
    {"name": "Payload Power", "relay_num": 7}
]

WEATHER_REGISTERS = {
    "wind_direction": (0x0001, 1, 'int'),
    "wind_speed": (0x0002, 2, 'float'),
    "temperature": (0x0004, 2, 'float'),
    "humidity": (0x0006, 2, 'float'),
    "air_pressure": (0x0008, 2, 'float')
}

AHRS_GPS_REGISTERS = {
    'roll': 0x3D, 'pitch': 0x3E, 'yaw': 0x3F,
    'LonL': 0x49, 'LonH': 0x4A, 'LatL': 0x4B, 'LatH': 0x4C,
    'GPSHeight': 0x4D, 'GPSYAW': 0x4E, 'GPSVL': 0x4F, 'GPSVH': 0x50,
    'SVNUM': 0x55, 'PDOP': 0x56, 'HDOP': 0x57, 'VDOP': 0x58
}
RELAY_FUNCTIONS = {
    3: "Primary Blower",
    4: "Strobe Light 1",
    5: "Secondary Blower",
    6: "Strobe Light 2",
    7: "Payload Power"
}

def create_load_cell_data_store():
    return ModbusSlaveContext(
        di=ModbusSequentialDataBlock(0, [0]*100),
        co=ModbusSequentialDataBlock(0, [0]*100),
        hr=ModbusSequentialDataBlock(LOAD_CELL_REGISTER, [0]*2),
        ir=ModbusSequentialDataBlock(0, [0]*100)
    )

def create_ahrs_data_store():
    return ModbusSlaveContext(
        di=ModbusSequentialDataBlock(0, [0]*100),
        co=ModbusSequentialDataBlock(0, [0]*100),
        hr=ModbusSequentialDataBlock(0, [0]*65535),
        ir=ModbusSequentialDataBlock(0, [0]*100)
    )

# Create Modbus data store for weather station and relays
def create_relay_data_store():
    return ModbusSlaveContext(
        di=ModbusSequentialDataBlock(0, [0]*100),
        co=ModbusSequentialDataBlock(0, [0]*10),  # Coils for relays
        hr=ModbusSequentialDataBlock(0, [0]*10),
        ir=ModbusSequentialDataBlock(0, [0]*100)
    )

# Create Modbus data store for different sensors
def create_data_store():
    return ModbusSlaveContext(
        di=ModbusSequentialDataBlock(0, [0]*100),  # Discrete Inputs
        co=ModbusSequentialDataBlock(0, [0]*100),  # Coils
        hr=ModbusSequentialDataBlock(0, [0]*65535),  # Holding Registers
        ir=ModbusSequentialDataBlock(0, [0]*100)   # Input Registers
    )

# Modbus device identity
identity = ModbusDeviceIdentification()
identity.VendorName = 'SensorServer'
identity.ProductCode = 'ModbusTCP'
identity.VendorUrl = 'http://example.com'
identity.ProductName = 'Modbus TCP Server'
identity.ModelName = 'ModbusServer1'
identity.MajorMinorRevision = '1.0'

# Function to run the Modbus server on a specific port with its update routine
def run_modbus_server_with_update(port, context, update_function):
    def server_thread():
        log.info(f"Starting Modbus TCP server at {TCP_IP}:{port}...")
        StartTcpServer(context=context, identity=identity, address=(TCP_IP, port))

    def update_thread():
        log.info(f"Starting update routine for port {port}")
        try:
            update_function(context)
        except Exception as e:
            log.error(f"Error in update routine for port {port}: {e}")

    server = threading.Thread(target=server_thread)
    server.daemon = True
    server.start()

    update = threading.Thread(target=update_thread)
    update.daemon = True
    update.start()

# Function to update weather registers
def update_weather_registers(context):
    while True:
        try:
            temperature = random.uniform(20, 30)
            humidity = random.uniform(50, 70)
            wind_speed = random.uniform(0, 100)
            wind_direction = random.uniform(0, 360)
            air_pressure = random.uniform(950, 1050)

            log.debug(f"Generated weather data: temperature={temperature}, humidity={humidity}, wind_speed={wind_speed}, wind_direction={wind_direction}, air_pressure={air_pressure}")

            context[0].setValues(3, WEATHER_REGISTERS['wind_direction'][0], [int(wind_direction)])

            # Pack the float values into two 16-bit registers
            temperature_bytes = struct.pack('<f', temperature)
            temperature_low, temperature_high = struct.unpack('<HH', temperature_bytes)
            context[0].setValues(3, WEATHER_REGISTERS['temperature'][0], [temperature_low, temperature_high])

            humidity_bytes = struct.pack('<f', humidity)
            humidity_low, humidity_high = struct.unpack('<HH', humidity_bytes)
            context[0].setValues(3, WEATHER_REGISTERS['humidity'][0], [humidity_low, humidity_high])

            wind_speed_bytes = struct.pack('<f', wind_speed)
            wind_speed_low, wind_speed_high = struct.unpack('<HH', wind_speed_bytes)
            context[0].setValues(3, WEATHER_REGISTERS['wind_speed'][0], [wind_speed_low, wind_speed_high])

            air_pressure_bytes = struct.pack('<f', air_pressure)
            air_pressure_low, air_pressure_high = struct.unpack('<HH', air_pressure_bytes)
            context[0].setValues(3, WEATHER_REGISTERS['air_pressure'][0], [air_pressure_low, air_pressure_high])

            log.debug(f"Updated weather registers: temperature={temperature}, humidity={humidity}, wind_speed={wind_speed}, wind_direction={wind_direction}, air_pressure={air_pressure}")

        except Exception as e:
            log.error(f"Error updating weather registers: {e}")
        time.sleep(0.2)

def update_load_cell_registers(context):
    while True:
        try:
            load_cell_value = random.randint(0, 0xFFFFFFFF)
            load_cell_low = load_cell_value & 0xFFFF
            load_cell_high = (load_cell_value >> 16) & 0xFFFF
            context[0].setValues(3, LOAD_CELL_REGISTER, [load_cell_high, load_cell_low])
            log.debug(f"Updated load cell registers: high={load_cell_high}, low={load_cell_low}")
        except Exception as e:
            log.error(f"Error updating load cell registers: {e}")
        time.sleep(0.2)

def update_ultrasonic_registers(context):
    while True:
        try:
            ultrasonic_value = random.randint(0, 1000)
            context[0].setValues(3, ULTRASONIC_REGISTER, [ultrasonic_value])
            log.debug(f"Updated ultrasonic register: value={ultrasonic_value}")
        except Exception as e:
            log.error(f"Error updating ultrasonic registers: {e}")
        time.sleep(0.2)

def update_pressure_sensor_registers(context):
    while True:
        try:
            pressure_value = random.randint(0, 1000)
            context[0].setValues(3, PRESSURE_SENSOR_REGISTER, [pressure_value])
            log.debug(f"Updated pressure sensor register: value={pressure_value}")
        except Exception as e:
            log.error(f"Error updating pressure sensor registers: {e}")
        time.sleep(0.2)

def update_ahrs_gps_registers(context):
    while True:
        try:
            roll = int((random.uniform(0, 360) / 180.0) * (32768))
            pitch = int((random.uniform(0, 180) / 180.0) * (32768))
            yaw = int((random.uniform(0, 360) / 180.0) * (32768))
            longitude = int(random.uniform(0, 2048) * 100)
            latitude = int(random.uniform(0, 2048) * 100)
            altitude = int(random.uniform(0, 2048) * 10)
            heading = int(random.uniform(0, 360) * 100)
            ground_speed = int(random.uniform(0, 32768*2))
            pdop = int(random.uniform(0, 10) * 100)
            hdop = int(random.uniform(0, 10) * 100)
            vdop = int(random.uniform(0, 10) * 100)

            context[0].setValues(3, AHRS_GPS_REGISTERS['roll'], [roll])
            context[0].setValues(3, AHRS_GPS_REGISTERS['pitch'], [pitch])
            context[0].setValues(3, AHRS_GPS_REGISTERS['yaw'], [yaw])
            context[0].setValues(3, AHRS_GPS_REGISTERS['LonL'], [longitude & 0xFFFF])
            context[0].setValues(3, AHRS_GPS_REGISTERS['LonH'], [longitude >> 16])
            context[0].setValues(3, AHRS_GPS_REGISTERS['LatL'], [latitude & 0xFFFF])
            context[0].setValues(3, AHRS_GPS_REGISTERS['LatH'], [latitude >> 16])
            context[0].setValues(3, AHRS_GPS_REGISTERS['GPSHeight'], [altitude])
            context[0].setValues(3, AHRS_GPS_REGISTERS['GPSYAW'], [heading])
            context[0].setValues(3, AHRS_GPS_REGISTERS['GPSVL'], [ground_speed & 0xFFFF])
            context[0].setValues(3, AHRS_GPS_REGISTERS['GPSVH'], [ground_speed >> 16])
            context[0].setValues(3, AHRS_GPS_REGISTERS['PDOP'], [pdop])
            context[0].setValues(3, AHRS_GPS_REGISTERS['HDOP'], [hdop])
            context[0].setValues(3, AHRS_GPS_REGISTERS['VDOP'], [vdop])

            log.debug(f"Updated AHRS/GPS registers: roll={roll}, pitch={pitch}, yaw={yaw}, "
                      f"longitude={longitude}, latitude={latitude}, altitude={altitude}, "
                      f"heading={heading}, ground_speed={ground_speed}, pdop={pdop}, hdop={hdop}, vdop={vdop}")
        except Exception as e:
            log.error(f"Error updating AHRS/GPS registers: {e}")
        time.sleep(0.2)

# Function to print relay status
def print_relay_status(context):
    while True:
        try:
            relay_status = {}
            for config in relay_configs:
                if "relay_num" in config:
                    state = context[0].getValues(1, config["relay_num"] - 1, count=1)[0]
                    relay_status[config["name"]] = 'ON' if state else 'OFF'
                elif "relay_nums" in config:
                    states = [context[0].getValues(1, num - 1, count=1)[0] for num in config["relay_nums"]]
                    relay_status[config["name"]] = 'ON' if all(states) else 'OFF'

            log.error(f"Relay status - " + ", ".join([f"{name}: {status}" for name, status in relay_status.items()]))

        except Exception as e:
            log.error(f"Error reading relay status: {e}")
        time.sleep(1)

def update_temp_humidity_registers(context):
    while True:
        try:
            temperature = random.uniform(20, 30)
            humidity = random.uniform(50, 70)
            context[0].setValues(3, TEMPERATURE_REGISTER, [int(temperature * 10)])
            context[0].setValues(3, HUMIDITY_REGISTER, [int(humidity * 10)])
            log.debug(f"Updated temp/humidity registers: temperature={temperature}, humidity={humidity}")
        except Exception as e:
            log.error(f"Error updating temp/humidity registers: {e}")
        time.sleep(0.2)

# Start servers with their respective update routines
def start_servers():
    contexts = {
        "load_cell": ModbusServerContext(slaves=create_load_cell_data_store(), single=True),
        "ultrasonic": ModbusServerContext(slaves=create_data_store(), single=True),
        "weather_station": ModbusServerContext(slaves=create_data_store(), single=True),
        "pressure_sensor": ModbusServerContext(slaves=create_data_store(), single=True),
        "ahrs": ModbusServerContext(slaves=create_ahrs_data_store(), single=True),
        "temp_humidity": ModbusServerContext(slaves=create_data_store(), single=True),
        "relay": ModbusServerContext(slaves=create_relay_data_store(), single=True)
    }

    run_modbus_server_with_update(PORTS["LOAD_CELL_PORT"], contexts["load_cell"], update_load_cell_registers)
    run_modbus_server_with_update(PORTS["ULTRASONIC_PORT"], contexts["ultrasonic"], update_ultrasonic_registers)
    run_modbus_server_with_update(PORTS["WEATHER_STATION_PORT"], contexts["weather_station"], update_weather_registers)
    run_modbus_server_with_update(PORTS["BALLONET_PRESSURE_PORT"], contexts["pressure_sensor"], update_pressure_sensor_registers)
    run_modbus_server_with_update(PORTS["HULL_PRESSURE_PORT"], contexts["pressure_sensor"], update_pressure_sensor_registers)
    run_modbus_server_with_update(PORTS["AHRS_PORT"], contexts["ahrs"], update_ahrs_gps_registers)
    run_modbus_server_with_update(PORTS["TEMP_HUMIDITY_TCP_PORT"], contexts["temp_humidity"], update_temp_humidity_registers)
    run_modbus_server_with_update(PORTS["RELAY_PORT"], contexts["relay"], print_relay_status)

if __name__ == "__main__":
    log.info("Starting servers and update routines")
    start_servers()
    while True:
        time.sleep(0.2)