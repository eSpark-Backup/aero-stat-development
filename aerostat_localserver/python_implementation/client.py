from pymodbus.client.sync import ModbusTcpClient

WEATHER_REGISTERS = {
    "wind_direction": (0x0001, 1, 'int'),
    "wind_speed": (0x0002, 2, 'float'),
    "temperature": (0x0004, 2, 'float'),
    "humidity": (0x0006, 2, 'float'),
    "air_pressure": (0x0008, 2, 'float')
}

# Create a Modbus client
client = ModbusTcpClient('localhost', port=5007)

# Connect to the server
client.connect()

# Read holding registers (function code 3) for weather data
start_address = WEATHER_REGISTERS["temperature"][0]
num_registers = WEATHER_REGISTERS["temperature"][1]
result = client.read_holding_registers(start_address, num_registers)

# Extract temperature value
if not result.isError():
    temperature = result.registers[0] / 100.0  # Assuming the temperature is stored as an integer with two decimal places
    print(f"Temperature: {temperature} °C")
else:
    print("Error reading temperature register")

# Close the client connection
client.close()