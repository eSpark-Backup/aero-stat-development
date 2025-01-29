#ifndef DIGITAL_COMPASS_TCP_SESNOR_H
#define DIGITAL_COMPASS_TCP_SESNOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class DigitalCompassTcp : public Sensor {
public:
    DigitalCompassTcp(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<digitalCompassData>();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "digital_compass_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<DigitalCompassTcp>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> dismagheading(0.0, 360.0);
        // std::uniform_real_distribution<> dispitch(0.0, 360.0);
        // std::uniform_real_distribution<> disroll(0.0, 360.0);
        
        // // Assign random values to the fields
        // data->magheading = dismagheading(gen);
        // data->pitch = dispitch(gen);
        // data->roll = disroll(gen);
        // data->status = "connected";

        /* orignal server reading routine */
        std::string ipToConnect = this->connectionParams_.ip;
         TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
        std::string nmeaData = connectionMan.connect_to_port(stoi(this->connectionParams_.port), ipToConnect);
        if(nmeaData.empty())
        {
            // data->magheading = 0;
            // data->pitch = 0;
            // data->roll = 0;
            // data->status = "disconnected";
            return data;
        }
        data = std::make_unique<digitalCompassData>(readDigitalCompassData(nmeaData));
        if(connectionMan.port_flag == false)
        {
            data->magheading = 0;
            data->pitch = 0;
            data->roll = 0;
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
    std::shared_ptr<digitalCompassData> data;
    digitalCompassData readDigitalCompassData(const std::string& nmeaData) {
         TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
        digitalCompassData parsedData;
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
            const std::string& header = connectionMan.strip(msgData[0]);
            std::ostringstream oss;
            oss << std::fixed << std::setprecision(2);

            if (header == "$PTNTHPR") {
                if (msgData.size() > 5) {
                    try {
                        double Magheading = std::stod(connectionMan.strip(msgData[1]));
                        double pitchV = std::stod(connectionMan.strip(msgData[3]));
                        double rollV = std::stod(connectionMan.strip(msgData[5]));

                        if (!std::isnan(Magheading) && !std::isnan(pitchV) && !std::isnan(rollV)) {
                            parsedData.flag |= 1<< MAGHEADING_OFFSET;
                            parsedData.flag |= 1<< PITCH_OFFSET;
                            parsedData.flag |= 1<< ROLL_OFFSET;
                            parsedData.magheading = Magheading;
                            parsedData.pitch = pitchV;
                            parsedData.roll = rollV;

                            oss.str("");
                            oss << std::fixed << std::setprecision(2) << Magheading;
                            m_msgStr += "MagHeading: " + oss.str() + "\t";

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
            log_message(m_msgStr);
            LOG_SUCCESS( "%s",m_msgStr.c_str());
        }

        return parsedData;
    }
};

#endif //DIGITAL_COMPASS_TCP_SESNOR_H