#include <map>
#include <thread>
#include <chrono>
#include <iostream>
#include "modbus_tcp.h"

//Register details
#define LOAD_CELL_REGISTER 0x9C40
#define ULTRASONIC_REGISTER 0x0101
#define PRESSURE_SENSOR_REGISTER 0x0004
#define WIND_DIRECTION_REGISTER  0x0001
#define WIND_SPEED_REGISTER  0x0002
#define TEMPERATURE_REGISTER  0x0004
#define HUMIDITY_REGISTER  0x0006
#define AIR_PRESSURE_REGISTER  0x0008

// AHRS/GPS register addresses
const uint16_t ROLL_REGISTER = 0x3D;
const uint16_t PITCH_REGISTER = 0x3E;
const uint16_t YAW_REGISTER = 0x3F;
const uint16_t LONL_REGISTER = 0x49;
const uint16_t LONH_REGISTER = 0x4A;
const uint16_t LATL_REGISTER = 0x4B;
const uint16_t LATH_REGISTER = 0x4C;
const uint16_t GPS_HEIGHT_REGISTER = 0x4D;
const uint16_t GPS_YAW_REGISTER = 0x4E;
const uint16_t GPS_VL_REGISTER = 0x4F;
const uint16_t GPS_VH_REGISTER = 0x50;
const uint16_t SVNUM_REGISTER = 0x55;
const uint16_t PDOP_REGISTER = 0x56;
const uint16_t HDOP_REGISTER = 0x57;
const uint16_t VDOP_REGISTER = 0x58;

struct RegisterInfoAHRS {
    uint16_t address;
    int count;
};

std::map<std::string, RegisterInfoAHRS> AHRS_GPS_REGISTERS = {
    {"roll", {ROLL_REGISTER, 1}},
    {"pitch", {PITCH_REGISTER, 1}},
    {"yaw", {YAW_REGISTER, 1}},
    {"LonL", {LONL_REGISTER, 1}},
    {"LonH", {LONH_REGISTER, 1}},
    {"LatL", {LATL_REGISTER, 1}},
    {"LatH", {LATH_REGISTER, 1}},
    {"GPSHeight", {GPS_HEIGHT_REGISTER, 1}},
    {"GPSYAW", {GPS_YAW_REGISTER, 1}},
    {"GPSVL", {GPS_VL_REGISTER, 1}},
    {"GPSVH", {GPS_VH_REGISTER, 1}},
    {"PDOP", {PDOP_REGISTER, 1}},
    {"HDOP", {HDOP_REGISTER, 1}},
    {"VDOP", {VDOP_REGISTER, 1}}
};

#define PRESSURE_SCALING_FACTOR 4.01463

struct RegisterInfo {
    int address;
    int count;
    std::string data_type;
};

std::map<std::string, RegisterInfo> WEATHER_REGISTERS = {
    {"wind_direction", {WIND_DIRECTION_REGISTER, 1, "int"}},
    {"wind_speed", {WIND_SPEED_REGISTER, 2, "float"}},
    {"temperature", {TEMPERATURE_REGISTER, 2, "float"}},
    {"humidity", {HUMIDITY_REGISTER, 2, "float"}},
    {"air_pressure", {AIR_PRESSURE_REGISTER, 2, "float"}}
};

// Modbus_TCP::Modbus_TCP() {
//     // Initialize member variables, if necessary
//     load_cell_client = true;
//     ultrasonic_client = true;
//     weather_station_client = true;
//     ballonet_pressure_client = true;
//     hull_pressure_client = true;
//     ahrs_client = true;

//     // Additional setup if required
// }

void Modbus_TCP::initSensors() {
    mb_loadcell = new modbus(host, load_cell_port);
    mb_ultrasonic = new modbus(host, ultrasonic_port);
    mb_weatherstation = new modbus(host, weather_station_port);
    mb_ballonet = new modbus(host, ballonet_pressure);
    mb_hull = new modbus(host, hull_pressure_port);
    mb_ahrs = new modbus(host, ahrs_port);

    mb_loadcell->modbus_set_slave_id(1);
    mb_ultrasonic->modbus_set_slave_id(2);
    mb_weatherstation->modbus_set_slave_id(3);
    mb_ballonet->modbus_set_slave_id(4);
    mb_hull->modbus_set_slave_id(5);
    mb_ahrs->modbus_set_slave_id(6);

    load_cell_client = mb_loadcell->modbus_connect();
    ultrasonic_client = mb_ultrasonic->modbus_connect();
    weather_station_client = mb_weatherstation->modbus_connect();
    ballonet_pressure_client = mb_ballonet->modbus_connect();
    hull_pressure_client = mb_hull->modbus_connect();
    ahrs_client = mb_ahrs->modbus_connect();
}

void Modbus_TCP::start_readings()
{
    if (!running) {
        running = true;
        // Define and start threads
        std::thread loadCellThread(&Modbus_TCP::read_load_cell, this);
        std::thread ultrasonicThread(&Modbus_TCP::read_ultrasonic, this);
        std::thread weatherThread(&Modbus_TCP::read_weather_station, this);
        std::thread ballonetThread(&Modbus_TCP::read_pressure_sensor, this);
        std::thread hullThread(&Modbus_TCP::read_pressure_sensor, this);
        std::thread ahrsThread(&Modbus_TCP::read_ahrs_gps, this);

        // Detach threads
        loadCellThread.detach();
        ultrasonicThread.detach();
        weatherThread.detach();
        ballonetThread.detach();
        hullThread.detach();
        ahrsThread.detach();
    }
}

