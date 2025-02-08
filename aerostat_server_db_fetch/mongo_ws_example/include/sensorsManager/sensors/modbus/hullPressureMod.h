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

        cloudLogger& logger = cloudLogger::getInstance();
        std::vector<std::string> results = logger.cloudDb.query("hull_pressure_sensor_readings"); //pass collection name
        for (const auto& result : results) {
            LOG_SUCCESS("DATA = %s", result.c_str());

            json json_doc = nlohmann::json::parse(result);

            if (json_doc.contains("value")) {
                double hullPressureValue = json_doc["value"].get<double>();
                LOG_DEBUG("Hull Pressure : %f", hullPressureValue);
                data->hullPressure = hullPressureValue;               
            } else {
                // std::cout << "'value' field not found in the JSON" << std::endl;
                LOG_ERROR("value field not found in the JSON");
            }
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