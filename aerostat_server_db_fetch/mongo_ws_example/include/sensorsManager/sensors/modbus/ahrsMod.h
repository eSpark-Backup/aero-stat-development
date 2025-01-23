#ifndef AHRS_MODBUS_SENSOR_H
#define AHRS_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class AhrsMod : public Sensor {
public:
    AhrsMod(const std::string& name, sensorInterfaceType interfaceType) : Sensor(interfaceType) , name_(name) {}

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "ahrs_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType) { return std::make_shared<AhrsMod>(name, interfaceType); }
        );
    }

    std::shared_ptr<void> readData() const override {
        auto data = std::make_shared<ahrsData>();

        // Random number generation setup
        std::random_device rd;
        std::mt19937 gen(rd());
        
        // For floating point range [min, max]
        std::uniform_real_distribution<> disroll(0.0, 300);
        std::uniform_real_distribution<> dispitch(0.0, 300);
        std::uniform_real_distribution<> disyaw(0.0, 300);
        std::uniform_real_distribution<> dislongitude(0.0, 300);
        std::uniform_real_distribution<> dislatitude(0.0, 300);
        std::uniform_real_distribution<> disaltitude(0.0, 300);
        std::uniform_real_distribution<> disheading(0.0, 300);
        std::uniform_real_distribution<> disground_speed(0.0, 300);
        std::uniform_real_distribution<> dispdop(0.0, 300);
        std::uniform_real_distribution<> dishdop(0.0, 300);
        std::uniform_real_distribution<> disvdop(0.0, 300);
        std::uniform_real_distribution<> disposition_accuracy(0.0, 300);
        
        // Assign random values to the fields
        data->roll = disroll(gen);
        data->pitch = dispitch(gen);
        data->yaw = disyaw(gen);
        data->longitude = dislongitude(gen);
        data->latitude = dislatitude(gen);
        data->altitude = disaltitude(gen);
        data->heading = disheading(gen);
        data->ground_speed = disground_speed(gen);
        data->pdop = dispdop(gen);
        data->hdop = dishdop(gen);
        data->vdop = disvdop(gen);
        data->position_accuracy = disposition_accuracy(gen);
        data->status = "connected";
        return data;
    }

private:
    std::string name_;
};

#endif //AHRS_MODBUS_SENSOR_H