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
    LoadcellMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<loadcellData>();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "load_cell_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<LoadcellMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {
        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disWeight(0.0, 360.0);
        
        // Assign random values to the fields
        data->tension = disWeight(gen);
        if(data->tension > data->maxTension)
        {
            data->maxTension = data->tension;
        }
        data->status = "connected";
        // data->print();

        return data;
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<loadcellData> data;
};

#endif //LOADCELL_MODBUS_SENSOR_H