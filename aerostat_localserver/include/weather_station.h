#ifndef WEATHERSTATION_H
#define WEATHERSTATION_H

#include <optional>
#include <sstream>

struct ParsedData {
    double heading = 0.0;
    double baroPres = 0.0;
    double airTemp = 0.0;
    double windAngle = 0.0;
    double windSpeed = 0.0;

    // Convert ParsedData to string
    std::string toString() const {
        std::ostringstream oss;
        oss << "Heading: " << heading
            << ", Barometric Pressure: " << baroPres
            << ", Air Temperature: " << airTemp
            << ", Wind Angle: " << windAngle
            << ", Wind Speed: " << windSpeed;
        return oss.str();
    }
};

class WeatherStation {
public:
    ParsedData readWeatherSData(const std::string& nmeaData);
};

#endif // WEATHERSTATION_H