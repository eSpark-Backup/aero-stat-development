#include <memory>
#include <iostream>
#include <thread>
#include "logger/logger.h"
#include "nlohmann/json.hpp"
#include "applicationHandler/apiMethod.h"
#include "applicationHandler/applicationHandler.h"
#include "sensorsManager/base/sensorManager.h"
#include "configManager/configFormatter.h"
#include "logger/cloudLogger.h"

#include "sensorsManager/sensors/commonSensorData/sensorsDef.h"

std::mutex sensorConfigManager_mtx;

void ApplicationHandler::handleProtocolEvent(const ProtocolEventParams& eventParams) {
    switch (eventParams.type) {
        case ProtocolEvent::MESSAGE_RECEIVED:
        {
            try {
                std::string messageResponse = messageHandler_->handleMessage(eventParams.eventData.messageReceived.message);
                LOG_INFO("Messag sent >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> :\n%s", messageResponse.c_str());
                protocol_->sendData(messageResponse);
            } catch (const json::exception& e) {
                LOG_ERROR("JSON ERROR: %s", e.what());  // Added error detail
            }
            break;
        }
        case ProtocolEvent::CONNECTED:
            LOG_SUCCESS("Connected to %s, %d" , eventParams.eventData.connected.host , ":" , eventParams.eventData.connected.port );
            break;
        case ProtocolEvent::DISCONNECTED:
            LOG_ERROR("Disconnected. Reason: %s" , eventParams.eventData.disconnected.reason );
            break;
        case ProtocolEvent::ERROR_OCCURRED:
            LOG_ERROR("Error occurred: %s" , eventParams.eventData.errorOccurred.errorMessage );
            break;
        default:
            LOG_ERROR("Unknown event" );
            break;
    }
}

/*
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Thread 1 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    - Reads sensors, update FE and DB
*/
void ApplicationHandler::continuouslyReadSensorData() {
    LOG_WARNING("Data read thread started");
    ConfigManager& configManager = ConfigManager::getInstance();
    SensorManager& sensorManager = SensorManager::getInstance();
    
    while (true) {
        // std::lock_guard<std::mutex> lock(sensorConfigManager_mtx);
        sensorConfigManager_mtx.lock();
        // Get the list of sensor IDs
        auto sensorIds = sensorManager.getSensorIDs();
        // Iterate over all sensor IDs
        LOG_WARNING("=========================================================\n");
        for (const auto& sensorId : sensorIds) {
            // LOG_DEBUG("Found Sensor and Reading %s", sensorId.c_str());
            auto sensorData = sensorManager.readSensorData<void>(sensorId);
            // auto weatherData = std::static_pointer_cast<weatherStationData>(sensorData);
            if (sensorData) {
                // LOG_DEBUG("Reading data from sensor: %s", sensorId.c_str());
                auto concreteData = std::static_pointer_cast<SensorData>(sensorData);
                // concreteData->print();  // Output weather data
                
                auto sensor = sensorManager.getSensor(sensorId);
                switch (sensor->getInterfaceType())
                {
                case sensorInterfaceType::SENSOR_INT_MODBUS:
                    // LOG_DEBUG("Saving Data from Interface MODBUS");
                    configManager.saveSensorDataModbus(sensorId, concreteData);
                    break;
                case sensorInterfaceType::SENSOR_INT_TCP:
                    // LOG_DEBUG("Saving Data from Interface TCP");
                    configManager.saveSensorDataTcp(sensorId, concreteData);
                    break;
                case sensorInterfaceType::SENSOR_INT_UNKNOWN:
                    LOG_ERROR("Cannot save this Sensor Inteface type sensor data");
                    break;
                default:
                    break;
                }
            } else {
                // std::cerr << "Failed to read data from sensor: weatherStation1\n";
                LOG_ERROR("Failed to read data from sensor: %s", sensorId.c_str());
            }
        }
        LOG_WARNING("=========================================================");
        // ServerConfig serverInformation = configManager.getServerConfig();
        // serverInformation.print();
        sensorConfigManager_mtx.unlock();
        std::this_thread::sleep_for(std::chrono::milliseconds(200));  // Adjust time as needed
    }
}

