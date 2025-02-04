#include "applicationHandler/apiMethod.h"
#include "alfaUtil/alfaUtilVersion.h"
#include "configManager/configManager.h"
#include "sensorsManager/base/sensorManager.h"
#include "sensorsManager/base/tcpConnectionManager.h"
#include "logger/logger.h"
#include <stdexcept>


json handleServerConnectionSettingsSet(const json& parsedJson) {
    ConfigManager& configManager = ConfigManager::getInstance();
    SensorManager& sensorManager = SensorManager::getInstance();
    sensorInterfaceType currentSensorIntType = sensorInterfaceType::SENSOR_INT_UNKNOWN;

    // Load the current configuration
    ServerConfig currentConfig = configManager.getServerConfig();
    ServerConfig newConfig = currentConfig; // Start with a copy of the current configuration

    json response = {
        {"error", nullptr},
    };

    try {
        // Iterate through the servers in the JSON
        for (const auto& server : parsedJson["servers"]) {
            for (const auto& [protocol, servers] : server.items()) {
                std::vector<ServerSetting>* serverList = nullptr;

                if (protocol == "tcp") {
                    serverList = &newConfig.tcp; // Update only the `tcp` servers
                    currentSensorIntType = sensorInterfaceType::SENSOR_INT_TCP;
                } else if (protocol == "modbus") {
                    serverList = &newConfig.modbus; // Update only the `modbus` servers
                    currentSensorIntType = sensorInterfaceType::SENSOR_INT_MODBUS;
                } else {
                    LOG_WARNING("Unknown protocol: %s", protocol.c_str());
                    continue;
                }

                // Clear and populate the server settings for the given protocol
                serverList->clear();
                for (const auto& serverConfig : servers) {
                    ServerSetting setting;
                    setting.name = serverConfig["name"].get<std::string>();
                    setting.ip = serverConfig["ip"].get<std::string>();

                    TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
                    if (!connectionMan.check_host_reachable(setting.ip)) {
                        LOG_ERROR("Host %s is not reachable for setting %s", setting.ip.c_str(), setting.name.c_str());
                        continue;
                    }

                    // Populate the ports
                    for (const auto& port : serverConfig["ports"]) {
                        PortSetting portSetting;
                        portSetting.port = port["port"].get<std::string>();
                        portSetting.name = port["name"].get<std::string>();
                        if(currentSensorIntType == sensorInterfaceType::SENSOR_INT_TCP) {
                            if(connectionMan.connect_to_port(stoi(portSetting.port), setting.ip).empty()) {
                                LOG_ERROR("Connection to host %s failed for port %s", setting.ip.c_str(), portSetting.port.c_str());
                                continue;
                            }
                        }

                        //register a sensor here
                        std::string updatedName = portSetting.name + "_" + protocol;
                        sensorManager.unregisterSensor(portSetting.port);
                        sensorManager.registerSensor(portSetting.name, currentSensorIntType, updatedName, portSetting.port, setting.ip);
                        setting.ports.push_back(std::move(portSetting));
                    }

                    // Add the server setting to the list
                    serverList->emplace_back(std::move(setting));
                }
            }
        }

        // Save only the updated tcp and modbus settings back to the config
        configManager.saveServerConfig(newConfig);
        configManager.reportConfigs();

    } catch (const std::exception& e) {
        // Handle parsing or processing errors
        response["error"] = e.what();
        LOG_ERROR("Error parsing server settings: %s", e.what());
    }

    return response;
}

json handleServerConnectionSettingsGet(const json& parsedJson) {
    json response = {
        {"error", "Settings Get not implemented as return json is not implemented in API handlers"},
    };

    LOG_ERROR("Settings Get not implemented as return json is not implemented in API handlers");

    return response;
}

json handleVersionGet(const json& parsedJson) {
    json response = {
        {"error", nullptr},
        {"result", {
            {"version", VERSION_STR},
            {"build_date", BUILD_DATE},
            {"developer", DEVELOPER},
            {"compile_time", COMPILE_TIME},
            {"branch", CURRENT_BRANCH},
            {"commit_hash", COMMIT_HASH}
        }}
    };

    LOG_SUCCESS("Version information retrieved successfully");

    return response;
}

