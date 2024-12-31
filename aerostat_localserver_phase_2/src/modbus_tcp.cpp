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
#define WIND_TEMPERATURE_REGISTER  0x0004
#define WIND_HUMIDITY_REGISTER  0x0006
#define AIR_PRESSURE_REGISTER  0x0008

#define TEMP_HUMIDITY_REGISTER 0x0001
#define HUMIDITY_REGISTER 0x0000

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
    {"temperature", {WIND_TEMPERATURE_REGISTER, 2, "float"}},
    {"humidity", {WIND_HUMIDITY_REGISTER, 2, "float"}},
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
    mb_temp_humidity = new modbus(host, temp_humidity_port);
    mb_relay = new modbus(host, relay_port);

    mb_loadcell->modbus_set_slave_id(1);
    mb_ultrasonic->modbus_set_slave_id(2);
    mb_weatherstation->modbus_set_slave_id(3);
    mb_ballonet->modbus_set_slave_id(4);
    mb_hull->modbus_set_slave_id(5);
    mb_ahrs->modbus_set_slave_id(6);
    mb_temp_humidity->modbus_set_slave_id(7);
    mb_relay->modbus_set_slave_id(8);

    load_cell_client = mb_loadcell->modbus_connect();
    ultrasonic_client = mb_ultrasonic->modbus_connect();
    weather_station_client = mb_weatherstation->modbus_connect();
    ballonet_pressure_client = mb_ballonet->modbus_connect();
    hull_pressure_client = mb_hull->modbus_connect();
    ahrs_client = mb_ahrs->modbus_connect();
    temp_humidity_client = mb_temp_humidity->modbus_connect();
    relay_client = mb_relay->modbus_connect();
}

void Modbus_TCP::start_readings()
{
    if (!running) {
        running = true;
        // Define and start threads
        std::thread loadCellThread(&Modbus_TCP::read_load_cell_thread, this);
        std::thread ultrasonicThread(&Modbus_TCP::read_ultrasonic_thread, this);
        std::thread weatherThread(&Modbus_TCP::read_weather_station_thread, this);
        std::thread ballonetThread(&Modbus_TCP::read_pressure_sensor_thread, this);
        std::thread hullThread(&Modbus_TCP::read_pressure_sensor_thread, this);
        std::thread ahrsThread(&Modbus_TCP::read_ahrs_gps_thread, this);

        // Detach threads
        loadCellThread.detach();
        ultrasonicThread.detach();
        weatherThread.detach();
        ballonetThread.detach();
        hullThread.detach();
        ahrsThread.detach();
    }
}

// Function to read the load cell data once and return the weight
double Modbus_TCP::read_load_cell() {
    uint16_t regs[2];

    if (!mb_loadcell->modbus_read_holding_registers(LOAD_CELL_REGISTER, 2, regs)) {
        int16_t high_value = regs[0];
        int16_t low_value = regs[1];

        // Calculate weight
        double differential_value = high_value - low_value;
        const double max_raw_value = 65535.0;
        const double scaling_adjustment = 3.4;
        const double max_weight = 2000.0;

        double adjusted_max_weight = max_weight * scaling_adjustment;
        double weight = (differential_value / max_raw_value) * adjusted_max_weight;

        return weight;
    } else {
        std::cerr << "Invalid load cell response.\n";
        return -1.0;  // Return an error value
    }
}

