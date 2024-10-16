#ifndef HELIUMPRESSURE_H
#define HELIUMPRESSURE_H

#include <optional>
#include <sstream>

#define HELPRES_OFFSET 0

struct ParsedData_HP {
    float HelPressure;
    uint8_t flag;

    std::string toString() const {
        std::ostringstream oss;
        oss << "Helium Pressure: " << HelPressure;
        return oss.str();
    }
};

class HelPressure {
public:
    ParsedData_HP readHelPressureData(const std::string& nmeaData);
};

#endif //HELIUMPRESSURE_H
