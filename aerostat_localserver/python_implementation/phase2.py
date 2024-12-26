from pymodbus.server.sync import StartTcpServer
from pymodbus.datastore import ModbusSlaveContext, ModbusServerContext
from pymodbus.datastore import ModbusSequentialDataBlock
from pymodbus.device import ModbusDeviceIdentification
import logging
import threading
import time
import random

# Configure logging
logging.basicConfig(level=logging.ERROR)
log = logging.getLogger()

# TCP Server Settings
TCP_IP = 'localhost'
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
RELAY_REGISTERS = {
    "blower": 0x0001,
    "strobe_light": 0x0002,
    "payload_power": 0x0003
}

# Create Modbus data store for different sensors
def create_data_store():
    return ModbusSlaveContext(
        di=ModbusSequentialDataBlock(0, [0]*100),  # Discrete Inputs
        co=ModbusSequentialDataBlock(0, [0]*100),  # Coils
        hr=ModbusSequentialDataBlock(0, [0]*100),  # Holding Registers
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

# Update functions for different contexts
def update_weather_registers(context):
    while True:
        try:
            temperature = random.uniform(20, 30)
            humidity = random.uniform(50, 70)
            wind_speed = random.uniform(0, 10)
            wind_direction = random.uniform(0, 360)

            context[0].setValues(3, WEATHER_REGISTERS["temperature"][0], [int(temperature * 100)])
            context[0].setValues(3, WEATHER_REGISTERS["humidity"][0], [int(humidity * 100)])
            context[0].setValues(3, WEATHER_REGISTERS["wind_speed"][0], [int(wind_speed * 100)])
            context[0].setValues(3, WEATHER_REGISTERS["wind_direction"][0], [int(wind_direction)])

            log.debug(f"Updated weather registers: temperature={temperature}, humidity={humidity}")
        except Exception as e:
            log.error(f"Error updating weather registers: {e}")
        time.sleep(5)

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
        time.sleep(5)

def update_ultrasonic_registers(context):
    while True:
        try:
            ultrasonic_value = random.randint(0, 1000)
            context[0].setValues(3, ULTRASONIC_REGISTER, [ultrasonic_value])
            log.debug(f"Updated ultrasonic register: value={ultrasonic_value}")
        except Exception as e:
            log.error(f"Error updating ultrasonic registers: {e}")
        time.sleep(5)

def update_pressure_sensor_registers(context):
    while True:
        try:
            pressure_value = random.randint(0, 1000)
            context[0].setValues(3, PRESSURE_SENSOR_REGISTER, [pressure_value])
            log.debug(f"Updated pressure sensor register: value={pressure_value}")
        except Exception as e:
            log.error(f"Error updating pressure sensor registers: {e}")
        time.sleep(5)

def update_ahrs_gps_registers(context):
    while True:
        try:
            roll = int((random.uniform(-180, 180) / 180.0) * 32768)
            pitch = int((random.uniform(-90, 90) / 180.0) * 32768)
            yaw = int((random.uniform(0, 360) / 180.0) * 32768)
            longitude = int(random.uniform(-180, 180) * 1000000)
            latitude = int(random.uniform(-90, 90) * 1000000)
            altitude = int(random.uniform(0, 10000) * 10)
            heading = int(random.uniform(0, 360) * 100)
            ground_speed = int(random.uniform(0, 100) * 100)
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

            log.error(f"Updated AHRS/GPS registers: roll={roll}, pitch={pitch}, yaw={yaw}, "
                      f"longitude={longitude}, latitude={latitude}, altitude={altitude}, "
                      f"heading={heading}, ground_speed={ground_speed}, pdop={pdop}, hdop={hdop}, vdop={vdop}")
        except Exception as e:
            log.error(f"Error updating AHRS/GPS registers: {e}")
        time.sleep(1)

def update_relay_registers(context):
    while True:
        try:
            blower_state = random.randint(0, 1)
            strobe_light_state = random.randint(0, 1)
            payload_power_state = random.randint(0, 1)
            context[0].setValues(1, RELAY_REGISTERS["blower"], [blower_state])
            context[0].setValues(1, RELAY_REGISTERS["strobe_light"], [strobe_light_state])
            context[0].setValues(1, RELAY_REGISTERS["payload_power"], [payload_power_state])
            log.debug(f"Updated relay registers: blower={blower_state}, strobe_light={strobe_light_state}, payload_power={payload_power_state}")
        except Exception as e:
            log.error(f"Error updating relay registers: {e}")
        time.sleep(5)

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
        time.sleep(1)

# Start servers with their respective update routines
def start_servers():
    contexts = {
        "load_cell": ModbusServerContext(slaves=create_data_store(), single=True),
        "ultrasonic": ModbusServerContext(slaves=create_data_store(), single=True),
        "weather_station": ModbusServerContext(slaves=create_data_store(), single=True),
        "pressure_sensor": ModbusServerContext(slaves=create_data_store(), single=True),
        "ahrs": ModbusServerContext(slaves=create_data_store(), single=True),
        "temp_humidity": ModbusServerContext(slaves=create_data_store(), single=True),
        "relay": ModbusServerContext(slaves=create_data_store(), single=True)
    }

    run_modbus_server_with_update(PORTS["LOAD_CELL_PORT"], contexts["load_cell"], update_load_cell_registers)
    run_modbus_server_with_update(PORTS["ULTRASONIC_PORT"], contexts["ultrasonic"], update_ultrasonic_registers)
    run_modbus_server_with_update(PORTS["WEATHER_STATION_PORT"], contexts["weather_station"], update_weather_registers)
    run_modbus_server_with_update(PORTS["BALLONET_PRESSURE_PORT"], contexts["pressure_sensor"], update_pressure_sensor_registers)
    run_modbus_server_with_update(PORTS["HULL_PRESSURE_PORT"], contexts["pressure_sensor"], update_pressure_sensor_registers)
    run_modbus_server_with_update(PORTS["AHRS_PORT"], contexts["ahrs"], update_ahrs_gps_registers)
    run_modbus_server_with_update(PORTS["TEMP_HUMIDITY_TCP_PORT"], contexts["temp_humidity"], update_temp_humidity_registers)
    run_modbus_server_with_update(PORTS["RELAY_PORT"], contexts["relay"], update_relay_registers)

if __name__ == "__main__":
    log.info("Starting servers and update routines")
    start_servers()
    while True:
        time.sleep(1)