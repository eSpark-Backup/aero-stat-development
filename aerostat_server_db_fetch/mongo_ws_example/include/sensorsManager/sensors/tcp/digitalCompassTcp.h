#ifndef DIGITAL_COMPASS_TCP_SESNOR_H
#define DIGITAL_COMPASS_TCP_SESNOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class DigitalCompassTcp : public Sensor {
public:
    DigitalCompassTcp(const std::string& name, sensorInterfaceType interfaceType) : Sensor(interfaceType) , name_(name) {}

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "digital_compass_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType) { return std::make_shared<DigitalCompassTcp>(name, interfaceType); }
        );
    }

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<digitalCompassData>();

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> dismagheading(0.0, 360.0);
        std::uniform_real_distribution<> dispitch(0.0, 360.0);
        std::uniform_real_distribution<> disroll(0.0, 360.0);
        
        // Assign random values to the fields
        data->magheading = dismagheading(gen);
        data->pitch = dispitch(gen);
        data->roll = disroll(gen);

        return data;
    }

private:
    std::string name_;
};

#endif //DIGITAL_COMPASS_TCP_SESNOR_H