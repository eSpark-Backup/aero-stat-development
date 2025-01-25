#ifndef LOGGER_H
#define LOGGER_H

#include <string>
#include <mutex>
#include <fstream>
#include <memory>
#include "trace_util.h"

class Logger {
public:
    enum LogLevel {
        VERBOSE,
        DEBUG,
        INFO,
        SUCCESS,
        WARNING,
        ERROR,
        NONE,
    };

    static Logger& getInstance();
    std::string logLevelToString(LogLevel level);
    void setLogLevel(LogLevel level);
    LogLevel getLogLevel(){
        return logLevel;
    }
    void setLogLevel(std::string level_string);
    void setLogFile();
    void log(LogLevel level, const std::string& message);

    template<typename... Args>
    void log(LogLevel level, const std::string& format, Args... args) {
        if (level < logLevel) {
            return;
        }

        std::string formattedMessage = formatString(format, args...);
        log(level, formattedMessage);
    }

private:
    LogLevel logLevel = DEBUG;
    std::ofstream logFile;
    std::mutex mutex;

    Logger();
    ~Logger();
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;

    std::string formatLogMessage(LogLevel level, const std::string& message);
    std::string getCurrentTime();

    template<typename... Args>
    std::string formatString(const std::string& format, Args... args) {
        size_t size = std::snprintf(nullptr, 0, format.c_str(), args...) + 1;
        if (size <= 0) {
            throw std::runtime_error("Error formatting string");
        }
        std::unique_ptr<char[]> buf(new char[size]);
        std::snprintf(buf.get(), size, format.c_str(), args...);
        return std::string(buf.get(), buf.get() + size - 1);
    }
};



#endif // LOGGER_H
