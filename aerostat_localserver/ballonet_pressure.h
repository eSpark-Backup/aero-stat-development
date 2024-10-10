#ifndef BALLONETPRESSURE_H
#define BALLONETPRESSURE_H

#include <optional>
#include <sstream>

struct ParsedData_BP {
    double BalPressure = 0.0;
    
    std::string toString() const {
        std::ostringstream oss;
        oss << "Ballonet Pressure: " << BalPressure;
        return oss.str();
    }
};

class BalPressure {
public:
    ParsedData_BP readBalPressureData(const std::string& nmeaData);
};

#endif //BALLONETPRESSURE_H
