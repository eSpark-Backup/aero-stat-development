#ifndef DATABASE_FACTORY_H
#define DATABASE_FACTORY_H

#include "Database.h"
#include <memory>

class DatabaseFactory {
public:
    static std::unique_ptr<Database> createDatabase(DatabaseConfig cfg);
};

#endif // DATABASE_FACTORY_H
