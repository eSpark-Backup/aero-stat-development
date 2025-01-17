#include <memory>
#include <iostream>
#include "applicationHandler/applicationHandler.h"
#include "logger/logger.h"
#include "nlohmann/json.hpp"
#include "applicationHandler/api_method.h"

void ApplicationHandler::handleProtocolEvent(const ProtocolEventParams& eventParams) {
    switch (eventParams.type) {
        case ProtocolEvent::MESSAGE_RECEIVED:
        {
            try {
                std::string messageResponse = messageHandler_->handleMessage(eventParams.eventData.messageReceived.message);
                LOG_SUCCESS("Messag sent >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> :\n%s", messageResponse.c_str());
                protocol_->sendData(messageResponse);
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
    //Setters
    messageHandler_->registerMethodHandler("alfa.server.setting.set", handleServerSettingsSet);
    messageHandler_->registerMethodHandler("alfa.phase.setting.set", NULL);
    messageHandler_->registerMethodHandler("alfa.db.setting.set", NULL);
    messageHandler_->registerMethodHandler("alfa.playback.settings.set", NULL);
    messageHandler_->registerMethodHandler("alfa.braodcast.data.set", NULL);
    messageHandler_->registerMethodHandler("alfa.relay.item.set", NULL);
    messageHandler_->registerMethodHandler("alfa.fan.item.set", NULL);

    //Getters
    messageHandler_->registerMethodHandler("alfa.server.setting.get", handleServerSettingsGet);
    messageHandler_->registerMethodHandler("alfa.modbus.reading.get", NULL);
    messageHandler_->registerMethodHandler("alfa.tcp.reading.get", NULL);
    messageHandler_->registerMethodHandler("alfa.modbus.status.get", NULL);
    messageHandler_->registerMethodHandler("alfa.tcp.status.get", NULL);
    messageHandler_->registerMethodHandler("alfa.db.status.get", NULL);
    messageHandler_->registerMethodHandler("alfa.version.get", handleVersionGet);
    
    try {
        LOG_INFO("Application Starting");
        protocol_->setEventCallback([this](const ProtocolEventParams& eventParams) {
            handleProtocolEvent(eventParams);  // Call the member function on the instance
        });
        protocol_->startListening();

        if (db_->connect(db_->dbConfig.connectionStringOrFilePath)) {
            LOG_INFO("Database Connected!");
            protocol_->sendData("Connected to Database!");
        } else {
            LOG_ERROR("Database Connected!");
            return;
        }

        protocol_->sendData("Hello from ApplicationHandler!");

    } catch (const std::exception& ex) {
        LOG_ERROR("Application Exception");
    }
}
