#ifndef SENSOR_BASE_H
#define SENSOR_BASE_H

// Base Sensor class (abstract)
#include <memory>


struct SensorData {
    virtual ~SensorData() = default;
    virtual std::map<std::string, std::string> toMap() const = 0; // Convert data to a map
    virtual void print() const = 0;
};

class Sensor {
public:
    virtual ~Sensor() = default;

    // Abstract method to read data from the sensor
    virtual std::shared_ptr<void> readData() const = 0;  // Return type is shared_ptr to void for flexibility
};


#endif //SENSOR_BASE_H