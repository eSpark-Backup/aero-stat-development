#include "database_factory/DatabaseFactory.h"
#include "databases/MongoDBDatabase.h"
#include "databases/LocalDatabase.h"
#include <stdexcept>


std::unique_ptr<Database> DatabaseFactory::createDatabase(DatabaseType type) {
    switch (type) {
        case DatabaseType::MONGO_DB:
            // For MongoDB, pass the connection string
            return std::make_unique<MongoDBDatabase>();
        
        case DatabaseType::LOCAL_DB:
            // For LocalDB, pass the file path
            return std::make_unique<LocalTextDatabase>();
        
        default:
            throw std::invalid_argument("Unknown database type");
    }
}
