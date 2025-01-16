#ifndef APPLICATION_HANDLER_H
#define APPLICATION_HANDLER_H

#include <memory>
#include <iostream>
#include "protocol_base/CommunicationProtocolFactory.h"
#include "database_factory/DatabaseFactory.h"

class Database;
class CommunicationProtocol;

class ApplicationHandler {
public:
    ApplicationHandler(std::unique_ptr<Database> db, std::unique_ptr<CommunicationProtocol> protocol)
        : db_(std::move(db)), protocol_(std::move(protocol)) {
    }

    void start();

private:
    std::unique_ptr<Database> db_;                // Unique pointer to Database
    std::unique_ptr<CommunicationProtocol> protocol_; // Unique pointer to Protocol
};


#endif //APPLICATION_HANDLER_H