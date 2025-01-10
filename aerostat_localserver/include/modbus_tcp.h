#ifndef MODBUS_TCP_H
#define MODBUS_TCP_H
#include <string>
#include "modbus.h"

class Modbus_TCP {
public:
void initSensors();
void start_readings();
void read_load_cell();
void read_ultrasonic();
void read_weather_station();
void read_pressure_sensor();
void read_ahrs_gps();

private:
modbus mb_loadcell;
modbus mb_ultrasonic;
modbus mb_weatherstation;
modbus mb_ballonet;
modbus mb_hull;
modbus mb_ahrs;

bool load_cell_client;
bool ultrasonic_client;
bool weather_station_client;
bool ballonet_pressure_client;
bool hull_pressure_client;
bool ahrs_client;

bool running =false;
std::string host = "10.85.5.13";
int load_cell_port = 5001;
int ultrasonic_port = 5002;
int weather_station_port = 5003;
int ballonet_pressure = 5005;
int hull_pressure_port = 5006;
int ahrs_port = 5007;

float convert_to_float(uint16_t regs[2]);
float calculate_position_accuracy(float pdop, float hdop, float vdop) ;
};

#endif //MODBUS_TCP