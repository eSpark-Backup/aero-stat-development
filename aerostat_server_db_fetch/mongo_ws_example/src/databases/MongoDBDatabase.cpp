#include "databases/MongoDBDatabase.h"
#include <iostream>
#include <mongocxx/uri.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include <mongocxx/exception/exception.hpp>
#include "logger/logger.h"


MongoDBDatabase::MongoDBDatabase() : client_(nullptr), db_(nullptr) {}

MongoDBDatabase::~MongoDBDatabase() {
    if (client_) {
        disconnect();
    }
}

bool MongoDBDatabase::connect(const std::string& connectionString) {
    try {
        client_ = new mongocxx::client(mongocxx::uri(connectionString));
        db_ = new mongocxx::database((*client_)[connectionString.substr(connectionString.find_last_of('/') + 1)]);
        return true;
    } catch (const mongocxx::exception& e) {
        // std::cerr << "Error connecting to MongoDB: " << e.what() << std::endl;
        LOG_ERROR("Error connecting to MongoDB");
        return false;
    }
}

bool MongoDBDatabase::insert(const std::string& table, const std::vector<std::string>& data) {
    if (!db_) {
        // std::cerr << "Database is not connected!" << std::endl;
        LOG_ERROR("Database is not connected!");
        return false;
    }

    try {
        auto collection = (*db_)[table];
        for (const auto& item : data) {
            bsoncxx::builder::stream::document document{};
            document << "data" << item;
            collection.insert_one(document.view());
        }
        return true;
    } catch (const mongocxx::exception& e) {
        // std::cerr << "Error inserting data into MongoDB: " << e.what() << std::endl;
        LOG_ERROR("Error inserting data into MongoDB");
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
