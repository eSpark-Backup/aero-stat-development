#ifndef COMMUNICATION_PROTOCOL_FACTORY_H
#define COMMUNICATION_PROTOCOL_FACTORY_H

#include "CommunicationProtocol.h"
#include <memory>

class CommunicationProtocolFactory {
public:
    static std::unique_ptr<CommunicationProtocol> createProtocol(const std::string& type);
};

#endif // COMMUNICATION_PROTOCOL_FACTORY_H
