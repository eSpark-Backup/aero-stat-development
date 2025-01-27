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
    HulltPressureMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<hullPressureData>();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "hull_pressure_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<HulltPressureMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

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
    std::string ip_;
    std::shared_ptr<hullPressureData> data;
};

#endif //HULL_PRESSURE_MODBUS_SENSOR_H