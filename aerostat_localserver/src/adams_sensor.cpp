#include "util.h"
#include <cmath>
#include <string>
#include <vector>
#include <sstream>
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

    // Initialize max tension
    double max_tension = 0.0;

    for (const auto& packet : msgsList) {
        std::vector<std::string> msgsList;
        std::istringstream packetStream(packet);
        std::string field;

        // Strip and check if the packet starts with '>'
        if (!packet.empty() && packet[0] == '>') {
            std::string tension_str = strip(packet.substr(1)); // Extract after '>'
            
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

                    m_msgStr += "Tension: " + std::to_string(tension_value) + "\tMax Tension: " + std::to_string(max_tension);
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
