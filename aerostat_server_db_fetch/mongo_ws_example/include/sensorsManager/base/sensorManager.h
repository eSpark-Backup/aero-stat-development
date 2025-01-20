#include <unordered_map>
#include <memory>
#include <string>
#include "sensorsManager/base/sensorBase.h"

class SensorManager {
public:
    static SensorManager& getInstance() {
        static SensorManager instance;
        return instance;
    }

    template <typename T>
    void registerSensor(const std::string& id, const std::string& name) {
        sensors_[id] = std::make_shared<T>(name);
        sensorIDs_.push_back(id);
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
        if (sensor) {
            return sensor->readData();
        }
        return nullptr;
    }

    std::vector<std::string> getSensorIDs() const {
        return sensorIDs_;
    }

private:
    std::unordered_map<std::string, std::shared_ptr<Sensor>> sensors_;
    std::vector<std::string> sensorIDs_;
    SensorManager() = default;
};