// Threaded function to continuously read load cell data
void Modbus_TCP::read_load_cell_thread() {
    std::cout << "Load cell thread started\n";

    while (load_cell_client) {
        double weight = read_load_cell();
        if (weight >= 0) {  // Only store valid weight values
            std::cout << "Weight: " << weight << " kg\n";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }

    std::cout << "Load cell thread ended\n";
}

// Function to read ultrasonic sensor data once and return the distance
float Modbus_TCP::read_ultrasonic() {
    uint16_t regs[1];

    if (!mb_ultrasonic->modbus_read_holding_registers(ULTRASONIC_REGISTER, 1, regs)) {
        // Convert raw register value to distance in meters
        return regs[0] / 1000.0;
    } else {
        std::cerr << "Invalid ultrasonic response.\n";
        return -1.0f;  // Return an error value
    }
}

// Threaded function to continuously read ultrasonic sensor data
void Modbus_TCP::read_ultrasonic_thread() {
    while (ultrasonic_client) {
        float distance = read_ultrasonic();

        if (distance >= 0) {  // Only process valid distance values
            std::cout << "Ultrasonic Distance: " << distance << " m\n";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

float Modbus_TCP::read_pressure() {
    uint16_t regs[1];  // To store the register values

    // Read the pressure register using modbus_read_holding_registers
    if (mb_ballonet->modbus_read_holding_registers(PRESSURE_SENSOR_REGISTER, 1, regs) == -1) {
        std::cerr << "Error reading pressure register\n";
        return -1.0f;  // Return an invalid value on error
    }

    // Convert the register value to pressure in kPa
    float pressure_kpa = regs[0] / 1000.0f;
    
    // Convert kPa to inWG using the scaling factor
    float pressure_inwg = pressure_kpa * PRESSURE_SCALING_FACTOR;

    return pressure_inwg;
}

void Modbus_TCP::read_pressure_sensor_thread()
{
    while (ballonet_pressure_client || hull_pressure_client)
    {
        // Read pressure from the ballonet pressure client if active
        if (ballonet_pressure_client)
        {
            float pressure_inwg = read_pressure();
            if (pressure_inwg != -1.0f) {
                // Process ballonet pressure (if needed)
                std::cout << "Ballonet Pressure: " << pressure_inwg << " inWG\n";
            }
        }

        // Read pressure from the hull pressure client if active
        else if (hull_pressure_client)
        {
            float pressure_inwg = read_pressure();
            if (pressure_inwg != -1.0f) {
                // Process hull pressure (if needed)
                std::cout << "Hull Pressure: " << pressure_inwg << " inWG\n";
            }
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

std::unordered_map<std::string, WeatherParameter> Modbus_TCP::read_weather_station() {
    std::unordered_map<std::string, WeatherParameter> weather_data;

    for (const auto& [key, reg_info] : WEATHER_REGISTERS) {
        uint16_t regs[2] = {0};

        if (!mb_weatherstation->modbus_read_holding_registers(reg_info.address, reg_info.count, regs)) {
            WeatherParameter parameter;
            if (reg_info.data_type == "int") {
                int value = regs[0];
                parameter.value = static_cast<float>(value);
                parameter.unit = ""; // No unit for integer data
            } else if (reg_info.data_type == "float") {
                float value = convert_to_float(regs);
                parameter.value = value;
                parameter.unit = (key == "wind_speed") ? "m/s" :
                                 (key == "temperature") ? "°C" :
                                 (key == "humidity") ? "%" :
                                 (key == "air_pressure") ? "hPa" : "";
            }

            // Store the parameter in the map
            weather_data[key] = parameter;
        } else {
            std::cerr << "Error reading " << key << " register.\n";
        }
    }

    return weather_data;
}

void Modbus_TCP::read_weather_station_thread() {
    while (weather_station_client) {
        // Get the weather data from the station
        auto weather_data = read_weather_station();

        // Print the weather parameters
        for (const auto& [key, parameter] : weather_data) {
            std::cout << key << ": " << parameter.value << " " << parameter.unit << "\n";
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
}

float Modbus_TCP::convert_to_float(uint16_t regs[2])
{
    uint32_t combined = (regs[0] << 16) | regs[1];
    return *reinterpret_cast<float*>(&combined);
}


AhrsGpsData Modbus_TCP::read_ahrs_gps_data() {
    std::map<std::string, uint16_t> data;

    // Read the registers for AHRS GPS data
    for (const auto& [key, reg_info] : AHRS_GPS_REGISTERS) {
        uint16_t regs[1] = {0};
        if (!mb_ahrs->modbus_read_holding_registers(reg_info.address, reg_info.count, regs)) {
            data[key] = regs[0];
        } else {
            std::cerr << "Error reading " << key << " register.\n";
        }
    }

    // Process the data and fill the AhrsGpsData structure
    AhrsGpsData ahrs_gps_data;
    ahrs_gps_data.roll = (data["roll"] / 32768.0f) * 180.0f;
    ahrs_gps_data.pitch = (data["pitch"] / 32768.0f) * 180.0f;
    ahrs_gps_data.yaw = (data["yaw"] / 32768.0f) * 180.0f;
    ahrs_gps_data.longitude = ((data["LonH"] << 16) | data["LonL"]) / 1000000.0f;
    ahrs_gps_data.latitude = ((data["LatH"] << 16) | data["LatL"]) / 1000000.0f;
    ahrs_gps_data.altitude = data["GPSHeight"] / 10.0f;
    ahrs_gps_data.heading = data["GPSYAW"] / 100.0f;
    ahrs_gps_data.ground_speed = ((data["GPSVH"] << 16) | data["GPSVL"]) * 0.01f;
    ahrs_gps_data.pdop = data["PDOP"] / 100.0f;
    ahrs_gps_data.hdop = data["HDOP"] / 100.0f;
    ahrs_gps_data.vdop = data["VDOP"] / 100.0f;
    ahrs_gps_data.position_accuracy = calculate_position_accuracy(ahrs_gps_data.pdop, ahrs_gps_data.hdop, ahrs_gps_data.vdop);

    return ahrs_gps_data;
}

void Modbus_TCP::read_ahrs_gps_thread() {
    while (ahrs_client) {
        // Step 1: Get the AHRS GPS data
        AhrsGpsData ahrs_gps_data = read_ahrs_gps_data();

        // Optional: Print the values (for debugging purposes)
        std::cout << "Roll: " << ahrs_gps_data.roll << "°\n";
        std::cout << "Pitch: " << ahrs_gps_data.pitch << "°\n";
        std::cout << "Yaw: " << ahrs_gps_data.yaw << "°\n";
        std::cout << "Longitude: " << ahrs_gps_data.longitude << "°\n";
        std::cout << "Latitude: " << ahrs_gps_data.latitude << "°\n";
        std::cout << "Altitude: " << ahrs_gps_data.altitude << " m\n";
        std::cout << "Heading: " << ahrs_gps_data.heading << "°\n";
        std::cout << "Ground Speed: " << ahrs_gps_data.ground_speed << " m/s\n";
        std::cout << "PDOP: " << ahrs_gps_data.pdop << "\n";
        std::cout << "HDOP: " << ahrs_gps_data.hdop << "\n";
        std::cout << "VDOP: " << ahrs_gps_data.vdop << "\n";
        std::cout << "Position Accuracy: " << ahrs_gps_data.position_accuracy << "\n";

        // Step 2: Sleep for a while before reading again
        std::this_thread::sleep_for(std::chrono::milliseconds(200));
    }
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


TempHumidityData Modbus_TCP::read_temp_humidity_data() {
    // Data structure to store the result
    TempHumidityData temp_humidity_data;

    // Read the temperature register
    uint16_t temp_regs[1] = {0};
    if (!mb_temp_humidity->modbus_read_holding_registers(TEMP_HUMIDITY_REGISTER, 1, temp_regs)) {
        // Convert to float, assuming that the value in the register is in an appropriate range
        temp_humidity_data.temperature = temp_regs[0] / 10.0f;  // Adjust division as needed
    } else {
        std::cerr << "Error reading temperature register.\n";
        temp_humidity_data.temperature = 0.0f;  // Set default value on error
    }

    // Read the humidity register
    uint16_t hum_regs[1] = {0};
    if (!mb_temp_humidity->modbus_read_holding_registers(HUMIDITY_REGISTER, 1, hum_regs)) {
        // Convert to float, assuming the register value represents humidity in percentage
        temp_humidity_data.humidity = hum_regs[0]  / 10.0f;  // Adjust division as needed
    } else {
        std::cerr << "Error reading humidity register.\n";
        temp_humidity_data.humidity = 0.0f;  // Set default value on error
    }

    // Return the populated data structure
    return temp_humidity_data;
}

bool Modbus_TCP::write_coil(int coil_address, bool value) {
    uint16_t coil_value = value ? 0xFF00 : 0x0000;  // Modbus protocol uses 0xFF00 for ON and 0x0000 for OFF
    if (mb_relay->modbus_write_coil(coil_address, coil_value)) {
        std::cerr << "Error writing to coil at address " << coil_address << ".\n";
        return false;
    }
    return true;
}

bool Modbus_TCP::read_coil(int coil_address, bool &value) {
    bool coil_value = false;
    if (mb_relay->modbus_read_coils(coil_address, 1, &coil_value)) {
        std::cerr << "Error reading coil at address " << coil_address << ".\n";
        return false;
    }
    value = coil_value;
    return true;
}

void Modbus_TCP::set_host(std::string __host){
    host = __host;
}

bool Modbus_TCP::is_connected()
{
    if(host.empty())
    {
        std::cerr << "Host is not configured.\n";
        return false;
    }

    try {
#ifdef _WIN32        
        std::string command = "ping -n 1 -w 1000 " + host;
#else
        std::string command = "ping -c 1 -W 1 " + host;
#endif        
        int return_code = system(command.c_str());

        if (return_code == 0) {
            std::cout << "MODBUS Host " << host << " is reachable." << std::endl;
            return true;
        } else {
            std::cout << "MODBUS Host " << host << " is unreachable." << std::endl;
            return false;
        }
    } catch (const std::exception &e) {
        std::cerr << "Error occurred while pinging " << host << ": " << e.what() << std::endl;
        return false;
    }
}