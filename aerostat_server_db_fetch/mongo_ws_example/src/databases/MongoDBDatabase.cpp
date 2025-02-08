#include <iostream>
#include <iomanip>
#include <sstream>
#include <mongocxx/uri.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/builder/stream/array.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <mongocxx/exception/exception.hpp>
#include <mongocxx/instance.hpp>
#include "databases/MongoDBDatabase.h"
#include "logger/logger.h"

using namespace bsoncxx::builder::stream;
namespace bson = bsoncxx;

MongoDBDatabase::~MongoDBDatabase() {
    LOG_WARNING("CALLING DESTRUCTOR MONGODBDATABASE");
    if (client_) {
        disconnect();
    }
}

std::string get_current_timestamp() {
    auto now = std::chrono::system_clock::now();
    auto time_t_now = std::chrono::system_clock::to_time_t(now);
    
    std::ostringstream oss;
    oss << std::put_time(std::localtime(&time_t_now), "%Y-%m-%d %H:%M:%S");
    
    return oss.str();
}

bool MongoDBDatabase::connect(const std::string& connectionString) {

    std::string __connectionString = dbConfig.connectionStringOrFilePath;
    try {
        static mongocxx::instance inst{};
        // Create a MongoDB client using the provided connection string
        client_ = new mongocxx::client(mongocxx::uri(__connectionString));

        // Extract the database name from the connection string
        auto lastSlashPos = __connectionString.find_last_of('/');
        if (lastSlashPos == std::string::npos || lastSlashPos == __connectionString.size() - 1) {
            LOG_ERROR("Invalid connection string: Database name is missing.");
            return false;
        }

        // Get the database name and assign it to the db_ member
        std::string dbName = __connectionString.substr(lastSlashPos + 1);
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

bool MongoDBDatabase::insert(const std::string& table, const std::string& jsonData, std::map <std::string, std::vector<int>>extraArgs) {
    std::unique_lock<std::mutex> lock(mtx);
    if(!connect("not needed string"))
    {
        LOG_ERROR("DB NOT CONNECTED");
    }
    LOG_SUCCESS("DB CONNECTED SUCCESSFULLY");

    // if (!db_) {
    //     LOG_ERROR("Database is not connected!");
    //     return false;
    // }

    try {
        // Parse JSON input
        nlohmann::json json = nlohmann::json::parse(jsonData);
        auto collection = (*db_)[table];

        // Start building the BSON document
        bsoncxx::builder::stream::document document{};
        document << "_id" << bsoncxx::oid()  // Automatically generate an ObjectId
                 << "timestamp" << get_current_timestamp();

        for (auto it = json.begin(); it != json.end(); ++it) {
            if (it->is_primitive()) {  // Only print if it's not an object or array
                // std::cout << "Key: " << it.key() << ", Value: " << it.value() << std::endl;
                LOG_WARNING("Key: %s, Value: %s", it.key().c_str(), it.value().dump().c_str());
                document << std::string(it.key()) << std::string(it.value());
            }
        }

        // Create a nested BSON document for the "value" field
        // bsoncxx::builder::stream::document valueDoc{};
        // for (const auto& [key, value] : json["data"].items()) {
        //     if (value.is_number_integer()) {
        //         valueDoc << key << value.get<int>();
        //     } else if (value.is_number_float()) {
        //         valueDoc << key << value.get<double>();
        //     } else if (value.is_string()) {
        //         valueDoc << key << value.get<std::string>();
        //     } else {
        //         LOG_ERROR("Unsupported data type for key: {}", key);
        //         return false;
        //     }
        // }

        // Add the nested "value" object to the main document
        // document << "value" << valueDoc.view();

        // std::map<std::string, std::vector<int>> testMap;
        // testMap["relay_test"] = std::vector<int>{3, 5, 6};
        for(const auto& extraArg : extraArgs){
            array myArray;
            for(const auto& relayNum : extraArg.second)
            {
                myArray << relayNum ;  // Appending values dynamically
            }
            document << extraArg.first << myArray;
        }


        // Insert the document into the collection
        collection.insert_one(document.view());
        LOG_SUCCESS("Data inserted to MONGODB Collection successfully");
        disconnect();
        lock.unlock();
        return true;
    } catch (const std::exception& e) {
        LOG_ERROR("Error inserting data into MongoDB: {}", e.what());
        disconnect();
        lock.unlock();
        return false;
    }
}

std::vector<std::string> MongoDBDatabase::query(const std::string& collection_name) {
    std::unique_lock<std::mutex> lock(mtx);
    std::vector<std::string> results;
    LOG_WARNING("Collection Name %s", collection_name.c_str());

    if(!connect("not needed string"))
    {
        LOG_ERROR("DB NOT CONNECTED");
    }
    LOG_SUCCESS("DB CONNECTED SUCCESSFULLY");

    // if (!db_) {
    //     LOG_ERROR("Database is not connected!");
    //     return results;
    // }

    try {
        auto collection = (*db_)[collection_name];

        // Querying the last document by sorting `_id` in descending order
        // auto cursor = collection.find({}, mongocxx::options::find{}.sort(bsoncxx::builder::basic::make_document(bsoncxx::builder::basic::kvp("_id", -1))).limit(1)); // Get only 1 document

        bsoncxx::builder::stream::document sort_builder;
        sort_builder << "_id" << -1;  // -1 for descending order

        mongocxx::options::find find_options;
        find_options.sort(sort_builder.view());

        auto latestDoc = collection.find_one({}, find_options);

        // Check if the cursor has any results before iterating
        // try {
        //     // Ensure the cursor is valid before accessing it
        //     // if(cursor.empty())
        //     // {
        //     //     LOG_ERROR("CURSOR EMPTY");
        //     //     while(1)
        //     //     {
        //     //     }
        //     // }
        //     auto it = cursor.begin();
        //     if (it == cursor.end()) {
        //         LOG_ERROR("No documents found in collection '{}'.", collection_name);
        //         return results;
        //     }
        // } catch (const std::runtime_error& e) {
        //     LOG_ERROR("Runtime error while iterating through the cursor: {}", e.what());
        //     return results;
        // } catch (const std::exception& e) {
        //     LOG_ERROR("General error while iterating through the cursor: {}", e.what());
        //     return results;
        // } catch (...) {
        //     LOG_ERROR("An unknown error occurred while iterating through the cursor.");
        //     return results;
        // }

        // for (auto&& doc : cursor) {
        //     try {
        //         std::string json_doc = bsoncxx::to_json(doc);
        //         LOG_DEBUG("Retrieved document: {}");
        //         results.push_back(json_doc);
        //     } catch (const std::exception& e) {
        //         LOG_ERROR("Failed to convert BSON to JSON: {}", e.what());
        //     }
        // }
        try{
            std::string json_doc = bsoncxx::to_json(latestDoc.value());
            results.push_back(json_doc);
        } catch(const std::exception& e) {
            LOG_ERROR("Failed to convert BSON to JSON: {}", e.what());
            disconnect();
            lock.unlock();
            return results;
        }
    } catch (const mongocxx::exception& e) {
        LOG_ERROR("Error querying MongoDB: {}", e.what());
        disconnect();
        lock.unlock();
        return results;
    }

    disconnect();
    lock.unlock();
    return results;
}

void MongoDBDatabase::disconnect() {
    LOG_INFO("DATABASE DISCONNECTED");
    if (client_) {
        delete db_;
        delete client_;
        client_ = nullptr;
        db_ = nullptr;
    }
}
