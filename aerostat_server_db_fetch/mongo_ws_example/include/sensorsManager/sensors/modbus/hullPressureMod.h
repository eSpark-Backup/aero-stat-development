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
        mb_hull = new modbus(cp.ip, stoi(cp.port));
        hull_pressure_client = mb_hull->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "hull_pressure_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<HulltPressureMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> disPressure(0.0, 360.0);
        
        // // Assign random values to the fields
        // data->hullPressure = disPressure(gen);
        // data->status = "connected";

        if(!hull_pressure_client)
        {
            data->status = "disconnected";
            return data;
        }

        {
            uint16_t regs[1];  // To store the register values
            // Read the pressure register using modbus_read_holding_registers
            if (mb_hull->modbus_read_holding_registers(PRESSURE_SENSOR_REGISTER, 1, regs) == -1) {
                std::cerr << "Error reading pressure register\n";
                data->hullPressure = 0;
                return data;
            }

            // Convert the register value to pressure in kPa
            float pressure_kpa = regs[0] / 1000.0f;
            
            // Convert kPa to inWG using the scaling factor
            float pressure_inwg = pressure_kpa * PRESSURE_SCALING_FACTOR;

            data->hullPressure = pressure_inwg;
        }

        /* from orignal server */
        {
            uint16_t regs[1];  // To store the register values
            // Read the pressure register using modbus_read_holding_registers
            if (mb_hull->modbus_read_holding_registers(PRESSURE_SENSOR_REGISTER, 1, regs) == -1) {
                std::cerr << "Error reading pressure register\n";
                data->hullPressure = 0;
                return data;
            }

            // Convert the register value to pressure in kPa
            float pressure_kpa = regs[0] / 1000.0f;
            
            // Convert kPa to inWG using the scaling factor
            float pressure_inwg = pressure_kpa * PRESSURE_SCALING_FACTOR;

            data->hullPressure = pressure_inwg;
        }

        return data;
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<hullPressureData> data;
    modbus *mb_hull;
    bool hull_pressure_client = false;

};

#endif //HULL_PRESSURE_MODBUS_SENSOR_H