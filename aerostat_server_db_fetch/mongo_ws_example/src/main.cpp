#include "protocol_base/CommunicationProtocolFactory.h"
#include "database_factory/DatabaseFactory.h"
#include <iostream>
#include <thread>
#include <chrono>
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

int main() {
    Logger& logger = Logger::getInstance();
    logger.setLogLevel(Logger::DEBUG);
    // logger.setLogFile();

    try {
        DatabaseConfig mongoConfig(DatabaseType::MONGO_DB, "mongodb://localhost:27017/alfacor01");
        DatabaseConfig localDbConfig(DatabaseType::LOCAL_DB, "local_database.txt");

        DatabaseConfig dbConfig = mongoConfig;

        auto protocol = CommunicationProtocolFactory::createProtocol(ProtocolType::UWS);
        auto db = DatabaseFactory::createDatabase(dbConfig.type);

        protocol->setEventCallback(handleProtocolEvent);

        protocol->startListening();

        std::this_thread::sleep_for(std::chrono::seconds(10));

        if (db->connect(dbConfig.connectionStringOrFilePath)) {
            LOG_DEBUG("Connected to Database!");
            protocol->sendData("Connected to Database!");
        } else {
            LOG_DEBUG("Failed to connect to Database!");
            return 1;
        }

        protocol->sendData("Hello from WebSocket!");

        std::vector<std::string> results = db->query("ballonet_pressure_sensor_readings");

        for (const auto& doc : results) {
            protocol->sendData(doc);
            sleep(1);
        }

        std::this_thread::sleep_for(std::chrono::seconds(10));

        LOG_DEBUG("Shutting down protocol listener...");

    } catch (const std::exception& ex) {
        LOG_ERROR("Exception Error: ");
        return 1;
    }

    return 0;
}
