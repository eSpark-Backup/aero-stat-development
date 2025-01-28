#ifndef CONFIG_FORMATTER_H
#define CONFIG_FORMATTER_H

#include <iostream>
#include <sstream>
#include <string>
#include "configManager.h"
#include <nlohmann/json.hpp> // For JSON formatting
// #include <yaml-cpp/yaml.h>   // For YAML formatting

using json = nlohmann::json;

class ConfigFormatter {
public:

    static json tcpDataToJson(const ServerConfig& serverConfig) {
        json tcpJson;
        // Process TCP servers
        for (const auto& tcpServer : serverConfig.tcp) {
            if (tcpServer.data.empty()) {
                continue;
            }
            json serverDataJson;

            // Iterate through sensor data
            for (const auto& sensor : tcpServer.data) {
                json sensorJson;

                for (const auto& keyValue : sensor.second) {
                    sensorJson[keyValue.first] = keyValue.second;
                }

                serverDataJson[sensor.first] = sensorJson;
            }

            tcpJson[tcpServer.name] = serverDataJson;
        }

        return tcpJson;
    }

    static json modbusDataToJson(const ServerConfig& serverConfig) {
        json modbusJson;

        // Process MODBUS servers
        for (const auto& modbusServer : serverConfig.modbus) {
            if (modbusServer.data.empty()) {
                continue;
            }
            json serverDataJson;

            // Iterate through sensor data
            for (const auto& sensor : modbusServer.data) {
                json sensorJson;
                for (const auto& keyValue : sensor.second) {
                    sensorJson[keyValue.first] = keyValue.second;
                }
                serverDataJson[sensor.first] = sensorJson;
            }

            modbusJson[modbusServer.name] = serverDataJson;
        }

        return modbusJson;
    }

    static std::string dataToJson(const ServerConfig& serverConfig) {
        json j;

        // Use the separate functions to build JSON
        j["tcp"] = tcpDataToJson(serverConfig);
        j["modbus"] = modbusDataToJson(serverConfig);

        return j.dump(4); // Pretty print with 4 spaces
    }



    // Convert the server configuration to JSON format
    static std::string toJson(const ServerConfig& serverConfig) {
        json j;
        j["broadcastEnable"] = serverConfig.broadcastEnable;

        // TCP Servers
        for (const auto& tcpServer : serverConfig.tcp) {
            json tcpJson;
            tcpJson["name"] = tcpServer.name;
            tcpJson["ip"] = tcpServer.ip;

            // Ports
            for (const auto& port : tcpServer.ports) {
                tcpJson["ports"].push_back({
                    {"port", port.port},
                    {"name", port.name}
                });
            }

            // Sensor Data
            for (const auto& sensor : tcpServer.data) {
                json sensorJson;
                for (const auto& keyValue : sensor.second) {
                    sensorJson[keyValue.first] = keyValue.second;
                }
                tcpJson["sensorData"][sensor.first] = sensorJson;
            }

            j["tcp"].push_back(tcpJson);
        }

        // MODBUS Servers
        for (const auto& modbusServer : serverConfig.modbus) {
            json modbusJson;
            modbusJson["name"] = modbusServer.name;
            modbusJson["ip"] = modbusServer.ip;

            // Ports
            for (const auto& port : modbusServer.ports) {
                modbusJson["ports"].push_back({
                    {"port", port.port},
                    {"name", port.name}
                });
            }

            // Sensor Data
            for (const auto& sensor : modbusServer.data) {
                json sensorJson;
                for (const auto& keyValue : sensor.second) {
                    sensorJson[keyValue.first] = keyValue.second;
                }
                modbusJson["sensorData"][sensor.first] = sensorJson;
            }

            j["modbus"].push_back(modbusJson);
        }

        return j.dump(4); // Pretty print with 4 spaces
    }

    // Convert the server configuration to YAML format
    // static std::string toYaml(const ServerConfig& serverConfig) {
    //     YAML::Node root;
    //     root["broadcastEnable"] = serverConfig.broadcastEnable;

    //     // TCP Servers
    //     for (const auto& tcpServer : serverConfig.tcp) {
    //         YAML::Node tcpNode;
    //         tcpNode["name"] = tcpServer.name;
    //         tcpNode["ip"] = tcpServer.ip;

    //         // Ports
    //         for (const auto& port : tcpServer.ports) {
    //             YAML::Node portNode;
    //             portNode["port"] = port.port;
    //             portNode["name"] = port.name;
    //             tcpNode["ports"].push_back(portNode);
    //         }

    //         // Sensor Data
    //         for (const auto& sensor : tcpServer.data) {
    //             YAML::Node sensorNode;
    //             for (const auto& keyValue : sensor.second) {
    //                 sensorNode[keyValue.first] = keyValue.second;
    //             }
    //             tcpNode["sensorData"][sensor.first] = sensorNode;
    //         }

    //         root["tcp"].push_back(tcpNode);
    //     }

    //     // MODBUS Servers
    //     for (const auto& modbusServer : serverConfig.modbus) {
    //         YAML::Node modbusNode;
    //         modbusNode["name"] = modbusServer.name;
    //         modbusNode["ip"] = modbusServer.ip;

    //         // Ports
    //         for (const auto& port : modbusServer.ports) {
    //             YAML::Node portNode;
    //             portNode["port"] = port.port;
    //             portNode["name"] = port.name;
    //             modbusNode["ports"].push_back(portNode);
    //         }

    //         // Sensor Data
    //         for (const auto& sensor : modbusServer.data) {
    //             YAML::Node sensorNode;
    //             for (const auto& keyValue : sensor.second) {
    //                 sensorNode[keyValue.first] = keyValue.second;
    //             }
    //             modbusNode["sensorData"][sensor.first] = sensorNode;
    //         }

    //         root["modbus"].push_back(modbusNode);
    //     }

    //     std::stringstream ss;
    //     ss << root;
    //     return ss.str();
    // }
};

#endif // CONFIG_FORMATTER_H
