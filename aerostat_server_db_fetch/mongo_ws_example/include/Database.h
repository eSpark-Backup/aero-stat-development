#ifndef DATABASE_H
#define DATABASE_H

#include <string>
#include <vector>

class Database {
public:
    virtual ~Database() = default;
    
    virtual bool connect(const std::string& connectionString) = 0;
    virtual bool insert(const std::string& table, const std::vector<std::string>& data) = 0;
    virtual std::vector<std::string> query(const std::string& query) = 0;
    virtual void disconnect() = 0;
};

#endif // DATABASE_H
