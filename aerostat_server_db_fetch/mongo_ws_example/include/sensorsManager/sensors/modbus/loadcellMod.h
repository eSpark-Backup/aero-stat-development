#ifndef LOADCELL_MODBUS_SENSOR_H
#define LOADCELL_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class LoadcellMod : public Sensor {
public:
    LoadcellMod(const std::string& name, sensorInterfaceType interfaceType) : Sensor(interfaceType) , name_(name) {}

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "load_cell_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType) { return std::make_shared<LoadcellMod>(name, interfaceType); }
        );
    }

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<loadcellData>();

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disWeight(0.0, 360.0);
        
        // Assign random values to the fields
        data->weight = disWeight(gen);
        data->status = "connected";

        return data;
    }

private:
    std::string name_;
};

#endif //LOADCELL_MODBUS_SENSOR_H