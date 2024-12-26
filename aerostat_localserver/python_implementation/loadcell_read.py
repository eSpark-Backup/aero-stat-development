from pymodbus.client.sync import ModbusTcpClient

# Client configuration
client = ModbusTcpClient('localhost', port=5005)
LOAD_CELL_REGISTER = 0x9C40
# Read two registers (16 bits each) from the load cell
try:
    response = client.read_holding_registers(LOAD_CELL_REGISTER, 2, slave=1)
    if not response.isError():
        load_cell_high, load_cell_low = response.registers
        load_cell_value = (load_cell_high << 16) | load_cell_low
        print(f"Load cell value: {load_cell_value}")
    else:
        print(f"Error reading load cell data: {response}")
except Exception as e:
    print(f"Error reading load cell data: {e}")

client.close()