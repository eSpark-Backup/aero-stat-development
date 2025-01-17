#include "applicationHandler/api_method.h"
#include "alfa_util/alfa_util_version.h"

json handleServerSettingsSet(const json& parsedJson) {
    json response = {
        {"error", nullptr},
    };

    try {
        for (const auto& server : parsedJson["servers"]) {
            for (const auto& [protocol, servers] : server.items()) {
                LOG_INFO("Protocol: %s", protocol.c_str());
                for (const auto& serverConfig : servers) {
                    LOG_INFO("  Name: %s", serverConfig["name"].get<std::string>().c_str());
                    LOG_INFO("  IP: %s", serverConfig["ip"].get<std::string>().c_str());

                    for (const auto& port : serverConfig["ports"]) {
                        LOG_INFO("    Port: %s, Name: %s",
                                 port["port"].get<std::string>().c_str(),
                                 port["name"].get<std::string>().c_str());
                    }
                }
            }
        }
    } catch (const std::exception& e) {
        // Handle parsing or processing errors
        response["error"] = e.what();
    }

    return response;
}

json handleServerSettingsGet(const json& parsedJson) {
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
