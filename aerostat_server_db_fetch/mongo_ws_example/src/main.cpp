#include "protocol_base/CommunicationProtocolFactory.h"
#include "database_factory/DatabaseFactory.h"
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    try {
        // Create a protocol using the factory
        auto protocol = CommunicationProtocolFactory::createProtocol(ProtocolType::UWS);
        auto db = DatabaseFactory::createDatabase("mongodb");

        // Start listening (polymorphic call)
        protocol->startReading();
        std::string connectionString = "mongodb://localhost:27017/mydatabase";
        std::string filePath = "local_database.txt";

        // Simulate a running server for some time
        std::this_thread::sleep_for(std::chrono::seconds(10));

        // Connect to Database
        if (db->connect(connectionString)) {
            std::cout << "Connected to Database!" << std::endl;
            protocol->sendData("Connected to Database!");
        } else {
            std::cerr << "Failed to connect to Database!" << std::endl;
            protocol->sendData("Failed to connect to Database!");
            return 1;
        }

        // Send data over the protocol
        protocol->sendData("Hello from WebSocket!");

        // Query data from the database
        std::vector<std::string> results = db->query("mycollection");

        // Send data over WebSocket
        for (const auto& doc : results) {
            std::cout << "Sending document: " << doc << std::endl;
            protocol->sendData(doc);
        }

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
