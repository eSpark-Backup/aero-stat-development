#ifndef ADAM_SENSOR_TCP_H
#define ADAM_SENSOR_TCP_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"


class AdamSensorTcp : public Sensor {
public:
    AdamSensorTcp(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<adamSensorData>();
        dataToWrite = std::make_shared<fanLightWriteData>();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "adam_sensor_tcp",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<AdamSensorTcp>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {
        // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());
        
        // // For floating point range [min, max]
        // std::uniform_real_distribution<> disTension(0.0, 360.0);
        
        // // Assign random values to the fields
        // data->tension = disTension(gen);
        // if(data->tension > data->maxTension)
        // {
        //     data->maxTension = data->tension;
        // }
        // data->status = "connected";

        // data->print();

        /* orignal server reading routine */
        std::string ipToConnect = this->connectionParams_.ip;
        TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
        std::string nmeaData = connectionMan.connect_to_port(stoi(this->connectionParams_.port), ipToConnect);
        if(nmeaData.empty())
        {
            // data->tension = 0;
            // data->status = "disconnected";
            return data;
        }

        data = std::make_unique<adamSensorData>(readAdamsSensorData(nmeaData));
        if(connectionMan.port_flag == false)
        {
            data->tension = 0;
            data->status = "disconnected";
        }
        else
        {
            // if(data->tension > data->maxTension)
            // {
            //     data->maxTension = data->maxTension;
            // }
            data->status = "connected";
        }    

        return data;
    }

    bool writeData(const std::shared_ptr<void>& data) override {
        // Implementation for writing data
        if (data) {
            auto value = std::static_pointer_cast<fanLightWriteData>(data);
            // Write `value` to the sensor
            std::string fanCommand;
            std::string lightCommand;
            dataToWrite->fan_one = value->fan_one;
            dataToWrite->fan_two = value->fan_two;
            dataToWrite->strobe_light = value->strobe_light;

            if (dataToWrite->fan_one && dataToWrite->fan_two) {
                fanCommand = "@01DO00\r";
                LOG_INFO("Fan One: ON");
            }
            else if (!dataToWrite->fan_one && !dataToWrite->fan_two) {
                fanCommand = "@01DO03\r";
                LOG_INFO("Fan One: ON");
            }
            else if (dataToWrite->fan_one && !dataToWrite->fan_two) {
                fanCommand = "@01DO02\r";
                LOG_INFO("Fan One: ON");
            }
            else if (!dataToWrite->fan_one && dataToWrite->fan_two) {
                fanCommand = "@01DO01\r";
                LOG_INFO("Fan One: ON");
            }

            if(dataToWrite->strobe_light) {
                lightCommand = "@01DO11\r";
                LOG_INFO("Strobe Light: ON");
            }
            else {
                lightCommand = "@01DO12\r";
                LOG_INFO("Strobe Light: OFF");
            }

            TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
            connectionMan.connect_and_send_to_port(fanCommand, this->connectionParams_.port, stoi(this->connectionParams_.ip));

            return true;
        }
        return false; // Indicate failure
    }

private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<adamSensorData> data;
    std::shared_ptr<fanLightWriteData> dataToWrite;
    adamSensorData readAdamsSensorData(const std::string& nmeaData) {
         TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
        static float __max_tension = 0.0;
        adamSensorData parsedData;
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
                std::string tension_str = connectionMan.strip(packet.substr(1));
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
                        if (tension_value > __max_tension) {
                            __max_tension = tension_value;
                        }
                        parsedData.tension = tension_value;
                        parsedData.maxTension = __max_tension;

                        oss.str("");
                        oss << std::fixed << std::setprecision(2) << tension_value;
                        m_msgStr += "Tension: " + oss.str() + "\t";

                        oss.str("");
                        oss << std::fixed << std::setprecision(2) << __max_tension;
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
            LOG_SUCCESS( "%s",m_msgStr.c_str());
        }

        return parsedData;
    }

};

#endif //ADAM_SENSOR_TCP_H