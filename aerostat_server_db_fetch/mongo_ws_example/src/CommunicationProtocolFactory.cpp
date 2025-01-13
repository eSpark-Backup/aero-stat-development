#include "CommunicationProtocolFactory.h"
#include "HTTPProtocol.h"
#include <stdexcept>
// Include other protocols if needed (e.g., WebSocketProtocol)

std::unique_ptr<CommunicationProtocol> CommunicationProtocolFactory::createProtocol(const std::string& type) {
    if (type == "http") {
        return std::make_unique<HTTPProtocol>();
    }
    // Add more conditions here to return different protocols
    throw std::invalid_argument("Unsupported communication protocol");
}
