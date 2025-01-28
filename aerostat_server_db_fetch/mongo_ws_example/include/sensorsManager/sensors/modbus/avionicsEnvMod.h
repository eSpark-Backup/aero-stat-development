#ifndef AVIONICS_ENV_MODBUS_SENSOR_H
#define AVIONICS_ENV_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class AvionicsEnvMod : public Sensor {
public:
    AvionicsEnvMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<avionicsEnvData>();
        mb_temp_humidity = new modbus(cp.ip, stoi(cp.port));
        temp_humidity_client = mb_temp_humidity->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "temp_humidity_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) { return std::make_shared<AvionicsEnvMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> distemperature(0.0, 360.0);
        // std::uniform_real_distribution<> dishumidity(0.0, 360.0);
        
        // // Assign random values to the fields
        // data->temperature = distemperature(gen);
        // data->humidity = dishumidity(gen);
        // data->status = "connected";
        if(!temp_humidity_client)
        {
            data->status = "disconnected";
            return data;
        }


        uint16_t temp_regs[1] = {0};
        if (!mb_temp_humidity->modbus_read_holding_registers(TEMP_HUMIDITY_REGISTER, 1, temp_regs)) {
            data->temperature = temp_regs[0] / 10.0f;  // Adjust division as needed
        } else {
            std::cerr << "Error reading temperature register.\n";
            data->temperature = 0.0f;  // Set default value on error
        }

        uint16_t hum_regs[1] = {0};
        if (!mb_temp_humidity->modbus_read_holding_registers(HUMIDITY_REGISTER, 1, hum_regs)) {
            data->humidity = hum_regs[0] / 10.0f;  // Adjust division as needed
        } else {
            std::cerr << "Error reading humidity register.\n";
            data->humidity = 0.0f;  // Set default value on error
        }

        return data;
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<avionicsEnvData> data;
    modbus* mb_temp_humidity;
    bool temp_humidity_client = false;

};

#endif //AVIONICS_ENV_MODBUS_SENSOR_H