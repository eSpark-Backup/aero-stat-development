#include "util.h"
#include <cmath>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include "log_file.h"
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
        std::ostringstream oss;
        oss << std::fixed << std::setprecision(2);

        if (header == "$PTNTHPR") {
            if (msgData.size() > 5) {
                try {
                    double Magheading = std::stod(strip(msgData[1]));
                    double pitchV = std::stod(strip(msgData[3]));
                    double rollV = std::stod(strip(msgData[5]));

                    if (!std::isnan(Magheading) && !std::isnan(pitchV) && !std::isnan(rollV)) {
                        parsedData.flag |= 1<< MAGHEADING_OFFSET;
                        parsedData.flag |= 1<< PITCH_OFFSET;
                        parsedData.flag |= 1<< ROLL_OFFSET;
                        parsedData.Magheading = Magheading;
                        parsedData.Pitch = pitchV;
                        parsedData.Roll = rollV;

                        oss.str("");
                        oss << std::fixed << std::setprecision(2) << Magheading;
                        m_msgStr += "Mag Heading: " + oss.str() + "\t";

                        oss.str("");
                        oss << std::fixed << std::setprecision(2) << pitchV;
                        m_msgStr += "Pitch: " + oss.str() + "\t";

                        oss.str("");
                        oss << std::fixed << std::setprecision(2) << rollV;
                        m_msgStr += "Roll: " + oss.str() + "\t";
                    }
                } catch (...) {
                    // Handle parsing errors silently
                }
            }
        }
    }
    
    if (!m_msgStr.empty()) {
        log_message(m_msgStr); // Log the message if there is any data
    }

    return parsedData;
}