json handleBroadcastSetting(const json& parsedJson) {
    ConfigManager& configManager = ConfigManager::getInstance();

    json response = {
        {"error", nullptr},
        {"result", {
            {"enabled", false}  
        }}
    };

    try {
        if (parsedJson.contains("enable") && parsedJson["enable"].is_boolean()) {
            bool enableValue = parsedJson["enable"].get<bool>();
            ServerConfig newConfig = configManager.getServerConfig();
            newConfig.broadcastEnable = enableValue;
            configManager.saveServerConfig(newConfig);
            response["result"]["enabled"] = newConfig.broadcastEnable;
            LOG_SUCCESS("Broadcast settings updated successfully. Enabled: %s", enableValue ? "true" : "false");
        } else {
            response["error"] = "Invalid or missing 'enable' field";
            LOG_ERROR("Invalid JSON: Missing or incorrect 'enable' field");
        }
    } catch (const std::exception& e) {
        response["error"] = std::string("Exception occurred: ") + e.what();
        LOG_ERROR("Exception while processing JSON: %s", e.what());
    }

    return response;
}

json handlePhaseSetting(const json& parseJson) {

    try {
        ConfigManager& configManager = ConfigManager::getInstance();    
        if (parseJson.contains("phaseType") && parseJson["phaseType"].is_string()) {
            configManager.getServerConfig().phaseType = parseJson["phaseType"].get<std::string>();
        } else {
            return {
                {"error", "Invalid or missing 'phaseType' in input JSON"},
                {"result", nullptr}
            };
        }

        return {
            {"error", nullptr},  
            {"result", {
                {"phaseType", configManager.getServerConfig().phaseType}
            }}
        };

    } catch (const std::exception& ex) {
        return {
            {"error", std::string("Exception occurred: ") + ex.what()},
            {"result", nullptr}
        };
    }
}

