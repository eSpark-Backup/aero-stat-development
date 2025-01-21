#include "applicationHandler/api_method.h"
#include "alfa_util/alfa_util_version.h"
#include "config_manager/config_manager.h"
#include "sensorsManager/base/sensorManager.h"

//Include Sensors
#include "sensorsManager/sensors/tcp/weatherStationTcp.h"


json handleServerConnectionSettingsSet(const json& parsedJson) {
    ConfigManager& configManager = ConfigManager::getInstance();
    SensorManager& sensorManager = SensorManager::getInstance();
    ServerConfig newConfig;

    json response = {
        {"error", nullptr},
    };

    try {
        // Iterate through the servers in the JSON
        for (const auto& server : parsedJson["servers"]) {
            for (const auto& [protocol, servers] : server.items()) {
                // LOG_INFO("Protocol: %s", protocol.c_str());

                // Determine the correct vector to populate based on protocol
                std::vector<ServerSetting>* serverList = nullptr;
                sensorInterfaceType currentSensorIntType = sensorInterfaceType::SENSOR_INT_UNKNOWN;
                if (protocol == "tcp") {
                    serverList = &newConfig.tcp;
                    currentSensorIntType = sensorInterfaceType::SENSOR_INT_TCP;
                } else if (protocol == "modbus") {
                    serverList = &newConfig.modbus;
                    currentSensorIntType = sensorInterfaceType::SENSOR_INT_MODBUS;
                } else {
                    LOG_WARNING("Unknown protocol: %s", protocol.c_str());
                    continue;
                }

                // Populate the server settings
                for (const auto& serverConfig : servers) {
                    ServerSetting setting;
                    setting.name = serverConfig["name"].get<std::string>();
                    setting.ip = serverConfig["ip"].get<std::string>();

                    // LOG_INFO("  Name: %s", setting.name.c_str());
                    // LOG_INFO("  IP: %s", setting.ip.c_str());

                    // Populate the ports
                    for (const auto& port : serverConfig["ports"]) {
                        PortSetting portSetting;
                        portSetting.port = port["port"].get<std::string>();
                        portSetting.name = port["name"].get<std::string>();
                        std::string updatedName = portSetting.name + "_tcp";
                        sensorManager.registerSensor(portSetting.name, currentSensorIntType, updatedName, portSetting.port);
                        
                        // LOG_INFO("    Port: %s, Name: %s", portSetting.port.c_str(), portSetting.name.c_str());
                        setting.ports.push_back(portSetting);
                    }

                    // Populate additional data if available
                    if (serverConfig.contains("data")) {
                        for (const auto& [key, value] : serverConfig["data"].items()) {
                            std::map<std::string, std::string> innerMap;
                            for (const auto& [innerKey, innerValue] : value.items()) {
                                innerMap[innerKey] = innerValue.get<std::string>();
                            }
                            setting.data[key] = innerMap;
                        }
                    }

                    // Add the setting to the appropriate list
                    serverList->emplace_back(std::move(setting));
                }
            }
        }

        // Save the populated configuration
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
