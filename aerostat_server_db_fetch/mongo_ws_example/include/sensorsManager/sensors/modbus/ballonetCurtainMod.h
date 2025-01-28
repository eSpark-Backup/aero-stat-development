#ifndef BALLONET_CURTAIN_MODBUS_SENSOR_H
#define BALLONET_CURTAIN_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class BallonetCurtainMod : public Sensor {
public:
    BallonetCurtainMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<ballonetCurtainData>();
        mb_ultrasonic = new modbus(cp.ip, stoi(cp.port));
        ultrasonic_client = mb_ultrasonic->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "ultrasonic_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<BallonetCurtainMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> disHeight(0.0, 360.0);
        
        // Assign random values to the fields
        if(!ultrasonic_client)
        {
            data->status = "disconnected";
            return data;
        }
        data->height = read_ultrasonic();
        data->status = "connected";

        return data;
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<ballonetCurtainData> data;
    modbus *mb_ultrasonic;
    bool ultrasonic_client = false;

    float read_ultrasonic() {
        uint16_t regs[1];

        if (!mb_ultrasonic->modbus_read_holding_registers(ULTRASONIC_REGISTER, 1, regs)) {
            // Convert raw register value to distance in meters
            return regs[0] / 1000.0;
        } else {
            std::cerr << "Invalid ultrasonic response.\n";
            return -1.0f;  // Return an error value
        }
    }
};

#endif //BALLONET_CURTAIN_MODBUS_SENSOR_H