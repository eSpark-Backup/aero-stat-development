#include <memory>
#include <iostream>
#include "applicationHandler/applicationHandler.h"
#include "logger/logger.h"
#include "nlohmann/json.hpp"

using json = nlohmann::json;

static void handleServerSettingsSet(const json& parsedJson) {
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
}

static void handleServerSettingsGet(const json& parsedJson) {
    LOG_ERROR("Settings Get not implemented");
}

void ApplicationHandler::handleProtocolEvent(const ProtocolEventParams& eventParams) {
    switch (eventParams.type) {
        case ProtocolEvent::MESSAGE_RECEIVED:
        {
            try {
                protocol_->sendData(messageHandler_->handleMessage(eventParams.eventData.messageReceived.message));
            } catch (const json::exception& e) {
                LOG_ERROR("JSON ERROR: %s", e.what());  // Added error detail
            }
            break;
        }
        case ProtocolEvent::CONNECTED:
            LOG_SUCCESS("Connected to %s, %d" , eventParams.eventData.connected.host , ":" , eventParams.eventData.connected.port );
            break;
        case ProtocolEvent::DISCONNECTED:
            LOG_ERROR("Disconnected. Reason: %s" , eventParams.eventData.disconnected.reason );
            break;
        case ProtocolEvent::ERROR_OCCURRED:
            LOG_ERROR("Error occurred: %s" , eventParams.eventData.errorOccurred.errorMessage );
            break;
        default:
            LOG_ERROR("Unknown event" );
            break;
    }
}

void ApplicationHandler::start() {
    messageHandler_->registerMethodHandler("alfa.server.setting.set", handleServerSettingsSet);
    messageHandler_->registerMethodHandler("alfa.server.setting.get", handleServerSettingsGet);
    
    try {
        // Set up event callback and start protocol listening
        LOG_INFO("Application Starting");
        protocol_->setEventCallback([this](const ProtocolEventParams& eventParams) {
            handleProtocolEvent(eventParams);  // Call the member function on the instance
        });
        protocol_->startListening();

        // Simulating some database interaction
        if (db_->connect(db_->dbConfig.connectionStringOrFilePath)) {
            LOG_INFO("Database Connected!");
            protocol_->sendData("Connected to Database!");
        } else {
            LOG_ERROR("Database Connected!");
            return;
        }

        protocol_->sendData("Hello from ApplicationHandler!");

        // std::vector<std::string> results = db_->query("ballonet_pressure_sensor_readings");

        // for (const auto& doc : results) {
        //     protocol_->sendData(doc);
        //     sleep(1);
        // }

    } catch (const std::exception& ex) {
        LOG_ERROR("Application Exception");
    }
}
