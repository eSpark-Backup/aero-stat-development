#ifndef MONGODB_DATABASE_H
#define MONGODB_DATABASE_H

#include "databaseFactory/Database.h"
#include <mongocxx/client.hpp>
#include <mongocxx/database.hpp>
#include <mongocxx/collection.hpp>
#include <mongocxx/stdx.hpp>
#include <bsoncxx/json.hpp>
#include <vector>

class MongoDBDatabase : public Database {
public:
    explicit MongoDBDatabase(const DatabaseConfig& config) : Database(config) {}
    ~MongoDBDatabase() override;

    bool connect(const std::string& connectionString) override;
    bool insert(const std::string& table, const std::string& jsonData, std::map<std::string, std::vector<int>> extraArgs) override;
    std::vector<std::string> query(const std::string& query) override;
    void disconnect() override;

private:
    mongocxx::client* client_;
    mongocxx::database* db_;
};

#endif // MONGODB_DATABASE_H
