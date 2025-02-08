#ifndef CLOUD_LOGGER_H
#define CLOUD_LOGGER_H

#include "logger/logger.h"
#include "databases/MongoDBDatabase.h"
// #include "databases/LocalDatabase.h"

class cloudLogger {
public:
    static cloudLogger& getInstance() {
        static cloudLogger instance;
        return instance;
    }

    // Deleting copy constructor and assignment operator to enforce singleton pattern
    cloudLogger(const cloudLogger&) = delete;
    cloudLogger& operator=(const cloudLogger&) = delete;

    MongoDBDatabase cloudDb;
private:
    // Private constructor
    // DatabaseConfig mongoConfig(DatabaseType::MONGO_DB, "mongodb://localhost1:27017/alfacor01");
    // DatabaseConfig localDbConfig(DatabaseType::LOCAL_DB, "local_database_test.txt");

    cloudLogger() : cloudDb({DatabaseType::MONGO_DB, "mongodb://10.85.5.11:27017/alfacor01"}) { //10.85.5.11
        // if(cloudDb.connect("not needed string"))
        // {
        //     LOG_SUCCESS("DB CONNECTED SUCCESSFULLY");
        // }
    }

};



#endif //CLOUD_LOGGER_H