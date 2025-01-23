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
    BallonetCurtainMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {}

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "ultrasonic_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<BallonetCurtainMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<ballonetCurtainData>();

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disHeight(0.0, 360.0);
        
        // Assign random values to the fields
        data->height = disHeight(gen);
        data->status = "connected";

        return data;
    }

private:
    std::string name_;
    std::string ip_;
};

#endif //BALLONET_CURTAIN_MODBUS_SENSOR_H