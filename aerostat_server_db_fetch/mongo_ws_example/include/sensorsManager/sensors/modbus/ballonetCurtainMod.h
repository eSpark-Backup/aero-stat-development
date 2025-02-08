#ifndef BALLONET_CURTAIN_MODBUS_SENSOR_H
#define BALLONET_CURTAIN_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class BallonetCurtainMod : public Sensor {
public:
    BallonetCurtainMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<ballonetCurtainData>();
        mb_ultrasonic = new modbus(cp.ip, stoi(cp.port));
        ultrasonic_client = mb_ultrasonic->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "ultrasonic_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<BallonetCurtainMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        cloudLogger& logger = cloudLogger::getInstance();
        std::vector<std::string> results = logger.cloudDb.query("ballonet_curtain_height_sensor_readings"); //pass collection name
        for (const auto& result : results) {
            LOG_SUCCESS("DATA = %s", result.c_str());

            json json_doc = nlohmann::json::parse(result);

            if (json_doc.contains("value")) {
                double balCurtainHeightValue = json_doc["value"].get<double>();
                LOG_DEBUG("Ballonet Curtain Height : %f", balCurtainHeightValue);
                data->height = balCurtainHeightValue;               
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
    std::shared_ptr<ballonetCurtainData> data;
    modbus *mb_ultrasonic;
    bool ultrasonic_client = false;

    float read_ultrasonic() {
        uint16_t regs[1];

        if (!mb_ultrasonic->modbus_read_holding_registers(ULTRASONIC_REGISTER, 1, regs)) {
            // Convert raw register value to distance in meters
            return regs[0] / 1000.0;
        } else {
            std::cerr << "Invalid ultrasonic response.\n";
            return -1.0f;  // Return an error value
        }
    }
};

#endif //BALLONET_CURTAIN_MODBUS_SENSOR_H