#include "protocolBase/CommunicationProtocolFactory.h"
#include "protocols/WebsocketProtocol.h"
#include <stdexcept>
#include "logger/logger.h"
// Include other protocols if needed (e.g., WebSocketProtocol)

std::unique_ptr<CommunicationProtocol> CommunicationProtocolFactory::createProtocol(ProtocolType type) {
    if (type == ProtocolType::UWS) {
        LOG_INFO("Protocol Initialized : UWS");
        return std::make_unique<WebSocketProtocol>("ws://localhost:9001");
    }
    throw std::runtime_error("Unsupported protocol: ");
    LOG_ERROR("Unsupported Protocol");
}