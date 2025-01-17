#include <memory>
#include <iostream>
#include "applicationHandler/applicationHandler.h"
#include "logger/logger.h"
#include "nlohmann/json.hpp"
#include "config_manager/config_manager.h"

using json = nlohmann::json;

static void handleProtocolEvent(const ProtocolEventParams& eventParams) {
    switch (eventParams.type) {
        case ProtocolEvent::MESSAGE_RECEIVED:
        {
            LOG_SUCCESS("Message received from : %s : \n%s", eventParams.eventData.messageReceived.connectionId , eventParams.eventData.messageReceived.message );
            try {
                json parsed_json = json::parse(eventParams.eventData.messageReceived.message);
                std::string method = parsed_json["method"];
                LOG_DEBUG("Method: %s", method.c_str());

                for (const auto& server : parsed_json["servers"]) {
                    for (const auto& [protocol, servers] : server.items()) {
                        LOG_DEBUG("Protocol: %s", protocol.c_str());
                        for (const auto& serverConfig : servers) {
                            LOG_DEBUG("  Name: %s", serverConfig["name"].get<std::string>().c_str());
                            LOG_DEBUG("  IP: %s", serverConfig["ip"].get<std::string>().c_str());

                            for (const auto& port : serverConfig["ports"]) {
                                LOG_DEBUG("    Port: %s, Name: %s", port["port"].get<std::string>().c_str(), port["name"].get<std::string>().c_str());
                            }
                        }
                    }
                }
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
    ConfigManager configManager;

    ServerConfig config;

    ServerSetting tcpServer1 = {
        "tcp1", 
        "192.168.2.1", 
        {{"5002", "temperature"}, {"5003", "humidity"}}
    };

    ServerSetting modbusServer2 = {
        "modbus2", 
        "192.168.2.1", 
        {{"5002", "temperature"}, {"5003", "humidity"}}
    };

    config.tcp = {tcpServer1};
    config.modbus = {modbusServer2};

    configManager.saveServerConfig(config);

    configManager.reportConfigs();

    try {
        // Set up event callback and start protocol listening
        LOG_INFO("Application Starting");
        protocol_->setEventCallback(handleProtocolEvent);
        protocol_->startListening();

        // Simulating some database interaction
        if (db_->connect(db_->dbConfig.connectionStringOrFilePath)) {
            LOG_INFO("Database Connected!");
            protocol_->sendData("Connected to Database!");
        } else {
            LOG_ERROR("Database Connected!");
            return;
        }

        // Simulating sending some data over protocol
        protocol_->sendData("Hello from ApplicationHandler!");

        std::vector<std::string> results = db_->query("ballonet_pressure_sensor_readings");

        for (const auto& doc : results) {
            protocol_->sendData(doc);
            sleep(1);
        }

    } catch (const std::exception& ex) {
        // std::cerr << "Error: " << ex.what() << std::endl;
        LOG_ERROR("Application Exception");
    }
}
