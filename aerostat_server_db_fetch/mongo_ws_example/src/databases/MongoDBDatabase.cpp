#include <iostream>
#include <iomanip>
#include <sstream>
#include <mongocxx/uri.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <mongocxx/exception/exception.hpp>
#include <mongocxx/instance.hpp>
#include "databases/MongoDBDatabase.h"
#include "logger/logger.h"


MongoDBDatabase::~MongoDBDatabase() {
    if (client_) {
        disconnect();
    }
}

bool MongoDBDatabase::connect(const std::string& connectionString) {
    try {
        mongocxx::instance inst{};
        // Create a MongoDB client using the provided connection string
        client_ = new mongocxx::client(mongocxx::uri(connectionString));

        // Extract the database name from the connection string
        auto lastSlashPos = connectionString.find_last_of('/');
        if (lastSlashPos == std::string::npos || lastSlashPos == connectionString.size() - 1) {
            LOG_ERROR("Invalid connection string: Database name is missing.");
            return false;
        }

        // Get the database name and assign it to the db_ member
        std::string dbName = connectionString.substr(lastSlashPos + 1);
        db_ = new mongocxx::database((*client_)[dbName]);

        const auto ping_cmd = bsoncxx::builder::basic::make_document(bsoncxx::builder::basic::kvp("ping", 1));
        db_->run_command(ping_cmd.view());

        LOG_INFO("Connected to MongoDB successfully: %s" , dbName.c_str());
        return true;
    } catch (const mongocxx::exception& e) {
        LOG_ERROR("Error connecting to MongoDB: %s" , std::string(e.what()).c_str());
        return false;
    }
}

bool MongoDBDatabase::insert(const std::string& table, const std::string& jsonData) {
    if (!db_) {
        LOG_ERROR("Database is not connected!");
        return false;
    }

    try {
        // Parse JSON input
        nlohmann::json json = nlohmann::json::parse(jsonData);
        auto collection = (*db_)[table];

        // Start building the BSON document
        bsoncxx::builder::stream::document document{};
        document << "_id" << bsoncxx::oid()  // Automatically generate an ObjectId
                 << "timestamp" << json["timestamp"].get<std::string>()
                 << "unit" << json["unit"].get<std::string>();

        // Create a nested BSON document for the "value" field
        bsoncxx::builder::stream::document valueDoc{};
        for (const auto& [key, value] : json["data"].items()) {
            if (value.is_number_integer()) {
                valueDoc << key << value.get<int>();
            } else if (value.is_number_float()) {
                valueDoc << key << value.get<double>();
            } else if (value.is_string()) {
                valueDoc << key << value.get<std::string>();
            } else {
                LOG_ERROR("Unsupported data type for key: {}", key);
                return false;
            }
        }

        // Add the nested "value" object to the main document
        document << "value" << valueDoc.view();

        // Insert the document into the collection
        collection.insert_one(document.view());
        LOG_SUCCESS("Data inserted to MONGODB Collection successfully");
        return true;
    } catch (const std::exception& e) {
        LOG_ERROR("Error inserting data into MongoDB: {}", e.what());
        return false;
    }
}

std::vector<std::string> MongoDBDatabase::query(const std::string& query) {
    std::vector<std::string> results;

    if (!db_) {
        // std::cerr << "Database is not connected!" << std::endl;
        LOG_ERROR("Database is not connected!");
        return results;
    }

    try {
        auto collection = (*db_)[query];  // Assuming query is collection name
        auto cursor = collection.find({});
        for (auto&& doc : cursor) {
            results.push_back(bsoncxx::to_json(doc));
        }
    } catch (const mongocxx::exception& e) {
        // std::cerr << "Error querying MongoDB: " << e.what() << std::endl;
        LOG_ERROR("Error querying MongoDB");
    }

    return results;
}

void MongoDBDatabase::disconnect() {
    if (client_) {
        delete db_;
        delete client_;
        client_ = nullptr;
        db_ = nullptr;
    }
}
