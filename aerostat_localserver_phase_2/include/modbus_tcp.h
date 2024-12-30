#ifndef MODBUS_TCP_H
#define MODBUS_TCP_H
#include <string>
#include <unordered_map>
#include "modbus.h"

#define WINDOWS

struct WeatherParameter {
    float value;           // Value of the parameter
    std::string unit;      // Unit of the parameter
};

struct TempHumidityData {
    float temperature;
    float humidity;
};

struct AhrsGpsData {
    float roll;
    float pitch;
    float yaw;
    float longitude;
    float latitude;
    float altitude;
    float heading;
    float ground_speed;
    float pdop;
    float hdop;
    float vdop;
    float position_accuracy;
};

class Modbus_TCP {
public:
Modbus_TCP(){}
~Modbus_TCP(){}
void initSensors();
void start_readings();
void read_load_cell_thread();
void read_ultrasonic_thread();
void read_weather_station_thread();
void read_pressure_sensor_thread();
void read_ahrs_gps_thread();
void set_host(std::string __host);
bool is_connected();

double read_load_cell();
float read_ultrasonic();
std::unordered_map<std::string, WeatherParameter> read_weather_station();
AhrsGpsData read_ahrs_gps_data();
TempHumidityData read_temp_humidity_data();
float read_pressure();

private:
modbus *mb_loadcell;
modbus *mb_ultrasonic;
modbus *mb_weatherstation;
modbus *mb_ballonet;
modbus *mb_hull;
modbus *mb_ahrs;
modbus *mb_temp_humidity;

bool load_cell_client;
bool ultrasonic_client;
bool weather_station_client;
bool ballonet_pressure_client;
bool hull_pressure_client;
bool ahrs_client;
bool temp_humidity_client;

bool running =false;
std::string host;
int hull_pressure_port = 5001;
int ballonet_pressure = 5002;
int ahrs_port = 5003;
int ultrasonic_port = 5004;
int load_cell_port = 5005;
int temp_humidity_port = 5006;
int weather_station_port = 5007;

float convert_to_float(uint16_t regs[2]);
float calculate_position_accuracy(float pdop, float hdop, float vdop) ;
};

#endif //MODBUS_TCP