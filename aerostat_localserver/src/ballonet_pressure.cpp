#include "util.h"
#include <cmath>
#include <string>
#include <vector>
#include <sstream>
#include "log_file.h"
#include "ballonet_pressure.h"

ParsedData_BP BalPressure::readBalPressureData(const std::string& nmeaData){
    ParsedData_BP parsedData;
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

        // Split packet by '='
        while (std::getline(packetStream, field, '=')) {
            msgsList.push_back(field);
        }

        if (msgsList.size() > 1) {
            std::string header = strip(msgsList[0]);

            if (header == "#01CP") {  // Check for the "#01CP" header
                std::string pressureStr = strip(msgsList[1]);  // Extract pressure value
                try {
                    double pressureValue = std::stod(pressureStr);
                    // Round to three decimal places
                    pressureValue = std::round(pressureValue * 1000.0) / 1000.0;
                    parsedData.BalPressure = pressureValue;

                    m_msgStr += "Ballonet Pressure: " + std::to_string(pressureValue);
                } catch (...) {
                    // Handle parsing errors silently
                }
            }
        }
    }

    // // Log the message if any data was parsed
    if (!m_msgStr.empty()) {
        log_message(m_msgStr);
    }

    return parsedData;
}