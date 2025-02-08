#ifndef RELAY_MODBUS_SENSOR_H
#define RELAY_MODBUS_SENSOR_H

#include <iostream>
#include <optional>
#include <sstream>
#include <iomanip>
#include <random>
#include "sensorsManager/base/sensorBase.h"
#include "sensorsManager/sensors/commonSensorData/commonSensorData.h"
#include "sensorsManager/base/sensorFactory.h"
#include "logger/trace_util.h"

// Define relay button configurations
struct RelayConfig {
    std::string name;
    std::vector<int> relay_nums;
};

std::vector<RelayConfig> relay_configs = {
    {"primary_blower", {3}},
    {"secondary_blower", {5}},
    {"strobe_lights", {4, 6}},  // Controls both relays 4 and 6
    {"payload_power", {7}}
};

class RelayMod : public Sensor {
public:
    RelayMod(const std::string& name, sensorInterfaceType interfaceType, const ConnectionParams cp) : Sensor(interfaceType, cp) , name_(name) {
        data = std::make_shared<relayData>();
        dataToWrite = std::make_shared<relayWriteData>();
        mb_relay = new modbus(cp.ip, stoi(cp.port));
        relay_client = mb_relay->modbus_connect();
    }

    static void registerType() {
        SensorFactory::instance().registerSensorType(
            "relay_modbus",
            [](const std::string& name, sensorInterfaceType interfaceType,  const ConnectionParams cp) { return std::make_shared<RelayMod>(name, interfaceType, cp); }
        );
    }

    std::shared_ptr<void> readData() override {

        // Random number generation setup
        // std::random_device rd;
        // std::mt19937 gen(rd());

        // // For binary values [0, 1]
        // std::uniform_int_distribution<> disbinary(0, 1);

        // // Assign random binary values to the fields
        // data->primary_blower_value = disbinary(gen);
        // data->secondary_blower_value = disbinary(gen);
        // data->strobe_lights_value = disbinary(gen);
        // data->payload_power_value = disbinary(gen);

        // if(!relay_client)
        // {
        //     data->status = "disconnected";
        //     return data;
        // }
        // data->status = "connected";

        // cloudLogger& logger = cloudLogger::getInstance();
        // std::vector<std::string> results = logger.cloudDb.query("relay_status"); //pass collection name
        // for (const auto& result : results) {
        //     LOG_SUCCESS("DATA = %s", result.c_str());

        //     json json_doc = nlohmann::json::parse(result);

        //     if (json_doc.contains("value")) {
        //         double tensionValue = json_doc["value"].get<double>();
        //         LOG_DEBUG("LoadCell Tension : %f", tensionValue);
        //         data->tension = tensionValue;              
        //         if(data->tension > data->maxTension)
        //         {
        //             data->maxTension = data->tension;
        //         }  
        //     } else {
        //         std::cout << "'value' field not found in the JSON" << std::endl;
        //     }
        // }
        cloudLogger& logger = cloudLogger::getInstance();
        ModbusConnectionManager& modbus = ModbusConnectionManager::getInstance();

        if(!relay_client)
        {
            data->status = "disconnected";
            return data;
        }

        // bool relay_value;
        // std::vector<int> relayNumsVec;
        // int i = 0;
        // std::map<std::string, std::vector<int>> testMap;
        // json statusNameJson;
        // // testMap["relay_test"] = std::vector<int>{3, 5, 6
        // bool* relayArr[4] = {&data->primary_blower_value, &data->secondary_blower_value, &data->strobe_lights_value, &data->payload_power_value };
        // for (const auto& config : relay_configs) {

        //     for(const auto& relay_nums : config.relay_nums)
        //     {
        //         std::vector<int>relayNumVector;
        //         if (!modbus.read_coil(relay_nums - 1, relay_value, mb_relay)) {
        //             std::cerr << "Failed to read to relay " << relay_nums << " (" << config.name << ").\n";
        //             return data;
        //         } 
        //         relayNumVector.push_back(relay_nums);
        //         testMap["relay_test"] = relayNumVector;
        //         statusNameJson["relay_name"] = config.name;
        //         statusNameJson["status"] = relay_value ? "ON" : "OFF";
        //         logger.cloudDb.insert("relay_status", statusNameJson.dump(), testMap);
        //     }
        //     *relayArr[i++] = relay_value;

        // }
        bool relay_value;

        int i = 0;
        for(const auto& config : relay_configs)
        {
            for(const auto& relay_nums : config.relay_nums)
            {
                if (!modbus.read_coil(relay_nums - 1, relay_value, mb_relay)) {
                    // std::cerr << "Failed to read to relay " << relay_nums << " (" << config.name << ").\n";
                    LOG_ERROR("Error reading to relay at address : %d (%s)", relay_nums, config.name.c_str());
                    return data;
                } 
                data->relayStatusArr[i] = relay_value;
            }
            i++;
        }

        return data;
    }

    bool writeData(const std::shared_ptr<void>& dataRcv) override {
        // Implementation for writing data
        ModbusConnectionManager& modbus = ModbusConnectionManager::getInstance();
        cloudLogger& logger = cloudLogger::getInstance();

        std::map<std::string, std::vector<int>> testMap;
        json statusNameJson;
        if (dataRcv) {
            auto value = std::static_pointer_cast<relayWriteData>(dataRcv);
            int i = 0;
            for (const auto& config : relay_configs) {
                // bool value = false;
                // if (config.name == relay_configs[0].name) {
                //     data->primary_blower_value = value[0] ;
                // } else if (config.name == relay_configs[1].name) {
                //     data->secondary_blower_value = value[1] ;
                // } else if (config.name == relay_configs[2].name) {
                //     data->strobe_lights_value = value[2] ;
                // } else if (config.name == relay_configs[3].name) {
                //     data->payload_power_value = value[3] ;
                // }
                for (int relay_num : config.relay_nums) {
                    if (!modbus.write_coil(relay_num - 1, value->relayStates[i], mb_relay)) {
                        // std::cerr << "Failed to write to relay " << relay_num << " (" << config.name << ").\n";
                        LOG_ERROR("Error writing to relay at address : %d (%s)", relay_num, config.name.c_str());
                        return false;
                    }

                    std::vector<int>relayNumVector;
                    // bool relay_value;
                    // if (!modbus.read_coil(relay_nums - 1, relay_value, mb_relay)) {
                    //     std::cerr << "Failed to read to relay " << relay_nums << " (" << config.name << ").\n";
                    //     return data;
                    // } 
                    relayNumVector.push_back(relay_num);
                    statusNameJson["relay_name"] = config.name;
                    statusNameJson["status"] = value ? "ON" : "OFF";
                    testMap["relay_numbers"] = relayNumVector;
                    logger.cloudDb.insert("relay_status", statusNameJson.dump(), testMap);
                }
                i++;
            }
            return true;
        }
        return false; // Indicate failure
    }    


private:
    std::string name_;
    std::string ip_;
    std::shared_ptr<relayData> data;
    std::shared_ptr<relayWriteData> dataToWrite;
    modbus* mb_relay;
    bool relay_client = false;
};

#endif //RELAY_MODBUS_SENSOR_H