#include <unordered_map>
#include <memory>
#include <string>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/base/sensorFactory.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"

class SensorManager {
public:
    static SensorManager& getInstance() {
        static SensorManager instance;
        return instance;
    }

    // template <typename T>
    // void registerSensor(const std::string& id, sensorInterfaceType interfaceType, const std::string& name) {
    //     sensors_[id] = std::make_shared<T>(name, interfaceType);
    //     sensorIDs_.push_back(id);
    // }

    void registerSensor(const std::string& id, sensorInterfaceType interfaceType, const std::string& type, const std::string& port, const std::string& ip) {
        try {
            // Check if the sensor is already registered
            if (sensors_.find(port) != sensors_.end()) {
                LOG_WARNING("Sensor with port: %s, ID : %s,  is already registered. Skipping registration.", port.c_str(), id.c_str());
                return;
            }

            // If not registered, create and register the sensor
            ConnectionParams _cp = {ip, port};
            auto sensor = SensorFactory::instance().createSensor(interfaceType, type, port, _cp);
            sensors_[port] = sensor;
            sensorIDs_.push_back(port);
            LOG_SUCCESS("Registered sensor with ID: %s, type: %s, port: %s, IP : %s", id.c_str(), type.c_str(), port.c_str(), ip.c_str());
        } catch (const std::exception& e) {
            LOG_ERROR("Error registering sensor: %s", (e.what()));
        }
    }

    void unregisterSensor(const std::string& port) {
        try {
            // Check if the sensor exists
            auto it = sensors_.find(port);
            if (it == sensors_.end()) {
                LOG_WARNING("Sensor with port: %s is not registered. Cannot unregister.", port.c_str());
                return;
            }

            // Remove the sensor from the map
            sensors_.erase(it);

            // Remove the port from the sensorIDs_ list
            auto idIt = std::find(sensorIDs_.begin(), sensorIDs_.end(), port);
            if (idIt != sensorIDs_.end()) {
                sensorIDs_.erase(idIt);
            }

            LOG_SUCCESS("Unregistered sensor with port: %s", port.c_str());
        } catch (const std::exception& e) {
            LOG_ERROR("Error unregistering sensor with port: %s. Details: %s", port.c_str(), e.what());
        }
    }


    std::shared_ptr<Sensor> getSensor(const std::string& id) {
        auto it = sensors_.find(id);
        if (it != sensors_.end()) {
            return it->second;
        }
        return nullptr;
    }

    template <typename T>
    std::shared_ptr<void> readSensorData(const std::string& id) {
        auto sensor = getSensor(id);
        // LOG_WARNING("SENSOR IP %s and PORT %s", (sensor->connectionParams_.ip.c_str()), (sensor->connectionParams_.port.c_str()));
        if (sensor) {
            return sensor->readData();
        }
        return nullptr;
    }

    bool writeSensorData(const std::string& id, const std::shared_ptr<void>& data) {
        auto sensor = getSensor(id);
        if (sensor) {
            // Check if the sensor supports writing
            auto readWriteSensor = getSensor(id);
            if (readWriteSensor) {
                return readWriteSensor->writeData(data);
            } else {
                LOG_WARNING("Sensor does not support writing: ID %s", id.c_str());
                return false; // Sensor does not support writing
            }
        }
        LOG_WARNING("Sensor not found: ID %s", id.c_str());
        return false; // Sensor not found
    }

    std::vector<std::string> getSensorIDs() const {
        return sensorIDs_;
    }

private:
    std::unordered_map<std::string, std::shared_ptr<Sensor>> sensors_;
    std::vector<std::string> sensorIDs_;
    SensorManager() = default;
};
