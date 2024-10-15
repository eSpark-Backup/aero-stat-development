#ifndef HELIUMPRESSURE_H
#define HELIUMPRESSURE_H

#include <optional>
#include <sstream>

struct ParsedData_HP {
    float HelPressure;

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