json handleActuatorSetting(const json& parseJson) {
    json response;
    json settingsSet;
    ConfigManager& configManager = ConfigManager::getInstance();
    SensorManager& sensorManager = SensorManager::getInstance();    
    ServerConfig currentConfig = configManager.getServerConfig();

    // Check for the method key and validate it
    if (!parseJson.contains("method") || parseJson["method"] != "alfa.actuator.settings.set") {
        return {{"error", "Invalid or missing method"}};
    }

    // Initialize the data structures to store the settings
    auto relayDataVar = std::make_shared<relayWriteData>();
    auto fanLightDataVar = std::make_shared<fanLightWriteData>();
    std::string modbusName;    
    std::string modbusPortNumber;
    std::string tcpName;    
    std::string tcpPortNumber;
    // Process the modbus settings if provided
    bool relayStatesModified = false;
    if (parseJson.contains("modbus") && !parseJson["modbus"].empty()) {
        for (const auto& modbusSetting : parseJson["modbus"]) {
            if (modbusSetting.contains("name")) {
                modbusName = modbusSetting["name"];
                for (const auto& modbusServer : currentConfig.modbus) {
                    if (modbusServer.name == modbusName) {
                        LOG_SUCCESS("Processing Modbus settings for: %s", modbusName.c_str());
                        // Extract the port number (could be used later for writing)
                        for (const auto& portSetting : modbusServer.ports) {
                            // You can use portSetting.port here if needed
                            modbusPortNumber = portSetting.port;
                        }
                    }
                }
            }

            if (modbusSetting.contains("relay")) {
                relayStatesModified = true;
                const auto& relaySettings = modbusSetting["relay"];
                for (size_t i = 0; i < relaySettings.size(); ++i) {
                    int relayState = relaySettings[i];
                    relayDataVar->relayStates[i] = relayState;
                    LOG_SUCCESS("Relay settings processed: relay_%zu=%d", i, relayState);
                    settingsSet["modbus"]["relay"][i] = relayState;
                }
            }
        }
    } else {
        LOG_WARNING("No modbus settings provided or modbus data is empty.");
    }

    // Process the TCP fan and light settings if provided
    bool fanLightDataModified = false;
    if (parseJson.contains("tcp") && !parseJson["tcp"].empty()) {
        for (const auto& tcpSetting : parseJson["tcp"]) {
            if (tcpSetting.contains("name")) {
                std::string tcpName = tcpSetting["name"];
                for (const auto& tcpServer : currentConfig.tcp) {
                    if (tcpServer.name == tcpName) {
                        LOG_SUCCESS("Processing TCP settings for: %s", tcpName.c_str());
                        // Extract the port number (could be used later for writing)
                        for (const auto& portSetting : tcpServer.ports) {
                            // You can use portSetting.port here if needed
                            tcpPortNumber = portSetting.port;
                        }
                    }
                }
            }

            if (tcpSetting.contains("fan")) {
                const auto& fanSettings = tcpSetting["fan"];
                if (fanSettings.size() > 0) {
                    fanLightDataVar->fan_one = fanSettings[0] == 1;  // Set fan_one
                    settingsSet["tcp"]["fan"]["fan_one"] = fanLightDataVar->fan_one ? "ON" : "OFF";
                }
                if (fanSettings.size() > 1) {
                    fanLightDataVar->fan_two = fanSettings[1] == 1;  // Set fan_two
                    settingsSet["tcp"]["fan"]["fan_two"] = fanLightDataVar->fan_two ? "ON" : "OFF";
                }
                fanLightDataModified = true;
                LOG_SUCCESS("Fan settings processed: fan_one=%s, fan_two=%s",
                            fanLightDataVar->fan_one ? "ON" : "OFF",
                            fanLightDataVar->fan_two ? "ON" : "OFF");
            }

            if (tcpSetting.contains("strobe_light")) {
                const auto& strobeSettings = tcpSetting["strobe_light"];
                if (!strobeSettings.empty()) {
                    fanLightDataVar->strobe_light = strobeSettings[0] == 1;  // Set strobe_light
                    settingsSet["tcp"]["strobe_light"] = fanLightDataVar->strobe_light ? "ON" : "OFF";
                    LOG_SUCCESS("Strobe light processed: %s",
                                fanLightDataVar->strobe_light ? "ON" : "OFF");
                    fanLightDataModified = true;
                }
            }
        }
    } else {
        LOG_WARNING("No TCP fan or strobe light settings provided or tcp data is empty.");
    }

    // Write the modbus and TCP settings to their respective sensors if data is available
    if (relayStatesModified) {
        if (sensorManager.writeSensorData(modbusPortNumber, relayDataVar)) {
            LOG_SUCCESS("Relay data successfully written to modbus sensor %s", modbusPortNumber.c_str());
        } else {
            LOG_WARNING("Failed to write relay data to modbus sensor %s", modbusPortNumber.c_str());
        }
    } else if (!relayStatesModified) {
        LOG_WARNING("No relay data to write to modbus sensor.");
    }

    if (fanLightDataModified && (fanLightDataVar->fan_one || fanLightDataVar->fan_two || fanLightDataVar->strobe_light)) {
        if (sensorManager.writeSensorData(tcpPortNumber, fanLightDataVar)) {
            LOG_SUCCESS("Fan and light data successfully written to fanLight sensor");
        } else {
            LOG_WARNING("Failed to write fan and light data to fanLight sensor");
        }
    } else if (!fanLightDataModified) {
        LOG_WARNING("No fan or light data to write to fanLight sensor.");
    }

    // Return the response
    response["status"] = "success";
    response["settings_set"] = settingsSet; // Return the settings that were set
    return response;
}



json handleLoggerSetting(const json& parseJson)
{
    /*pasrse json and get log level*/
    try {
        if (parseJson.contains("log_level") && parseJson["log_level"].is_string()) {
            std::string logLevel = parseJson["log_level"];
            Logger::getInstance().setLogLevel(logLevel);
            return {{"error", nullptr}, {"log_level" , Logger::getInstance().logLevelToString(Logger::getInstance().getLogLevel())}};
        } else {
            return {{"error", "Invalid or missing 'log_level'"}};
        }
    } catch (const std::exception& e) {
        return {{"error", std::string("Exception occurred: ") + e.what()}};
    }
}