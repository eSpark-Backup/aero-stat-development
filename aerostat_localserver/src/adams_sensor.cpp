#include "util.h"
#include <cmath>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>
#include "log_file.h"
#include "adams_sensor.h"

ParsedData_AS AdamsSensor::readAdamsSensorData(const std::string& nmeaData) {
    ParsedData_AS parsedData;
    std::string m_msgStr;
    std::vector<std::string> msgsList;

    // Split the NMEA data by '\r' to process individual messages
    std::istringstream nmeaStream(nmeaData);
    std::string line;
    while (std::getline(nmeaStream, line, '\r')) {
        msgsList.push_back(line);
    }

    for (const auto& packet : msgsList) {
        std::vector<std::string> msgsList;
        std::istringstream packetStream(packet);
        std::string field;

        // Strip and check if the packet starts with '>'
        if (!packet.empty() && packet[0] == '>') {
            std::string tension_str = strip(packet.substr(1));
            std::ostringstream oss;
            oss << std::fixed << std::setprecision(2);
            
            try {
                double tension_value = std::stod(tension_str);  // Convert to float
                if (!std::isnan(tension_value)) {  // Ensure valid value
                    parsedData.flag |= 1<< TENSION;
                    parsedData.flag |= 1<< MAX_TENSION;
                    tension_value = (tension_value * 271.0279) / 9.8;  // Apply conversion
                    tension_value = std::round(tension_value * 10.0) / 10.0;  // Round to 1 decimal

                    // Update max tension if the new value is greater
                    if (tension_value > max_tension) {
                        max_tension = tension_value;
                    }
                    parsedData.Tension = tension_value;
                    parsedData.MaxTension = max_tension;
                    
                    oss.str("");
                    oss << std::fixed << std::setprecision(2) << tension_value;
                    m_msgStr += "Tension: " + oss.str() + "\t";

                    oss.str("");
                    oss << std::fixed << std::setprecision(2) << max_tension;
                    m_msgStr += "Max Tension: " + oss.str() + "\t";
                }
            } catch (...) {
                // Handle parsing errors silently
            }
        }
    }

    // Log the message if any data was parsed
    if (!m_msgStr.empty()) {
        log_message(m_msgStr);
    }

    return parsedData;
}
