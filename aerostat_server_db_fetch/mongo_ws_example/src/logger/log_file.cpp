#include <ctime>
#include <string>
#include <sstream>
#include <iomanip>
#include <fstream>
#include <iostream>
#include <sys/stat.h>

// Constants
const size_t MAX_LOG_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
#ifdef WINDOWS
#include <direct.h>
const std::string LOG_DIR_PATH = std::string(getenv("USERPROFILE")) + "\\logs";
#else
const std::string LOG_DIR_PATH = "/home/logs";
#endif
std::string log_file_path;

void setup_log_directory() {
    struct stat info;
    if (stat(LOG_DIR_PATH.c_str(), &info) != 0) {
#ifdef WINDOWS     
        _mkdir(LOG_DIR_PATH.c_str());
#else
        mkdir(LOG_DIR_PATH.c_str(), 0755);
#endif        
    } else if (!(info.st_mode & S_IFDIR)) {
        std::cerr << LOG_DIR_PATH << " is not a directory" << std::endl;
    }
}

std::string get_current_datetime() {
    auto now = std::time(nullptr);
    std::tm tm = *std::localtime(&now);
    std::ostringstream oss;
    oss << std::put_time(&tm, "%d%m%Y %H:%M:%S");
    return oss.str();
}

std::string create_log_file() {
    log_file_path = LOG_DIR_PATH + "/" + get_current_datetime() + ".txt";
    std::cout << "Log file created: " << log_file_path << std::endl;
    return log_file_path;
}

void check_file_size() {
    std::ifstream log_file(log_file_path, std::ios::ate | std::ios::binary);
    if (log_file.is_open() && log_file.tellg() >= MAX_LOG_FILE_SIZE) {
        log_file.close();
        create_log_file();
    }
}

void log_message(const std::string& message) {
    if (log_file_path.empty()) {
        create_log_file();
    }

    std::ofstream log_file(log_file_path, std::ios_base::app);
    if (log_file.is_open()) {
        log_file << get_current_datetime() << "\t" << message << std::endl;
    } else {
        std::cerr << "Unable to open log file: " << log_file_path << std::endl;
    }

    check_file_size();
}
