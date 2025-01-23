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
    RelayMod(const std::string& name, sensorInterfaceType interfaceType) : Sensor(interfaceType) , name_(name) {}

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "relay_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType) { return std::make_shared<RelayMod>(name, interfaceType); }
        );
    }

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<relayData>();

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disprimary_blower_value(0, 1);
        std::uniform_real_distribution<> dissecondary_blower_value(0, 1);
        std::uniform_real_distribution<> disstrobe_lights_value(0, 1);
        std::uniform_real_distribution<> dispayload_power_value(0, 1);
        
        // Assign random values to the fields
        data->primary_blower_value = disprimary_blower_value(gen);
        data->secondary_blower_value = dissecondary_blower_value(gen);
        data->strobe_lights_value = disstrobe_lights_value(gen);
        data->payload_power_value = dispayload_power_value(gen);
        data->status = "connected";

        return data;
    }

private:
    std::string name_;
};

#endif //RELAY_MODBUS_SENSOR_H