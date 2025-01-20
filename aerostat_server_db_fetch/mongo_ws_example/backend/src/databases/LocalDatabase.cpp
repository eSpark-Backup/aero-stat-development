#include "databases/LocalDatabase.h"
#include <iostream>
#include <fstream>
#include <sstream>
#include "logger/logger.h"

LocalTextDatabase::~LocalTextDatabase() {
    if (isConnected_) {
        disconnect();
    }
}

bool LocalTextDatabase::connect(const std::string& filePath) {
    filePath_ = filePath;
    std::ofstream file(filePath_, std::ios::app); // Open in append mode to ensure file exists
    if (!file.is_open()) {
        // std::cerr << "Error: Could not open file at " << filePath_ << std::endl;
        LOG_ERROR("Could not open file at %s", filePath);
        return false;
    }
    isConnected_ = true;
    file.close();
    return true;
}

bool LocalTextDatabase::insert(const std::string& table, const std::vector<std::string>& data) {
    if (!isConnected_) {
        // std::cerr << "Error: Database is not connected!" << std::endl;
        LOG_ERROR("Database is not connected!");
        return false;
    }

    try {
        std::ofstream file(filePath_, std::ios::app); // Open in append mode
        if (!file.is_open()) {
            // std::cerr << "Error: Could not open file for writing." << std::endl;
            LOG_ERROR("Could not open file for writing.");    
            return false;
        }

        for (const auto& item : data) {
            file << table << ": " << item << std::endl; // Store data in "table: data" format
        }
        file.close();
        return true;
    } catch (const std::exception& e) {
        // std::cerr << "Error inserting data into file: " << e.what() << std::endl;
        LOG_ERROR("Error inserting data into file.");    
        return false;
    }
}

std::vector<std::string> LocalTextDatabase::query(const std::string& table) {
    std::vector<std::string> results;

    if (!isConnected_) {
        // std::cerr << "Error: Database is not connected!" << std::endl;
        LOG_ERROR("Database is not connected!");    
        return results;
    }

    try {
        std::ifstream file(filePath_);
        if (!file.is_open()) {
            // std::cerr << "Error: Could not open file for reading." << std::endl;
            LOG_ERROR("Could not open file for reading.");    
            return results;
        }

        std::string line;
        while (std::getline(file, line)) {
            // if (line.find(table + ": ") == 0) { // Check if line starts with "table: "
                results.push_back(line); // Extract data after "table: "
            // }
        }
        file.close();
    } catch (const std::exception& e) {
        // std::cerr << "Error querying file: " << e.what() << std::endl;
        LOG_ERROR("Error querying file.");    

    }

    return results;
}

void LocalTextDatabase::disconnect() {
    if (isConnected_) {
        isConnected_ = false;
        filePath_.clear();
    }
}
