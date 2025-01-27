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
    AdamSensorTcp(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<adamSensorData>();
        dataToWrite = std::make_shared<fanLightWriteData>();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "adam_sensor_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<AdamSensorTcp>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {
        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disTension(0.0, 360.0);
        
        // Assign random values to the fields
        data->tension = disTension(gen);
        if(data->tension > data->maxTension)
        {
            data->maxTension = data->tension;
        }
        data->status = "connected";
        // data->print();

        return data;
    }

    bool writeData(const std::shared_ptr<void>& data) override {
        // Implementation for writing data
        if (data) {
            auto value = std::static_pointer_cast<fanLightWriteData>(data);
            // Write `value` to the sensor
            dataToWrite->fan_one = value->fan_one;
            dataToWrite->fan_two = value->fan_two;
            dataToWrite->strobe_light = value->strobe_light;
            return true;
        }
        return false; // Indicate failure
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<adamSensorData> data;
    std::shared_ptr<fanLightWriteData> dataToWrite;
};

#endif //ADAM_SENSOR_TCP_H