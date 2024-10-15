#include <cmath>
#include <vector>
#include "util.h"
#include "log_file.h"
#include "weather_station.h"

ParsedData WeatherStation::readWeatherSData(const std::string& nmeaData) {
    ParsedData parsedData;
    std::string m_msgStr;
    std::vector<std::string> msgsList;

    // Split NMEA data into lines based on the newline character
    std::istringstream nmeaStream(nmeaData);
    std::string line;
    while (std::getline(nmeaStream, line)) {
        msgsList.push_back(line);
    }

    for (const auto& msg : msgsList) {
        std::vector<std::string> msgData;
        std::istringstream msgStream(msg);
        std::string field;

        // Split each message by commas
        while (std::getline(msgStream, field, ',')) {
            msgData.push_back(field);
        }

        if (msgData.empty()) continue;
        const std::string& msgHeader = msgData[0];

        if (msgHeader == "$HCHDT") {
            if (msgData.size() > 1) {
                float headingV;
                try {
                    headingV = std::stod(msgData[1]);
                    if (!std::isnan(headingV)) {
                        // headingV = formatFloat(headingV);
                        parsedData.heading = headingV;
                        m_msgStr += "Aerostat Heading: " + std::to_string(headingV) + "\t";
                    }
                } catch (...) {}
            }
        } else if (msgHeader == "$WIMDA") {
            if (msgData.size() > 5) {
                float baroPres, airTemp;
                bool baroOk = false, airOk = false;

                try {
                    baroPres = std::stod(msgData[1]);
                    baroOk = true;
                } catch (...) {}

                try {
                    airTemp = std::stod(msgData[5]);
                    airOk = true;
                } catch (...) {}

                if (baroOk && airOk) {
                    // baroPres = formatFloat(baroPres);
                    // airTemp = formatFloat(airTemp);
                    parsedData.barometricPressure = baroPres;
                    parsedData.airTemperature = airTemp;

                    // Format to 2 decimal places
                    std::ostringstream oss;
                    oss << std::fixed << std::setprecision(2);
                    m_msgStr += "Air Temp: " + oss.str() + std::to_string(airTemp) + "\tBaro Pres: " + oss.str() + std::to_string(baroPres) + "\t";
                }
            }
        } else if (msgHeader == "$WIMWV") {
            if (msgData.size() > 3) {
                float windDirection, windSpeed;
                bool dirOk = false, speedOk = false;

                try {
                    windDirection = std::stod(msgData[1]);
                    dirOk = true;
                } catch (...) {}

                try {
                    windSpeed = std::stod(msgData[3]);
                    speedOk = true;
                } catch (...) {}

                if (dirOk && speedOk) {
                    // windDirection = formatFloat(windDirection);
                    // windSpeed = formatFloat(windSpeed);
                    parsedData.windAngle = windDirection;
                    parsedData.windSpeed = windSpeed;

                    // Format to 2 decimal places
                    std::ostringstream oss;
                    oss << std::fixed << std::setprecision(2);
                    m_msgStr += "Wind Angle: " + oss.str() + std::to_string(windDirection) + "\tWind Speed: " + oss.str() + std::to_string(windSpeed) + "\t";
                }
            }
        }
    }
    if (!m_msgStr.empty()) {
        log_message(m_msgStr);
    }

    return parsedData;
}
