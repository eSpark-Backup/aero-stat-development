#include <cmath>
#include <vector>
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
                double headingV;
                try {
                    headingV = std::stod(msgData[1]);
                    if (!std::isnan(headingV)) {
                        parsedData.heading = headingV;
                        m_msgStr += "Aerostat Heading: " + std::to_string(headingV) + "\t";
                    }
                } catch (...) {}
            }
        } else if (msgHeader == "$WIMDA") {
            if (msgData.size() > 5) {
                double baroPres, airTemp;
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
                    baroPres = std::floor(baroPres * 10.0 + 0.5) / 10.0;
                    parsedData.baroPres = baroPres;
                    parsedData.airTemp = airTemp;
                    m_msgStr += "Air Temp: " + std::to_string(airTemp) + "\tBaro Pres: " + std::to_string(baroPres) + "\t";
                }
            }
        } else if (msgHeader == "$WIMWV") {
            if (msgData.size() > 3) {
                double windDirection, windSpeed;
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
                    parsedData.windAngle = windDirection;
                    parsedData.windSpeed = windSpeed;
                    m_msgStr += "Wind Angle: " + std::to_string(windDirection) + "\tWind Speed: " + std::to_string(windSpeed) + "\t";
                }
            }
        }
    }
    if (!m_msgStr.empty()) {
        log_message(m_msgStr);
    }

    return parsedData;
}