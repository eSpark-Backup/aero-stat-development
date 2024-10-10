#include "util.h"
#include <cmath>
#include <string>
#include <vector>
#include <sstream>
#include "digital_compass.h"

ParsedData_DC DigitalCompass::readDigitalCompassData(const std::string& nmeaData) {
    ParsedData_DC parsedData;
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
        const std::string& header = strip(msgData[0]);

        if (header == "$PTNTHPR") {
            if (msgData.size() > 5) {
                try {
                    double headingV = std::stod(strip(msgData[1]));
                    double pitchV = std::stod(strip(msgData[3]));
                    double rollV = std::stod(strip(msgData[5]));

                    if (!std::isnan(headingV) && !std::isnan(pitchV) && !std::isnan(rollV)) {
                        parsedData.Magheading = headingV;
                        parsedData.Pitch = pitchV;
                        parsedData.Roll = rollV;

                        m_msgStr += "Mag Heading: " + std::to_string(headingV) + "\tPitch: " + std::to_string(pitchV) + "\tRoll: " + std::to_string(rollV) + "\n";
                    }
                } catch (...) {
                    // Handle parsing errors silently
                }
            }
        }
    }
    
    // if (!m_msgStr.empty()) {
    //     log_message(m_msgStr); // Log the message if there is any data
    // }

    return parsedData;
}
