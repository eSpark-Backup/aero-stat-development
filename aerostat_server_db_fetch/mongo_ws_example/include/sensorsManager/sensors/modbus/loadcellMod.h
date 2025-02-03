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
        cloudLogger& logger = cloudLogger::getInstance();
        std::vector<std::string> results = logger.cloudDb.query("lift_sensor_readings"); //pass collection name
        for (const auto& result : results) {
            LOG_SUCCESS("DATA = %s", result.c_str());

            json json_doc = nlohmann::json::parse(result);

            if (json_doc.contains("value")) {
                double tensionValue = json_doc["value"].get<double>();
                LOG_DEBUG("LoadCell Tension : %f", tensionValue);
                data->tension = tensionValue;              
                if(data->tension > data->maxTension)
                {
                    data->maxTension = data->tension;
                }  
            } else {
                std::cout << "'value' field not found in the JSON" << std::endl;
            }
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