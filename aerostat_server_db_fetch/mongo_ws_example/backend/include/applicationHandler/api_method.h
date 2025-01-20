#ifndef API_METHOD_H
#define API_METHOD_H

#include "logger/logger.h"
#include "nlohmann/json.hpp"

using json = nlohmann::json;

json handleServerSettingsSet(const json& parsedJson);
json handleServerSettingsGet(const json& parsedJson);
json handleVersionGet(const json& parsedJson);

#endif //API_METHOD_H