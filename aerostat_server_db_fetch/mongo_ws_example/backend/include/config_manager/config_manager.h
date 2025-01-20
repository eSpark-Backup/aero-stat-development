#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#include <iostream>
#include <vector>
#include <string>
#include "logger/logger.h"
#include <map>

struct Data {
    float temperature;
    float humidity;
};

struct PortSetting {
    std::string port;
    std::string name;

    void print() const {
        LOG_INFO("Port : %s, Name : %s", port.c_str(), name.c_str());
    }
};

struct ServerSetting {
    std::string name;
    std::string ip;
    std::vector<PortSetting> ports;

    std::map<std::string, std::map<std::string, std::string>> data;

    // Helper to print server settings
    void print() const {
        LOG_INFO("Name : %s, IP : %s", name.c_str(), ip.c_str());
        for (const auto& port : ports) {
            port.print();
        }
    }
};

struct ServerConfig {
    std::vector<ServerSetting> tcp;
    std::vector<ServerSetting> modbus;

    void print() const {
        LOG_INFO("TCP Servers:");
        for (const auto& server : tcp) {
            server.print();
        }
        LOG_INFO("MODBUS Servers:");
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

    const ServerConfig& getServerConfig() const {
        return serverConfig;
    }

    void reportConfigs() const {
        LOG_SUCCESS("Server Configurations");
        serverConfig.print();
    }

private:
    ConfigManager(){};
    ~ConfigManager(){};
    ServerConfig serverConfig; 
};

#endif //CONFIG_MANAGER_H