/*
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Thread 2 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    - Updates FE from either DB (during playback) or configManager (default)
*/

void ApplicationHandler::continuouslyUpdateFrontend() {
    LOG_SUCCESS("Frontend Update Thread Started");
    ConfigManager& configManager = ConfigManager::getInstance();

    while (true) {
        if (configManager.getServerConfig().broadcastEnable) {
            // LOG_DEBUG("Updating Frontend");
            // std::lock_guard<std::mutex> lock(sensorConfigManager_mtx);
            sensorConfigManager_mtx.lock();
            const ServerConfig& serverConfig = configManager.getServerConfig();
            TcpConnectionManager& connectionMan = TcpConnectionManager::getInstance();
            json responseJson = {
                // {"method", "alfa.broadcast.settings.set"}, // Add the method field
                {"data", {}} // Initialize empty data
            };

            // Populate the `data` field based on `phaseType`
            if (serverConfig.phaseType == "tcp") {
                responseJson["data"]["tcp"] = ConfigFormatter::tcpDataToJson(serverConfig);
                if(!serverConfig.tcp.empty() && connectionMan.check_host_reachable(serverConfig.tcp[0].ip))
                {
                    responseJson["status"] = "connected";
                }
                else
                {
                    responseJson["status"] = "disconnected";
                }
            } else if (serverConfig.phaseType == "modbus") {
                responseJson["data"]["modbus"] = ConfigFormatter::modbusDataToJson(serverConfig);
                if(!serverConfig.modbus.empty() && connectionMan.check_host_reachable(serverConfig.modbus[0].ip))
                {
                    responseJson["status"] = "connected";
                }
                else
                {
                    responseJson["status"] = "disconnected";
                }
            } else {
                responseJson = {
                    {"error", "Invalid phaseType in configuration"},
                    {"method", "alfa.broadcast.settings.set"}
                };
                LOG_ERROR("Invalid phaseType: %s", serverConfig.phaseType.c_str());
            }

            // Convert the JSON to a string and send it to the frontend
            std::string jsonOutput = responseJson.dump(4); // Pretty print with 4 spaces
            protocol_->sendData(jsonOutput);
            sensorConfigManager_mtx.unlock();
        }

        // Sleep for 1 second before checking again
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }
}

/*
    >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Thread 4 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    - checks change in server settings and update/register sensors accordingly
*/


