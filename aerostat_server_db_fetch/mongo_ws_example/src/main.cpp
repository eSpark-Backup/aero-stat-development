#include <iostream>
#include "applicationHandler/applicationHandler.h"
#include "database_factory/DatabaseFactory.h"
#include "logger/logger.h"
#include "protocol_base/CommunicationProtocolFactory.h"
#include "alfa_util/alfa_info.h"
#include <string>


int main() {
    Logger& logger = Logger::getInstance();
    logger.setLogLevel(Logger::DEBUG);
    // logger.setLogFile();

    printBuildInfo();

    try {
        DatabaseConfig mongoConfig(DatabaseType::MONGO_DB, "mongodb://localhost:27017/alfacor01");
        DatabaseConfig localDbConfig(DatabaseType::LOCAL_DB, "local_database_test.txt");

        DatabaseConfig dbConfig = mongoConfig;
        // DatabaseConfig dbConfig = localDbConfig;

        std::unique_ptr<MessageHandler> messageHandler = std::make_unique<MessageHandler>();

        auto protocol = CommunicationProtocolFactory::createProtocol(ProtocolType::UWS);
        auto db = DatabaseFactory::createDatabase(dbConfig);

        ApplicationHandler appHandler(std::move(db), std::move(protocol), std::move(messageHandler));
        
        appHandler.start();

    } catch (const std::exception& ex) {
        LOG_ERROR("Exception Error: ");
        return 1;
    }

    return 0;
}
