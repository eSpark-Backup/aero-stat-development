#ifndef DATABASE_FACTORY_H
#define DATABASE_FACTORY_H

#include "Database.h"
#include <memory>

class DatabaseFactory {
public:
    static std::unique_ptr<Database> createDatabase(const std::string& type);
};

#endif // DATABASE_FACTORY_H
