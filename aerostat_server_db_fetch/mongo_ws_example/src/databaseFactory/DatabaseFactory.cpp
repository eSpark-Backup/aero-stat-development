#include "databaseFactory/DatabaseFactory.h"
#include "databases/MongoDBDatabase.h"
#include "databases/LocalDatabase.h"
#include <stdexcept>
#include "logger/logger.h"

std::unique_ptr<Database> DatabaseFactory::createDatabase(DatabaseConfig cfg) {
    DatabaseType type = cfg.type;
    switch (type) {
        case DatabaseType::MONGO_DB:
            // For MongoDB, pass the connection string
            LOG_INFO("Database Initialized : MONGODB");
            return std::make_unique<MongoDBDatabase>(cfg);
        
        case DatabaseType::LOCAL_DB:
            // For LocalDB, pass the file path
            LOG_INFO("Database Initialized : LOCALDB");
            return std::make_unique<LocalTextDatabase>(cfg);
        
        default:
            throw std::invalid_argument("Unknown database type");
    }
}
