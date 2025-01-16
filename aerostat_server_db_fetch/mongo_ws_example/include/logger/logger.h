#ifndef LOGGER_H
#define LOGGER_H

#include <string>
#include <mutex>
#include <fstream>
#include <memory>

class Logger {
public:
    enum LogLevel {
        VERBOSE,
        DEBUG,
        INFO,
        WARNING,
        ERROR,
    };

    static Logger& getInstance();

    void setLogLevel(LogLevel level);
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
    LogLevel logLevel = INFO;
    std::ofstream logFile;
    std::mutex mutex;

    Logger();
    ~Logger();
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;

    std::string formatLogMessage(LogLevel level, const std::string& message);
    std::string getCurrentTime();
    std::string logLevelToString(LogLevel level);

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

#define LOG_DEBUG(message, ...) Logger::getInstance().log(Logger::DEBUG, message, ##__VA_ARGS__)
#define LOG_INFO(message, ...) Logger::getInstance().log(Logger::INFO, message, ##__VA_ARGS__)
#define LOG_WARNING(message, ...) Logger::getInstance().log(Logger::WARNING, message, ##__VA_ARGS__)
#define LOG_ERROR(message, ...) Logger::getInstance().log(Logger::ERROR, message, ##__VA_ARGS__)
#define LOG_VERBOSE(message, ...) Logger::getInstance().log(Logger::VERBOSE, message, ##__VA_ARGS__)

#endif // LOGGER_H
