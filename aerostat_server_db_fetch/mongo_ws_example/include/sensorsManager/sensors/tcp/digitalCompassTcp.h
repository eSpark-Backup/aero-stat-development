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
    DigitalCompassTcp(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<digitalCompassData>();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "digital_compass_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<DigitalCompassTcp>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

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
        data->status = "connected";

        return data;
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<digitalCompassData> data;
};

#endif //DIGITAL_COMPASS_TCP_SESNOR_H