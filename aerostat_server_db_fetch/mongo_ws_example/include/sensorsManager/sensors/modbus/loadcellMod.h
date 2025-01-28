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
        mb_loadcell = new modbus(cp.ip, stoi(cp.port));
        load_cell_client = mb_loadcell->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "load_cell_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<LoadcellMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {
        // // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> disWeight(0.0, 360.0);
        
        // // Assign random values to the fields
        // data->tension = disWeight(gen);
        // if(data->tension > data->maxTension)
        // {
        //     data->maxTension = data->tension;
        // }
        // data->status = "connected";
        // // data->print();

        if(!load_cell_client)
        {
            data->status = "disconnected";
            return data;
        }

        /* orignal server reading routine */
        uint16_t regs[2];

        if (!mb_loadcell->modbus_read_holding_registers(LOAD_CELL_REGISTER, 2, regs)) {
            int16_t high_value = regs[0];
            int16_t low_value = regs[1];

            // Calculate weight
            double differential_value = high_value - low_value;
            const double max_raw_value = 65535.0;
            const double scaling_adjustment = 3.4;
            const double max_weight = 2000.0;

            double adjusted_max_weight = max_weight * scaling_adjustment;
            double weight = (differential_value / max_raw_value) * adjusted_max_weight;

            data->tension = weight;
            if(data->tension > data->maxTension)
            {
                data->maxTension = data->tension;
            }
        } else {
            std::cerr << "Invalid load cell response.\n";
        }       

        return data;
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<loadcellData> data;
    modbus *mb_loadcell;
    bool load_cell_client = false;
    
};

#endif //LOADCELL_MODBUS_SENSOR_H