void ApplicationHandler::start() {
    //Registering Sensors
    WeatherStationMod::registerType();
    BallonetPressureMod::registerType();
    HulltPressureMod::registerType();
    LoadcellMod::registerType();
    AhrsMod::registerType();
    BallonetCurtainMod::registerType();
    AvionicsEnvMod::registerType();
    RelayMod::registerType();

    WeatherStationTcp::registerType();
    BallonetPressureTcp::registerType();
    DigitalCompassTcp::registerType();
    AdamSensorTcp::registerType();
    HelliumPressureTcp::registerType();
    // FanLightTcp::registerType();

    //Setters
    messageHandler_->registerMethodHandler("alfa.server.connection.settings.set", handleServerConnectionSettingsSet); //modbus/tcp server connection information
    messageHandler_->registerMethodHandler("alfa.actuator.settings.set", handleActuatorSetting); //phase related relay/fan/light input from frontend
    messageHandler_->registerMethodHandler("alfa.phase.settings.set", handlePhaseSetting); //phase type setting from front end
    messageHandler_->registerMethodHandler("alfa.playback.settings.set", NULL); //playback start time, end time related settings
    messageHandler_->registerMethodHandler("alfa.braodcast.settings.set", handleBroadcastSetting); //either to disable broadcast, change message interval
    messageHandler_->registerMethodHandler("alfa.server.logger.set", handleLoggerSetting); //playback start time, end time related settings

    //Getters
    messageHandler_->registerMethodHandler("alfa.server.connection.settings.get", handleServerConnectionSettingsGet); //relay/fan/light related fetching
    messageHandler_->registerMethodHandler("alfa.info.get", handleVersionGet); //version/build/branch/commit related information
    /* luxury items
    messageHandler_->registerMethodHandler("alfa.modbus.reading.get", NULL);
    messageHandler_->registerMethodHandler("alfa.tcp.reading.get", NULL);
    messageHandler_->registerMethodHandler("alfa.db.status.get", NULL);
    */

    json forcedConnectionParams = {
            {"method", "alfa.server.connection.settings.set"},
            {"servers", {
                {
                    {"modbus", {
                        {
                            {"name", "modbus1"},
                            {"ip", "10.85.5.12"},
                            {"ports", {
                                {{"port", "5001"}, {"name", "hull_pressure"}},
                                {{"port", "5002"}, {"name", "ballonet_pressure"}},
                                {{"port", "5003"}, {"name", "ahrs"}},
                                {{"port", "5004"}, {"name", "ultrasonic"}},
                                {{"port", "5005"}, {"name", "load_cell"}},
                                {{"port", "5006"}, {"name", "temp_humidity"}},
                                {{"port", "5007"}, {"name", "weather_station"}}
                            }}
                        },
                        {
                            {"name", "modbus-relay"},
                            {"ip", "10.85.5.13"},
                            {"ports", {
                                {{"port", "4196"}, {"name", "relay"}}
                            }}
                        }
                    }}
                }
            }}
        };

   handleServerConnectionSettingsSet(forcedConnectionParams);
    
    try {
        LOG_INFO("Application Starting");
        protocol_->setEventCallback([this](const ProtocolEventParams& eventParams) {
            handleProtocolEvent(eventParams);  // Call the member function on the instance
        });
        protocol_->startListening();

        //CONNECT TO DATABASE
        cloudLogger& logger = cloudLogger::getInstance();

        // if (db_->connect(db_->dbConfig.connectionStringOrFilePath)) {
        //     LOG_INFO("Database Connected!");
        //     protocol_->sendData("Connected to Database!");
        // } else {
        //     LOG_ERROR("Database not Connected!");
        // }

        // std::string jsonData = R"({
        //     "timestamp": "2025-01-22 20:58:57",
        //     "data": {
        //         "Aerostat Heading": 128.00,
        //         "Air Temp": 18.80,
        //         "Baro Pres": 29.29,
        //         "Wind Angle": 158.40,
        //         "Wind Speed": 1.90
        //     },
        //     "unit": "grouped"
        // })";

        // db_->insert("test_collection_name", jsonData);

        /*
            T1
            thread that will start reading from the modbus/tcp 
            update db and localdata with some interval.
        */
         
        SensorManager& sensorManager = SensorManager::getInstance();
        ConfigManager& configManager = ConfigManager::getInstance();

        std::thread sensorReadingThread(&ApplicationHandler::continuouslyReadSensorData, this);
        sensorReadingThread.detach();


        
        /*
            T2
            thread that will handle the broadcasting to the 
            frontend based on phase type maybe on callback
            or interval.
        */

        std::thread readingUpdateThread(&ApplicationHandler::continuouslyUpdateFrontend, this);
        readingUpdateThread.detach();


        /*
            T3
            thread that will handle the playback request and
            read information from db and broadcast to FE
            pauses T2 only.
        */

       /* TEST FOR DOCKER RESTART ROUTINE
        std::this_thread::sleep_for(std::chrono::seconds(10));

        char* codeCrasherPtr = nullptr;  // Null pointer
        *codeCrasherPtr = 'A';  // Explicitly write to null pointer (segmentation fault)
       */


    } catch (const std::exception& ex) {
        LOG_ERROR("Application Exception");
    }
}
