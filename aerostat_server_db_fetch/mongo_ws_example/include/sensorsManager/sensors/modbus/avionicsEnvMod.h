#ifndef AVIONICS_ENV_MODBUS_SENSOR_H
#define AVIONICS_ENV_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class AvionicsEnvMod : public Sensor {
public:
    AvionicsEnvMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<avionicsEnvData>();
        mb_temp_humidity = new modbus(cp.ip, stoi(cp.port));
        temp_humidity_client = mb_temp_humidity->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "temp_humidity_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) { return std::make_shared<AvionicsEnvMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        cloudLogger& logger = cloudLogger::getInstance();
        std::vector<std::string> results = logger.cloudDb.query("avionics_environment_sensor_readings"); //pass collection name
        for (const auto& result : results) {
            LOG_SUCCESS("DATA = %s", result.c_str());

            json json_doc = nlohmann::json::parse(result);

            if (json_doc.contains("value")) {
                double avionicsHumidityValue = json_doc["value"]["humidity"].get<double>();
                double avionicsTemperatureValue = json_doc["value"]["temperature"].get<double>();
                LOG_DEBUG("Avionic Humidity : %f", avionicsHumidityValue);
                LOG_DEBUG("Avionic Temperature : %f", avionicsTemperatureValue);
                data->temperature = avionicsTemperatureValue;
                data->humidity= avionicsHumidityValue;
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
    std::shared_ptr<avionicsEnvData> data;
    modbus* mb_temp_humidity;
    bool temp_humidity_client = false;

};

#endif //AVIONICS_ENV_MODBUS_SENSOR_H