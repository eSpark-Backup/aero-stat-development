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
        dataToWrite = std::make_shared<relayWriteData>();
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

    bool writeData(const std::shared_ptr<void>& data) override {
        // Implementation for writing data
        if (data) {
            auto value = std::static_pointer_cast<relayWriteData>(data);
            // Write `value` to the sensor
            dataToWrite->relayStates[0] = value->relayStates[0];
            dataToWrite->relayStates[1] = value->relayStates[1];
            dataToWrite->relayStates[2] = value->relayStates[2];
            dataToWrite->relayStates[3] = value->relayStates[3];
            return true;
        }
        return false; // Indicate failure
    }    


private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<relayData> data;
    std::shared_ptr<relayWriteData> dataToWrite;
};

#endif //RELAY_MODBUS_SENSOR_H