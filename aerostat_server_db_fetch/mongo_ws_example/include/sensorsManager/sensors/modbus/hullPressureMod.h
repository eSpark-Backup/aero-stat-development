#ifndef HULL_PRESSURE_MODBUS_SENSOR_H
#define HULL_PRESSURE_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class HulltPressureMod : public Sensor {
public:
    HulltPressureMod(const std::string& name, sensorInterfaceType interfaceType) : Sensor(interfaceType) , name_(name) {}

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "hull_pressure_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType) { return std::make_shared<HulltPressureMod>(name, interfaceType); }
        );
    }

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<hullPressureData>();

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disPressure(0.0, 360.0);
        
        // Assign random values to the fields
        data->hullPressure = disPressure(gen);
        data->status = "connected";

        return data;
    }

private:
    std::string name_;
};

#endif //HULL_PRESSURE_MODBUS_SENSOR_H