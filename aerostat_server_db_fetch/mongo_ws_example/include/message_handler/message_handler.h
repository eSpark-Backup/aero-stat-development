#include <iostream>
#include <string>
#include <unordered_map>
#include <functional>
#include <nlohmann/json.hpp> // JSON library
#include "logger/logger.h"

using json = nlohmann::json;

class MessageHandler {
public:
    using MethodHandler = std::function<void(const json&)>;

    void registerMethodHandler(const std::string& method, MethodHandler handler) {
        methodHandlers[method] = std::move(handler);
    }

    std::string handleMessage(const std::string& message) const {
        try {
            json parsedJson = json::parse(message);
            std::string method = parsedJson["method"];
            std::string response = "Method: " + method + "\n";

            LOG_SUCCESS("Method: %s\n", method.c_str());

            auto it = methodHandlers.find(method);
            if (it != methodHandlers.end()) {
                LOG_SUCCESS("Message received from : \n%s", parsedJson.dump(4).c_str());
                it->second(parsedJson); // Call the registered handler
                response += "Handler executed successfully.";
            } else {
                LOG_ERROR("No handler registered for method: %s\n", method.c_str());
                response += "No handler registered for this method.";
            }

            return response;  // Return the response string
        } catch (const json::exception& e) {
            LOG_ERROR("JSON ERROR: %s\n", e.what());
            return "JSON parsing error: " + std::string(e.what());
        }
    }

private:
    std::unordered_map<std::string, MethodHandler> methodHandlers;
};