#include <memory>
#include <iostream>
#include "applicationHandler/applicationHandler.h"
#include "logger/logger.h"

void handleProtocolEvent(const ProtocolEventParams& eventParams) {
    switch (eventParams.type) {
        case ProtocolEvent::MESSAGE_RECEIVED:
            LOG_INFO("Message received from : %s : %s", eventParams.eventData.messageReceived.connectionId , eventParams.eventData.messageReceived.message );
            break;
        case ProtocolEvent::CONNECTED:
            LOG_INFO("Connected to %s, %d" , eventParams.eventData.connected.host , ":" , eventParams.eventData.connected.port );
            break;
        case ProtocolEvent::DISCONNECTED:
            LOG_INFO("Disconnected. Reason: %s" , eventParams.eventData.disconnected.reason );
            break;
        case ProtocolEvent::ERROR_OCCURRED:
            LOG_INFO("Error occurred: %s" , eventParams.eventData.errorOccurred.errorMessage );
            break;
        default:
            LOG_INFO("Unknown event" );
            break;
    }
}

void ApplicationHandler::start() {
    try {
        // Set up event callback and start protocol listening
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
