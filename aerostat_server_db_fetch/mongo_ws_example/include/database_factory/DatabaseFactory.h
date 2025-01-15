#ifndef DATABASE_FACTORY_H
#define DATABASE_FACTORY_H

#include "Database.h"
#include <memory>

enum class DatabaseType {
    MONGO_DB,
    LOCAL_DB
};

struct DatabaseConfig {
    DatabaseType type;
    std::string connectionStringOrFilePath;  // This will hold either the connection string or file path

    // Constructor to initialize the struct
    DatabaseConfig(DatabaseType t, const std::string& config)
        : type(t), connectionStringOrFilePath(config) {}
};

class DatabaseFactory {
public:
    static std::unique_ptr<Database> createDatabase(DatabaseType type);
};

#endif // DATABASE_FACTORY_H
