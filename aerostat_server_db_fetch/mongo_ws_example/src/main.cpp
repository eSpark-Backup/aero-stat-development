#include <iostream>
#include "applicationHandler/applicationHandler.h"
#include "databaseFactory/DatabaseFactory.h"
#include "logger/logger.h"
#include "protocolBase/CommunicationProtocolFactory.h"
#include "alfaUtil/alfaInfo.h"
#include <string>


int main() {
    Logger& logger = Logger::getInstance();
    logger.setLogLevel(Logger::DEBUG);
    // logger.setLogFile();

    printBuildInfo();

    try {
        DatabaseConfig mongoConfig(DatabaseType::MONGO_DB, "mongodb://localhost1:27017/alfacor01");
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
