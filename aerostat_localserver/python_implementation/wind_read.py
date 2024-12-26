import struct
from pymodbus.client.sync import ModbusTcpClient
import time

# Weather Register Details
WEATHER_REGISTERS = {
    "wind_direction": (0x0001, 1, 'int'),
    "wind_speed": (0x0002, 2, 'float'),
    "temperature": (0x0004, 2, 'float'),
    "humidity": (0x0006, 2, 'float'),
    "air_pressure": (0x0008, 2, 'float')
}

class WeatherStationClient:
    def __init__(self, host, port):
        self.weather_station_client = ModbusTcpClient(host, port=port)
        self.running = True

    def update_label(self, label, value):
        # Placeholder for updating the label in the GUI
        print(f"{label}: {value}")

    def read_weather_station(self):
        while self.running:
            try:
                sensor_data = {}
                for key, (address, count, data_type) in WEATHER_REGISTERS.items():
                    response = self.weather_station_client.read_holding_registers(address, count, slave=1)
                    if not response.isError():
                        if data_type == 'int':
                            value = response.registers[0]
                        elif data_type == 'float':
                            value = struct.unpack('<f', struct.pack('<HH', *response.registers))[0]
                        else:
                            value = None
                        sensor_data[key] = value

                # Updating labels based on available data
                self.update_label("Wind Direction", f"{sensor_data.get('wind_direction', 'N/A')}°")
                self.update_label("Wind Speed", f"{sensor_data.get('wind_speed', 'N/A'):.2f} m/s")
                self.update_label("Temperature", f"{sensor_data.get('temperature', 'N/A'):.2f} °C")
                self.update_label("Humidity", f"{sensor_data.get('humidity', 'N/A'):.2f} %")
                self.update_label("Air Pressure", f"{sensor_data.get('air_pressure', 'N/A'):.2f} hPa")
            except Exception as e:
                print(f"Error reading weather station data: {e}")
                self.update_label("Wind Direction", "Error")
                self.update_label("Wind Speed", "Error")
                self.update_label("Temperature", "Error")
                self.update_label("Humidity", "Error")
                self.update_label("Air Pressure", "Error")
            time.sleep(0.2)

    def start(self):
        if self.weather_station_client.connect():
            self.read_weather_station()
            self.weather_station_client.close()
        else:
            print("Unable to connect to the Modbus server.")

if __name__ == "__main__":
    client = WeatherStationClient('localhost', 5007)
    client.start()