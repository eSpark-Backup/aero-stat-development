#ifndef BALLONET_PRESSURE_TCP_SENSOR_H
#define BALLONET_PRESSURE_TCP_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class BallonetPressureTcp : public Sensor {
public:
    BallonetPressureTcp(const std::string& name, sensorInterfaceType interfaceType) : Sensor(interfaceType) , name_(name) {}

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "ballonet_pressure_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType) { return std::make_shared<BallonetPressureTcp>(name, interfaceType); }
        );
    }

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<ballonetPressureData>();

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disPressure(0.0, 360.0);
        
        // Assign random values to the fields
        data->pressure = disPressure(gen);
        data->status = "connected";

        return data;
    }

private:
    std::string name_;
};

#endif //BALLONET_PRESSURE_TCP_SENSOR_H