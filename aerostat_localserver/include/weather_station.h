#ifndef WEATHERSTATION_H
#define WEATHERSTATION_H

#include <optional>
#include <sstream>
#include <iomanip>

struct ParsedData {
    float heading;
    float barometricPressure;
    float airTemperature;
    float windAngle;
    float windSpeed;

    std::string toString() const {
        std::ostringstream oss;
        oss << std::fixed << std::setprecision(2);  // Set precision to 2 decimal places

        oss << "Heading: " << heading 
            << ", Barometric Pressure: " << barometricPressure
            << ", Air Temperature: " << airTemperature
            << ", Wind Angle: " << windAngle
            << ", Wind Speed: " << windSpeed;

        return oss.str();  // Return the formatted string
    }
};

class WeatherStation {
public:
    ParsedData readWeatherSData(const std::string& nmeaData);
};

#endif // WEATHERSTATION_H