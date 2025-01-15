#include "protocol_base/CommunicationProtocolFactory.h"
#include "protocols/WebsocketProtocol.h"
#include <stdexcept>
// Include other protocols if needed (e.g., WebSocketProtocol)

std::unique_ptr<CommunicationProtocol> CommunicationProtocolFactory::createProtocol(ProtocolType type) {
    if (type == ProtocolType::UWS) {
        return std::make_unique<WebSocketProtocol>("ws://localhost:9001");
    }
    throw std::runtime_error("Unsupported protocol: ");
}