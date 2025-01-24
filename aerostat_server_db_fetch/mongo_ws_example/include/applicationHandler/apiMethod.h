#ifndef API_METHOD_H
#define API_METHOD_H

#include "logger/logger.h"
#include "nlohmann/json.hpp"

using json = nlohmann::json;

json handleServerConnectionSettingsSet(const json& parsedJson);
json handleServerConnectionSettingsGet(const json& parsedJson);
json handleVersionGet(const json& parsedJson);
json handleBroadcastSetting(const json& parsedJson);
json handlePhaseSetting(const json& parseJson);
json handleActuatorSetting(const json& parseJson);
json handleLoggerSetting(const json& parseJson);

#endif //API_METHOD_H