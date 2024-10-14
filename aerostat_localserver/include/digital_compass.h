#ifndef DIGITALCOMPASS_H
#define DIGITALCOMPASS_H

#include <optional>
#include <sstream>

struct ParsedData_DC {
    double Magheading = 0.0;
    double Pitch = 0.0;
    double Roll = 0.0;

    // Convert ParsedData to string
    std::string toString() const {
        std::ostringstream oss;
        oss << "Magnitude Heading: " << Magheading
            << ", Pitch: " << Pitch
            << ", Roll: " << Roll;
        return oss.str();
    }
};

class DigitalCompass {
public:
    ParsedData_DC readDigitalCompassData(const std::string& nmeaData);
};

#endif //DIGITALCOMPASS_H
