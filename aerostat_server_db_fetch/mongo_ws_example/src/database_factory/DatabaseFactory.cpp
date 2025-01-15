#include "database_factory/DatabaseFactory.h"
#include "databases/MongoDBDatabase.h"
#include "databases/LocalDatabase.h"
#include <stdexcept>


std::unique_ptr<Database> DatabaseFactory::createDatabase(const std::string& type) {
    if (type == "mongodb") {
        return std::make_unique<MongoDBDatabase>();
    }
    if ( type == "localdb") {
        return std::make_unique<LocalTextDatabase>();
    }
    // Add more conditions here to return different database types (e.g., MySQL, SQLite, etc.)
    throw std::invalid_argument("Unsupported database type: " + type);
}
