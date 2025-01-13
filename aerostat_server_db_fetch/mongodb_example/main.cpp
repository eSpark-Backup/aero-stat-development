#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include <iostream>

int main() {
    mongocxx::instance instance{}; // Initialize the MongoDB driver.
    mongocxx::client client{mongocxx::uri{"mongodb://localhost:27017"}};

    auto db = client["testdb"];
    auto collection = db["testcollection"];
    bsoncxx::builder::stream::document document{};

    document << "name" << "Alice" << "age" << 30;

    collection.insert_one(document.view());
    std::cout << "Document inserted!" << std::endl;

    return 0;
}
