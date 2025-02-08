#ifndef APPLICATION_HANDLER_H
#define APPLICATION_HANDLER_H

#include <memory>
#include <iostream>
#include "protocolBase/CommunicationProtocolFactory.h"
#include "databaseFactory/DatabaseFactory.h"
#include "messageHandler/messageHandler.h"
#include "configManager/configManager.h"

class Database;
class CommunicationProtocol;

class ApplicationHandler {
public:
    ApplicationHandler(std::unique_ptr<Database> db, std::unique_ptr<CommunicationProtocol> protocol, std::unique_ptr<MessageHandler> messageHandler)
        : db_(std::move(db)), protocol_(std::move(protocol)), messageHandler_(std::move(messageHandler))  {
    }

    void handleProtocolEvent(const ProtocolEventParams& eventParams);
    void continuouslyUpdateFrontend();
    void continuouslyReadSensorData();
    void start();
    std::unique_ptr<MessageHandler> messageHandler_;
    std::unique_ptr<CommunicationProtocol> protocol_; // Unique pointer to Protocol

private:
    std::unique_ptr<Database> db_;                // Unique pointer to Database
};


#endif //APPLICATION_HANDLER_H