void Modbus_TCP::read_load_cell()
{
    while (load_cell_client)
    {
        uint16_t regs[2];
        if (!mb_loadcell->modbus_read_holding_registers(LOAD_CELL_REGISTER, 2, regs))
        {
            int16_t high_value = regs[0];
            int16_t low_value = regs[1];

            // Calculate weight
            double differential_value = high_value - low_value;
            const double max_raw_value = 65535.0;
            const double scaling_adjustment = 3.4;
            const double max_weight = 2000.0;

            double adjusted_max_weight = max_weight * scaling_adjustment;
            double weight = (differential_value / max_raw_value) * adjusted_max_weight;
        } else {
            std::cerr << "Invalid load cell response.\n";
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

void Modbus_TCP::read_ultrasonic()
{
    while (ultrasonic_client)
    {
        uint16_t regs[1];
        if (!mb_ultrasonic->modbus_read_holding_registers(ULTRASONIC_REGISTER, 1, regs))
        {
            float distance =  regs[0]/1000.0;
        }
        else
        {
            std::cerr << "Invalid load cell response.\n";
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

void Modbus_TCP::read_pressure_sensor()
{
    while (ballonet_pressure_client || hull_pressure_client)
    {
        uint16_t regs[1];
        if(ballonet_pressure_client)
        {
            if (!mb_ballonet->modbus_read_holding_registers(PRESSURE_SENSOR_REGISTER, 1, regs))
            {
                float pressure_kpa =  regs[0]/1000.0;
                float pressure_inwg = pressure_kpa * PRESSURE_SCALING_FACTOR;
            }
            else
            {
                std::cerr << "Invalid load cell response.\n";
            }
        }
        else if(hull_pressure_client)
        {
            if (!mb_hull->modbus_read_holding_registers(PRESSURE_SENSOR_REGISTER, 1, regs))
            {
                float pressure_kpa =  regs[0]/1000.0;
                float pressure_inwg = pressure_kpa * PRESSURE_SCALING_FACTOR;
            }
            else
            {
                std::cerr << "Invalid load cell response.\n";
            }
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

void Modbus_TCP::read_weather_station()
{
    while (weather_station_client)
    {
        for (const auto& [key, reg_info] : WEATHER_REGISTERS)
        {
            uint16_t regs[2] = {0};
            if (!mb_weatherstation->modbus_read_holding_registers(reg_info.address, reg_info.count, regs))
            {
                if (reg_info.data_type == "int")
                {
                    int value = regs[0];
                    std::cout << key << ": " << value << "°\n";
                } else if (reg_info.data_type == "float")
                {
                    float value = convert_to_float(regs);
                    std::string unit = (key == "wind_speed") ? " m/s" :
                                       (key == "temperature") ? " °C" :
                                       (key == "humidity") ? " %" :
                                       (key == "air_pressure") ? " hPa" : "";

                    std::cout << key << ": " << value << unit << "\n";
                }
            }
            else
            {
                std::cerr << "Error reading " << key << " register.\n";
            }
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

float Modbus_TCP::convert_to_float(uint16_t regs[2])
{
    uint32_t combined = (regs[0] << 16) | regs[1];
    return *reinterpret_cast<float*>(&combined);
}

void Modbus_TCP::read_ahrs_gps()
{
    while (ahrs_client)
    {
        std::map<std::string, uint16_t> data;
        for (const auto& [key, reg_info] : AHRS_GPS_REGISTERS) {
            uint16_t regs[1] = {0};
            if (!mb_ahrs->modbus_read_holding_registers(reg_info.address, reg_info.count, regs)) {
                data[key] = regs[0];
            } else {
                std::cerr << "Error reading " << key << " register.\n";
            }
        }

        float roll = (data["roll"] / 32768.0f) * 180.0f;
        float pitch = (data["pitch"] / 32768.0f) * 180.0f;
        float yaw = (data["yaw"] / 32768.0f) * 180.0f;
        float longitude = ((data["LonH"] << 16) | data["LonL"]) / 1000000.0f;
        float latitude = ((data["LatH"] << 16) | data["LatL"]) / 1000000.0f;
        float altitude = data["GPSHeight"] / 10.0f;
        float heading = data["GPSYAW"] / 100.0f;
        float ground_speed = ((data["GPSVH"] << 16) | data["GPSVL"]) * 0.01f;
        float pdop = data["PDOP"] / 100.0f;
        float hdop = data["HDOP"] / 100.0f;
        float vdop = data["VDOP"] / 100.0f;
        float position_accuracy = calculate_position_accuracy(pdop, hdop, vdop);
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(200));
}

float Modbus_TCP::calculate_position_accuracy(float pdop, float hdop, float vdop) 
{
    const float min_dop = 1.0f;
    const float max_dop = 20.0f;

    float pdop_accuracy = max(0.0f, (min(100.0f, (100.0f - ((pdop - min_dop) / (max_dop - min_dop)) * 100.0f))));
    float hdop_accuracy = max(0.0f, min(100.0f, 100.0f - ((hdop - min_dop) / (max_dop - min_dop)) * 100.0f));
    float vdop_accuracy = max(0.0f, min(100.0f, 100.0f - ((vdop - min_dop) / (max_dop - min_dop)) * 100.0f));

    return min(pdop_accuracy, min(hdop_accuracy, vdop_accuracy));
}
