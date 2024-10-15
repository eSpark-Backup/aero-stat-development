#ifndef ADAMS_SENSOR_H
#define ADAMS_SENSOR_H

#include <optional>
#include <sstream>

struct ParsedData_AS {
    float Tension = 0.0;
    float MaxTension = 0.0;

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
};

#endif //ADAMS_SENSOR_H
