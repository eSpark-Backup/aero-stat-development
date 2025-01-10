#ifndef ADAMS_SENSOR_H
#define ADAMS_SENSOR_H

#include <optional>
#include <sstream>
#include <stdint.h>

#define TENSION 0
#define MAX_TENSION 1

struct ParsedData_AS {
    std::string status;
    float Tension;
    float MaxTension;
    uint8_t flag;

    std::string toString() const {
        std::ostringstream oss;
        oss << "Tension: " << Tension
            << ", Max Tension: " << MaxTension;
        return oss.str();
    }
};

class AdamsSensor {
public:
    ParsedData_AS readAdamsSensorData(const std::string& nmeaData);
private:
    double max_tension = 0.0;
};

#endif //ADAMS_SENSOR_H
