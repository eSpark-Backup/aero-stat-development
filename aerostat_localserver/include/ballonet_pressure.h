#ifndef BALLONETPRESSURE_H
#define BALLONETPRESSURE_H

#include <optional>
#include <sstream>

#define BALPRES_OFFSET 0

struct ParsedData_BP {
    float BalPressure;
    uint8_t flag;
    
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
