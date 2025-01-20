#ifndef DATABASE_H
#define DATABASE_H

#include <string>
#include <vector>

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

class Database {
public:
    explicit Database(const DatabaseConfig& config) : dbConfig(config) {}
    virtual ~Database() = default;
    
    virtual bool connect(const std::string& connectionString) = 0;
    virtual bool insert(const std::string& table, const std::vector<std::string>& data) = 0;
    virtual std::vector<std::string> query(const std::string& query) = 0;
    virtual void disconnect() = 0;
    DatabaseConfig dbConfig;
private: 
};

#endif // DATABASE_H
