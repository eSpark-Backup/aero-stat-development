#ifndef LOCAL_TEXT_DATABASE_H
#define LOCAL_TEXT_DATABASE_H

#include "databaseFactory/Database.h"
#include <string>
#include <vector>

class LocalTextDatabase : public Database {
public:
    explicit LocalTextDatabase(const DatabaseConfig& config) : Database(config) {}
    ~LocalTextDatabase() override;

    bool connect(const std::string& filePath) override;
    bool insert(const std::string& table, const std::string& jsonData, std::map<std::string, std::vector<int>> extraArgs = {})  override;
    std::vector<std::string> query(const std::string& table) override;
    void disconnect() override;

private:
    std::string filePath_;
    bool isConnected_;
};

#endif // LOCAL_TEXT_DATABASE_H
