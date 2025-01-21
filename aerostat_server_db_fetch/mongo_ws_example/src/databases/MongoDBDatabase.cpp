#include <iostream>
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
