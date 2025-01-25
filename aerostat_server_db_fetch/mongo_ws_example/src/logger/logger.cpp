#include "logger/logger.h"
#include <iostream>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <memory>
#include <stdexcept>
#include <unistd.h>   
#include <filesystem>

Logger& Logger::getInstance() {
    static Logger instance;
    return instance;
}

Logger::Logger() = default;

Logger::~Logger() {
    if (logFile.is_open()) {
        logFile.close();
    }
}

void Logger::setLogLevel(LogLevel level) {
    logLevel = level;
}

void Logger::setLogLevel(std::string level_string) {
    for (int i = LogLevel::VERBOSE; i <= LogLevel::NONE; i++) { 
        if (logLevelToString(static_cast<LogLevel>(i)) == level_string) {
            setLogLevel(static_cast<LogLevel>(i)); 
            return; 
        }
    }
    throw std::invalid_argument("Invalid log level: " + level_string);
}


void Logger::setLogFile() {
    std::lock_guard<std::mutex> lock(mutex);

    // Fetch the current user's name
    const char* username = getlogin();
    if (!username) {
        username = "unknown"; // Fallback value
    }

    // Get the current date and time
    auto now = std::chrono::system_clock::now();
    std::time_t currentTime = std::chrono::system_clock::to_time_t(now);
    std::tm localTime = *std::localtime(&currentTime);

    // Format the date and time as "YYYY-MM-DD_HH-MM-SS.log"
    std::ostringstream fileNameStream;
    fileNameStream << std::put_time(&localTime, "%Y-%m-%d_%H-%M-%S") << ".log";
    std::string logFileName = fileNameStream.str();

    // Construct the log file path
    std::string defaultLogDir = "/home/" + std::string(username) + "/alfalogs";
    std::string fullPath = defaultLogDir + "/" + logFileName;

    // Ensure the directory exists
    std::filesystem::create_directories(defaultLogDir);

    // Close any previously open log file
    if (logFile.is_open()) {
        logFile.close();
    }

    // Open the new log file
    logFile.open(fullPath, std::ios::out | std::ios::app);
    if (!logFile.is_open()) {
        throw std::runtime_error("Failed to open log file: " + fullPath);
    }

    // Optionally, print or log the file path being used
    std::cout << "Log file set to: " << fullPath << std::endl;
}

void Logger::log(LogLevel level, const std::string& message) {
    if (level < logLevel) {
        return;
    }

    std::lock_guard<std::mutex> lock(mutex);
    std::string logMessage = formatLogMessage(level, message);

    // Write to console
    std::cout << logMessage << std::endl;

    // Write to file if set
    if (logFile.is_open()) {
        logFile << logMessage << std::endl;
    }
}

std::string Logger::formatLogMessage(LogLevel level, const std::string& message) {
    constexpr int timeWidth = 10;       // Fixed width for the timestamp
    constexpr int levelWidth = 10;     // Fixed width for the log level
    constexpr int messageIndent = 0;  // Indent for the message

    std::ostringstream oss;
    oss << std::left
        << "[" << std::setw(timeWidth - 2) << getCurrentTime() << "] " // Adjust for the square brackets
        << "[" << std::setw(levelWidth - 2) << logLevelToString(level) << "] " 
        << std::string(messageIndent, ' ') << message;

    return oss.str();
}


std::string Logger::getCurrentTime() {
    std::time_t now = std::time(nullptr);
    char buf[20]; // Format: YYYY-MM-DD HH:MM:SS
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", std::localtime(&now));
    return buf;
}

std::string Logger::logLevelToString(LogLevel level) {
    switch (level) {
        case NONE: return "NONE";
        case DEBUG: return "DEBUG";
        case INFO: return "INFO";
        case WARNING: return "WARNING";
        case ERROR: return "ERROR";
        case SUCCESS: return "SUCCESS";
        case VERBOSE: return "VERBOSE";
        default: return "UNKNOWN";
    }
}