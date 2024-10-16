#ifndef WEATHERSTATION_H
#define WEATHERSTATION_H

#include <optional>
#include <sstream>
#include <iomanip>

#define HEADING_OFFSET 0
#define BAROPRES_OFFSET 1
#define AIRTEMP_OFFSET 2
#define WINDANGLE_OFFSET 3
#define WINDSPEED_OFFSET 4

struct ParsedData {
    std::string status;
    float heading;
    float barometricPressure;
    float airTemperature;
    float windAngle;
    float windSpeed;
    uint8_t flag;

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