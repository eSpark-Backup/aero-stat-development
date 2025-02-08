#ifndef WEATHER_STATION_MOD_SENSOR_H
#define WEATHER_STATION_MOD_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorFactory.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/modbusConnectionManager.h"
#include "logger/trace_util.h"
#include "modbus_lib/modbus.h"
#include "logger/cloudLogger.h"

std::map<std::string, RegisterInfo> WEATHER_REGISTERS = {
    {"wind_direction", {WIND_DIRECTION_REGISTER, 1, "int"}},
    {"wind_speed", {WIND_SPEED_REGISTER, 2, "float"}},
    {"temperature", {WIND_TEMPERATURE_REGISTER, 2, "float"}},
    {"humidity", {WIND_HUMIDITY_REGISTER, 2, "float"}},
    {"air_pressure", {AIR_PRESSURE_REGISTER, 2, "float"}}
};

class WeatherStationMod : public Sensor {
public:
    WeatherStationMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<weatherStationTcpData>();
        mb_weatherstation = new modbus(cp.ip, stoi(cp.port));
        mb_weatherstation->modbus_set_slave_id(3);
        weather_station_client = mb_weatherstation->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "weather_station_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<WeatherStationMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> disHeading(0.0, 360.0);
        // std::uniform_real_distribution<> disPressure(900.0, 1100.0);
        // std::uniform_real_distribution<> disTemp(-30.0, 50.0);
        // std::uniform_real_distribution<> disWindAngle(0.0, 360.0);
        // std::uniform_real_distribution<> disWindSpeed(0.0, 50.0);
        
        // // Assign random values to the fields
        // data->humidity = disHeading(gen);
        // data->barometricPressure = disPressure(gen);
        // data->airTemperature = disTemp(gen);
        // data->windAngle = disWindAngle(gen);
        // data->windSpeed = disWindSpeed(gen);
        // data->status = "connected";

        // if(!weather_station_client)
        // {
        //     data->status = "disconnected";
        //     return data;
        // }

        // /* Modbus reading routine */
        // ModbusConnectionManager& modbusConn = ModbusConnectionManager::getInstance();
        // for (const auto& [key, reg_info] : WEATHER_REGISTERS) {
        //     uint16_t regs[2] = {0}; // Buffer to store register values

        //     if (!mb_weatherstation->modbus_read_holding_registers(reg_info.address, reg_info.count, regs)) {
        //         // Successfully read Modbus registers
        //         if (reg_info.data_type == "int") {
        //             int value = regs[0]; // Assume single register for int
        //             if (key == "wind_direction") {
        //                 data->windAngle = static_cast<float>(value);
        //             }
        //         } else if (reg_info.data_type == "float") {
        //             float value = modbusConn.convert_to_float(regs); // Convert two registers to float
        //             if (key == "wind_speed") {
        //                 data->windSpeed = value;
        //             } else if (key == "temperature") {
        //                 data->airTemperature = value;
        //             } else if (key == "humidity") {
        //                 data->humidity = value;
        //             } else if (key == "air_pressure") {
        //                 data->barometricPressure = value;
        //             }
        //         }
        //     } else {
        //         // Log error and continue with other registers
        //         std::cerr << "Error reading " << key << " register.\n";
        //     }
        // }

        // if (data->windAngle || data->windSpeed || data->airTemperature || data->barometricPressure || data->humidity) {
        //     data->status = "connected";
        // } else {
        //     data->status = "disconnected";
        // }

        cloudLogger& logger = cloudLogger::getInstance();
        // logger.cloudDb.insert("TABLE", data->toJson().dump());
        std::vector<std::string> results = logger.cloudDb.query("weather_sensor_readings"); //pass collection name
        for (const auto& result : results) {
            LOG_SUCCESS("DATA = %s", result.c_str());

            json json_doc = nlohmann::json::parse(result);

            if (json_doc.contains("value")) {
                json value = json_doc["value"];

                // Extract wind direction
                if (value.contains("wind_direction")) {
                    double wind_direction = value["wind_direction"]["value"].get<double>();
                    std::string wind_direction_unit = value["wind_direction"]["unit"].get<std::string>();
                    LOG_DEBUG("Wind Direction: %.2f %s", wind_direction, wind_direction_unit.c_str());
                    // data->windAngle = wind_direction - normalizedAerostatHeading; //TODO: Normalization
                    data->windAngle = wind_direction;
                }

                // Extract wind speed
                if (value.contains("wind_speed")) {
                    double wind_speed = value["wind_speed"]["value"].get<double>();
                    std::string wind_speed_unit = value["wind_speed"]["unit"].get<std::string>();
                    // std::cout << "Wind Speed: " << wind_speed << " " << wind_speed_unit << std::endl;
                    LOG_DEBUG("Wind Speed: %.2f %s", wind_speed, wind_speed_unit.c_str());
                    data->windSpeed= wind_speed;
                }

                // Extract outside air temperature
                if (value.contains("outside_air_temperature")) {
                    double outside_air_temperature = value["outside_air_temperature"]["value"].get<double>();
                    std::string temperature_unit = value["outside_air_temperature"]["unit"].get<std::string>();
                    // std::cout << "Outside Air Temperature: " << outside_air_temperature << " " << temperature_unit << std::endl;
                    LOG_DEBUG("Outside Air Temperature: %.2f %s", outside_air_temperature, temperature_unit.c_str());
                    data->airTemperature = outside_air_temperature;
                }

                // Extract outside air humidity
                if (value.contains("outside_air_humidity")) {
                    double outside_air_humidity = value["outside_air_humidity"]["value"].get<double>();
                    std::string humidity_unit = value["outside_air_humidity"]["unit"].get<std::string>();
                    // std::cout << "Outside Air Humidity: " << outside_air_humidity << " " << humidity_unit << std::endl;
                    LOG_DEBUG("Outside Air Humidity: %.2f %s", outside_air_humidity, humidity_unit.c_str());
                    data->humidity = outside_air_humidity;
                }

                // Extract outside air pressure
                if (value.contains("outside_air_pressure")) {
                    double outside_air_pressure = value["outside_air_pressure"]["value"].get<double>();
                    std::string pressure_unit = value["outside_air_pressure"]["unit"].get<std::string>();
                    // std::cout << "Outside Air Pressure: " << outside_air_pressure << " " << pressure_unit << std::endl;
                    LOG_DEBUG("Outside Air Pressure: %.2f %s", outside_air_pressure, pressure_unit.c_str());
                    data->barometricPressure = outside_air_pressure;
                }
            } else {
                // std::cout << "'value' field not found in the JSON" << std::endl;
                LOG_ERROR("value field not found in the JSON");
            }
        }
        
        return data;
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<weatherStationTcpData> data;
    modbus *mb_weatherstation;
    bool weather_station_client = false;
};

#endif //WEATHER_STATION_MOD_SENSOR_H