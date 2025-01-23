#ifndef ADAM_SENSOR_TCP_H
#define ADAM_SENSOR_TCP_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class AdamSensorTcp : public Sensor {
public:
    AdamSensorTcp(const std::string& name, sensorInterfaceType interfaceType) : Sensor(interfaceType) , name_(name) {}

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "adam_sensor_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType) { return std::make_shared<AdamSensorTcp>(name, interfaceType); }
        );
    }

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<adamSensorData>();

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disTension(0.0, 360.0);
        std::uniform_real_distribution<> disMaxTension(0.0, 360.0);
        
        // Assign random values to the fields
        data->tension = disTension(gen);
        data->maxTension = disMaxTension(gen);
        data->status = "connected";

        return data;
    }

private:
    std::string name_;
};

#endif //ADAM_SENSOR_TCP_H