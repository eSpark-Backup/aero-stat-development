#ifndef DIGITALCOMPASS_H
#define DIGITALCOMPASS_H

#include <optional>
#include <sstream>

#define MAGHEADING_OFFSET 0
#define PITCH_OFFSET 1
#define ROLL_OFFSET 2

struct ParsedData_DC {
    float Magheading;
    float Pitch;
    float Roll;
    uint8_t flag;

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
