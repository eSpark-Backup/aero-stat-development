#ifndef BALLONET_PRESSURE_MODBUS_SENSOR_H
#define BALLONET_PRESSURE_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class BallonetPressureMod : public Sensor {
public:
    BallonetPressureMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<ballonetPressureData>();
        mb_ballonet = new modbus(cp.ip, stoi(cp.port));
        ballonet_pressure_client = mb_ballonet->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "ballonet_pressure_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<BallonetPressureMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        cloudLogger& logger = cloudLogger::getInstance();
        std::vector<std::string> results = logger.cloudDb.query("ballonet_pressure_sensor_readings"); //pass collection name
        for (const auto& result : results) {
            LOG_SUCCESS("DATA = %s", result.c_str());

            json json_doc = nlohmann::json::parse(result);

            if (json_doc.contains("value")) {
                double balPressureValue = json_doc["value"].get<double>();
                LOG_DEBUG("Ballonet Pressure : %f", balPressureValue);
                data->pressure = balPressureValue;               
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
    std::shared_ptr<ballonetPressureData> data;
    modbus *mb_ballonet;
    bool ballonet_pressure_client = false;

};

#endif //BALLONET_PRESSURE_MODBUS_SENSOR_H