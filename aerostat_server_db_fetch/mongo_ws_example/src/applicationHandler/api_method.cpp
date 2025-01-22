#include "applicationHandler/api_method.h"
#include "alfa_util/alfa_util_version.h"
#include "config_manager/config_manager.h"
#include "sensorsManager/base/sensorManager.h"


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

                    // Populate the ports
                    for (const auto& port : serverConfig["ports"]) {
                        PortSetting portSetting;
                        portSetting.port = port["port"].get<std::string>();
                        portSetting.name = port["name"].get<std::string>();

                        //register a sensor here
                        std::string updatedName = portSetting.name + "_" + protocol;
                        sensorManager.registerSensor(portSetting.name, currentSensorIntType, updatedName, portSetting.port);
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
