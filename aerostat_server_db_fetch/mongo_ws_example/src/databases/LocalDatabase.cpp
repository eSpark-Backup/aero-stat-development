#include "databases/LocalDatabase.h"
#include <iostream>
#include <fstream>
#include <sstream>

LocalTextDatabase::LocalTextDatabase() : isConnected_(false) {}

LocalTextDatabase::~LocalTextDatabase() {
    if (isConnected_) {
        disconnect();
    }
}

bool LocalTextDatabase::connect(const std::string& filePath) {
    filePath_ = filePath;
    std::ofstream file(filePath_, std::ios::app); // Open in append mode to ensure file exists
    if (!file.is_open()) {
        std::cerr << "Error: Could not open file at " << filePath_ << std::endl;
        return false;
    }
    isConnected_ = true;
    file.close();
    return true;
}

bool LocalTextDatabase::insert(const std::string& table, const std::vector<std::string>& data) {
    if (!isConnected_) {
        std::cerr << "Error: Database is not connected!" << std::endl;
        return false;
    }

    try {
        std::ofstream file(filePath_, std::ios::app); // Open in append mode
        if (!file.is_open()) {
            std::cerr << "Error: Could not open file for writing." << std::endl;
            return false;
        }

        for (const auto& item : data) {
            file << table << ": " << item << std::endl; // Store data in "table: data" format
        }
        file.close();
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Error inserting data into file: " << e.what() << std::endl;
        return false;
    }
}

std::vector<std::string> LocalTextDatabase::query(const std::string& table) {
    std::vector<std::string> results;

    if (!isConnected_) {
        std::cerr << "Error: Database is not connected!" << std::endl;
        return results;
    }

    try {
        std::ifstream file(filePath_);
        if (!file.is_open()) {
            std::cerr << "Error: Could not open file for reading." << std::endl;
            return results;
        }

        std::string line;
        while (std::getline(file, line)) {
            // if (line.find(table + ": ") == 0) { // Check if line starts with "table: "
                results.push_back(line.substr(table.length() + 2)); // Extract data after "table: "
            // }
        }
        file.close();
    } catch (const std::exception& e) {
        std::cerr << "Error querying file: " << e.what() << std::endl;
    }

    return results;
}

void LocalTextDatabase::disconnect() {
    if (isConnected_) {
        isConnected_ = false;
        filePath_.clear();
    }
}
