#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#include <iostream>
#include <vector>
#include <string>
#include <map>
#include "logger/logger.h"
#include "sensorsManager/base/sensorBase.h"

struct Data {
    float temperature;
    float humidity;
};

struct PortSetting {
    std::string port;
    std::string name;

    void print() const {
        LOG_INFO("          Port : %s, Name : %s", port.c_str(), name.c_str());
    }
};

struct ServerSetting {
    std::string name;
    std::string ip = "0.0.0.255";
    std::vector<PortSetting> ports;

    std::map<std::string, std::map<std::string, std::string>> data;

    void print() const {
        LOG_INFO("      Name : %s, IP : %s", name.c_str(), ip.c_str());

        // Print ports
        for (const auto& port : ports) {
            port.print();
        }

        // Print sensor data
        LOG_INFO("          Sensor Data:");
        for (const auto& sensorEntry : data) {
            const std::string& sensorId = sensorEntry.first;
            const auto& sensorData = sensorEntry.second;

            LOG_INFO("              Sensor ID: %s", sensorId.c_str());
            for (const auto& dataEntry : sensorData) {
                const std::string& key = dataEntry.first;
                const std::string& value = dataEntry.second;
                LOG_INFO("                  %s: %s", key.c_str(), value.c_str());
            }
        }
    }

    void addSensorData(const std::string& sensorId, const std::shared_ptr<SensorData>& sensorData) {
        this->data[sensorId] = sensorData->toMap();
    }
};

struct ServerConfig {
    std::vector<ServerSetting> tcp;
    std::vector<ServerSetting> modbus;
    std::string phaseType = "unknown";
    bool broadcastEnable = false;

    void print() const {
        LOG_INFO("SERVER INFORAMATION PRINT");
        LOG_INFO("  TCP Servers:");
        for (const auto& server : tcp) {
            server.print();
        }
        LOG_INFO("  MODBUS Servers:");
        for (const auto& server : modbus) {
            server.print();
        }
    }
};

class ConfigManager {
public:
    // ConfigManager(const ConfigManager&) = delete;
    // ConfigManager& operator=(const ConfigManager&) = delete;

    static ConfigManager& getInstance() {
        static ConfigManager instance; // Guaranteed to be thread-safe in C++11 and later
        return instance;
    }

    void saveServerConfig(const ServerConfig& newConfig) {
        serverConfig = newConfig;
    }

    ServerConfig& getServerConfig() {
        return serverConfig;
    }

    void reportConfigs() const {
        LOG_SUCCESS("Server Configurations");
        serverConfig.print();
    }

    void saveSensorDataTcp(const std::string& sensorId, const std::shared_ptr<SensorData>& data) {
        // Here, we would associate the sensor data with the relevant server setting
        for (auto& server : serverConfig.tcp) {
            server.addSensorData(sensorId, data);  // Save sensor data in a TCP server
        }
    }

    void saveSensorDataModbus(const std::string& sensorId, const std::shared_ptr<SensorData>& data) {
        // Here, we would associate the sensor data with the relevant server setting
        for (auto& server : serverConfig.modbus) {
            server.addSensorData(sensorId, data);  // Save sensor data in a TCP server
        }
    }

private:
    ConfigManager(){};
    ~ConfigManager(){};
    ServerConfig serverConfig; 
};

#endif //CONFIG_MANAGER_H