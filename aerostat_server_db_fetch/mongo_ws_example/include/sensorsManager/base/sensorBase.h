#ifndef SENSOR_BASE_H
#define SENSOR_BASE_H

// Base Sensor class (abstract)
#include <memory>
#include <string>

enum class sensorInterfaceType {
    SENSOR_INT_MODBUS,
    SENSOR_INT_TCP,
    SENSOR_INT_UNKNOWN,
};

struct SensorData {
    virtual ~SensorData() = default;
    virtual std::map<std::string, std::string> toMap() const = 0; // Convert data to a map
    virtual void print() const = 0;
};

struct ConnectionParams {
    std::string ip = "0.0.0.0";
    std::string port = "0000";
};

class Sensor {
public:
    explicit Sensor(sensorInterfaceType interfaceType, const ConnectionParams connectionParameter) 
        : interfaceType_(interfaceType), connectionParams_(connectionParameter) {}

    virtual ~Sensor() = default;
    
    sensorInterfaceType getInterfaceType() const {
        return interfaceType_;
    }

    // Abstract method to read data from the sensor
    virtual std::shared_ptr<void> readData() const = 0;  // Return type is shared_ptr to void for flexibility
    sensorInterfaceType interfaceType_;
    ConnectionParams connectionParams_;
};


#endif //SENSOR_BASE_H