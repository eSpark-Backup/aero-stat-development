#ifndef HELLIUM_PRESSURE_SENSOR_H
#define HELLIUM_PRESSURE_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class HelliumPressureTcp : public Sensor {
public:
    HelliumPressureTcp(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<helliumPressureData>();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "hellium_pressure_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<HelliumPressureTcp>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> dishelliumPressure(0.0, 360.0);
        
        // // Assign random values to the fields
        // data->helliumPressure = dishelliumPressure(gen);
        // data->status = "connected";

        /* from orignal server */
        std::string ipToConnect = this->connectionParams_.ip;

         TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
        std::string nmeaData = connectionMan.connect_to_port(stoi(this->connectionParams_.port), ipToConnect);
        if(nmeaData.empty())
        {
            // data->helliumPressure = 0;
            // data->status = "disconnected";
            return data;
        }
        data = std::make_unique<helliumPressureData>(readHelPressureData(nmeaData));
        if(connectionMan.port_flag == false)
        {
            data->helliumPressure = 0;
            data->status = "disconnected";
        }
        else
        {
            data->status = "connected";
        }

        return data;
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<helliumPressureData> data;
    helliumPressureData readHelPressureData(const std::string& nmeaData){
         TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
        helliumPressureData parsedData;
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
                std::string header = connectionMan.strip(msgsList[0]);
                std::ostringstream oss;
                oss << std::fixed << std::setprecision(2);

                if (header == "#01CP") {  // Check for the "#01CP" header
                    std::string pressureStr = connectionMan.strip(msgsList[1]);  // Extract pressure value
                    try {
                        double pressureValue = std::stod(pressureStr);
                        parsedData.flag |= 1<< HELPRES_OFFSET;
                        // Round to three decimal places
                        pressureValue = std::round(pressureValue * 1000.0) / 1000.0;
                        parsedData.helliumPressure = pressureValue;
                        oss.str("");
                        oss << std::fixed << std::setprecision(2) << pressureValue;
                        m_msgStr += "Helium Pressure: " + oss.str() + "\t";
                    } catch (...) {
                        // Handle parsing errors silently
                    }
                }
            }
        }

        // Log the message if any data was parsed
        if (!m_msgStr.empty()) {
            log_message(m_msgStr);
            LOG_SUCCESS( "%s",m_msgStr.c_str());    
        }

        return parsedData;
    }
};

#endif //HELLIUM_PRESSURE_SENSOR_H