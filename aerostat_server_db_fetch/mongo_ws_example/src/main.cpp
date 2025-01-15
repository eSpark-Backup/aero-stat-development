#include "protocol_base/CommunicationProtocolFactory.h"
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    try {
        // Create a protocol using the factory
        auto protocol = CommunicationProtocolFactory::createProtocol(ProtocolType::UWS);

        // Start listening (polymorphic call)
        protocol->startReading();

        // Send data over the protocol
        protocol->sendData("Hello from WebSocket!");

        // Simulate a running server for some time
        std::this_thread::sleep_for(std::chrono::seconds(10));

        // Properly clean up
        std::cout << "Shutting down protocol listener..." << std::endl;

    } catch (const std::exception& ex) {
        std::cerr << "Exception Error: " << ex.what() << std::endl;
        return 1;
    }

    return 0;
}
