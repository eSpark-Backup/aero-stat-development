#ifndef ADAMS_SENSOR_H
#define ADAMS_SENSOR_H

#include <optional>
#include <sstream>

struct ParsedData_AS {
    double Tension = 0.0;
    double MaxTension = 0.0;

    std::string toString() const {
        std::ostringstream oss;
        oss << "Heading: " << Tension
            << ", Barometric Pressure: " << MaxTension;
        return oss.str();
    }
};

class AdamsSensor {
public:
    ParsedData_AS readAdamsSensorData(const std::string& nmeaData);
};

#endif //ADAMS_SENSOR_H
