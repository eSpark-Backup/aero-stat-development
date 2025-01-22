#ifndef COMMUNICATION_PROTOCOL_FACTORY_H
#define COMMUNICATION_PROTOCOL_FACTORY_H

#include "CommunicationProtocol.h"
#include <memory>
#include <string>

enum class ProtocolType {
    HTTP,
    UWS
};

class CommunicationProtocolFactory {
public:
    static std::unique_ptr<CommunicationProtocol> createProtocol(ProtocolType type);
};

#endif // COMMUNICATION_PROTOCOL_FACTORY_H
