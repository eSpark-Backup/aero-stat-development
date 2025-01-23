#ifndef SENSOR_FACTORY_H
#define SENSOR_FACTORY_H

#include <functional>
#include <unordered_map>
#include <string>
#include <memory>
#include <stdexcept>
#include "sensorBase.h"

class SensorFactory {
public:
    using SensorCreator = std::function<std::shared_ptr<Sensor>(const std::string&, sensorInterfaceType interfaceType, const ConnectionParams cp)>;

    // Register a sensor type with its creation function
    static SensorFactory& instance() {
        static SensorFactory factory;
        return factory;
    }

    void registerSensorType(const std::string& type, SensorCreator creator) {
        creators_[type] = creator;
    }

    // Create a sensor dynamically based on type
    std::shared_ptr<Sensor> createSensor(sensorInterfaceType interfaceType, const std::string& type, const std::string& port, const ConnectionParams cp) const {
        auto it = creators_.find(type);
        if (it != creators_.end()) {
            return it->second(port, interfaceType, cp);
        }

        throw std::runtime_error("Sensor type '" + type + "' not registered.");
    }

private:
    std::unordered_map<std::string, SensorCreator> creators_; // Map of sensor types to their creators
};


#endif //SENSOR_FACTORY_H