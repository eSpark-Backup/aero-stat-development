#ifndef RELAY_MODBUS_SENSOR_H
#define RELAY_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class RelayMod : public Sensor {
public:
    RelayMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<relayData>();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "relay_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<RelayMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());

        // For binary values [0, 1]
        std::uniform_int_distribution<> disbinary(0, 1);

        // Assign random binary values to the fields
        data->primary_blower_value = disbinary(gen);
        data->secondary_blower_value = disbinary(gen);
        data->strobe_lights_value = disbinary(gen);
        data->payload_power_value = disbinary(gen);
        data->status = "connected";

        return data;
    }

    


private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<relayData> data;
};

#endif //RELAY_MODBUS_SENSOR_H