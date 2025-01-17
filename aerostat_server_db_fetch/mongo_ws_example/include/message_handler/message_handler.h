#include <iostream>
#include <string>
#include <unordered_map>
#include <functional>
#include <nlohmann/json.hpp> // JSON library
#include "logger/logger.h"

using json = nlohmann::json;

class MessageHandler {
public:
    using MethodHandler = std::function<json(const json&)>;

    void registerMethodHandler(const std::string& method, MethodHandler handler) {
        if (!handler) { 
            LOG_ERROR("Attempted to register a null handler for method: %s", method.c_str());
            return;
        }

        methodHandlers[method] = std::move(handler);
        LOG_SUCCESS("Handler registered for method: %s", method.c_str());
    }


    std::string handleMessage(const std::string& message) const {
        try {
            json parsedJson = json::parse(message);
            std::string method = parsedJson["method"];
            LOG_SUCCESS("Method: %s", method.c_str());

            auto it = methodHandlers.find(method);
            if (it != methodHandlers.end()) {
                LOG_SUCCESS("Message received >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> : \n%s", parsedJson.dump(4).c_str());

                json responseJson = it->second(parsedJson);

                return responseJson.dump(4); // Pretty print with 4 spaces
            } else {
                LOG_ERROR("No handler registered for method: %s", method.c_str());
                json errorResponse = {
                    {"error", "No handler registered for method: " + method},
                };
                return errorResponse.dump(4);
            }
        } catch (const json::exception& e) {
            LOG_ERROR("JSON ERROR: %s", e.what());
            json errorResponse = {
                {"error", "JSON parsing error: " + std::string(e.what())},
            };
            return errorResponse.dump(4);
        }
    }


private:
    std::unordered_map<std::string, MethodHandler> methodHandlers;
};