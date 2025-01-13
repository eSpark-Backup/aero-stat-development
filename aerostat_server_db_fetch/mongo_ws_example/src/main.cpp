#include "DatabaseFactory.h"
#include "MongoDBDatabase.h"
#include "CommunicationProtocolFactory.h"
#include "HTTPProtocol.h"

int main() {
    // Example: Create a MongoDB database and connect
    // Database* db = new MongoDBDatabase();
    // if (db->connect("mongodb://localhost:27017/mydatabase")) {
    //     std::vector<std::string> data = {"Data1", "Data2", "Data3"};
    //     db->insert("mycollection", data);

    //     std::vector<std::string> result = db->query("mycollection");
    //     for (const auto& doc : result) {
    //         std::cout << doc << std::endl;
    //     }

    //     db->disconnect();
    // }

    // // Example: Create a protocol for communication
    // CommunicationProtocol* protocol = CommunicationProtocolFactory::createProtocol("HTTP");
    // protocol->sendData("Hello, world!");
    
    // delete db;
    // delete protocol;

    return 0;
}
