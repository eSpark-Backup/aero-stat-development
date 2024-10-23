#include <iostream>
#include <fstream>
#include <string>
#include <iomanip>
#include <ctime>
#include <sys/stat.h>
#include <direct.h>
#include <sstream>

// Constants
const size_t MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const std::string LOG_DIR_PATH = std::string(getenv("USERPROFILE")) + "\\logs"; // Home directory for logs
std::string log_file_path;

// Ensure the log directory exists
void setup_log_directory() {
    struct stat info;
    if (stat(LOG_DIR_PATH.c_str(), &info) != 0) {
        // Directory does not exist, create it
        _mkdir(LOG_DIR_PATH.c_str());
    } else if (!(info.st_mode & S_IFDIR)) {
        // Exists but is not a directory
        std::cerr << LOG_DIR_PATH << " is not a directory" << std::endl;
    }
}

// Get current date and time in the specified format
std::string get_current_datetime() {
    auto now = std::time(nullptr);
    std::tm tm = *std::localtime(&now);
    std::ostringstream oss;
    oss << std::put_time(&tm, "%d%m%Y_%H-%M-%S");
    return oss.str();
}

// Create a new log file
std::string create_log_file() {
    log_file_path = LOG_DIR_PATH + "/" + get_current_datetime() + ".txt";
    std::cout << "Log file created: " << log_file_path << std::endl;
    return log_file_path;
}

// Check if the file exceeds the max size
void check_file_size() {
    std::ifstream log_file(log_file_path, std::ios::ate | std::ios::binary);
    if (log_file.is_open() && log_file.tellg() >= MAX_LOG_FILE_SIZE) {
        // Close current log file (if needed) and create a new one
        log_file.close();
        create_log_file();
    }
}

// Log a message to the file
void log_message(const std::string& message) {
    if (log_file_path.empty()) {
        create_log_file();
    }

    std::ofstream log_file(log_file_path, std::ios_base::app);
    if (log_file.is_open()) {
        log_file << get_current_datetime() << " - " << message << std::endl;
    } else {
        std::cerr << "Unable to open log file: " << log_file_path << std::endl;
    }

    check_file_size();
}
