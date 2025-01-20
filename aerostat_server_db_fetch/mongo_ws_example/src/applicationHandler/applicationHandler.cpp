#include <memory>
#include <iostream>
#include <thread>
#include "logger/logger.h"
#include "nlohmann/json.hpp"
#include "applicationHandler/api_method.h"
#include "applicationHandler/applicationHandler.h"
#include "sensorsManager/base/sensorManager.h"
#include "sensorsManager/sensors/weatherStation.h"

void ApplicationHandler::handleProtocolEvent(const ProtocolEventParams& eventParams) {
    switch (eventParams.type) {
        case ProtocolEvent::MESSAGE_RECEIVED:
        {
            try {
                std::string messageResponse = messageHandler_->handleMessage(eventParams.eventData.messageReceived.message);
                LOG_SUCCESS("Messag sent >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> :\n%s", messageResponse.c_str());
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
void continuouslyReadSensorData(SensorManager& sensorManager, ConfigManager& configManager) {
    while (true) {
        // Get the list of sensor IDs
        auto sensorIds = sensorManager.getSensorIDs();

        // Iterate over all sensor IDs
        for (const auto& sensorId : sensorIds) {
            auto sensorData = sensorManager.readSensorData<WeatherStation>(sensorId);
            // auto weatherData = std::static_pointer_cast<weatherStationData>(sensorData);
            if (sensorData) {
                LOG_DEBUG("Reading data from sensor: %s", sensorId.c_str());
                auto concreteData = std::static_pointer_cast<SensorData>(sensorData);
                // concreteData->print();  // Output weather data

                configManager.saveSensorData(sensorId, concreteData);
            } else {
                std::cerr << "Failed to read data from sensor: weatherStation1\n";
            }
        }
        ServerConfig serverInformation = configManager.getServerConfig();
        serverInformation.print();
        std::this_thread::sleep_for(std::chrono::seconds(1));  // Adjust time as needed
    }
}

void ApplicationHandler::start() {
    //Setters
    messageHandler_->registerMethodHandler("alfa.server.connection.settings.set", handleServerSettingsSet); //modbus/tcp server connection information
    messageHandler_->registerMethodHandler("alfa.server.settings.set", NULL); //phase related relay/fan/light input from frontend
    messageHandler_->registerMethodHandler("alfa.phase.settings.set", NULL); //phase type setting from front end
    messageHandler_->registerMethodHandler("alfa.playback.settings.set", NULL); //playback start time, end time related settings
    messageHandler_->registerMethodHandler("alfa.braodcast.settings.set", NULL); //either to disable broadcast, change message interval

    //Getters
    messageHandler_->registerMethodHandler("alfa.server.connection.settings.get", handleServerSettingsGet); //relay/fan/light related fetching
    messageHandler_->registerMethodHandler("alfa.info.get", handleVersionGet); //version/build/branch/commit related information
    /* luxury items
    messageHandler_->registerMethodHandler("alfa.modbus.reading.get", NULL);
    messageHandler_->registerMethodHandler("alfa.tcp.reading.get", NULL);
    messageHandler_->registerMethodHandler("alfa.db.status.get", NULL);
    */
    
    try {
        LOG_INFO("Application Starting");
        protocol_->setEventCallback([this](const ProtocolEventParams& eventParams) {
            handleProtocolEvent(eventParams);  // Call the member function on the instance
        });
        protocol_->startListening();

        if (db_->connect(db_->dbConfig.connectionStringOrFilePath)) {
            LOG_INFO("Database Connected!");
            protocol_->sendData("Connected to Database!");
        } else {
            LOG_ERROR("Database Connected!");
            return;
        }

        /*
            T1
            thread that will start reading from the modbus/tcp 
            update db and localdata with some interval.
        */
         
        SensorManager& sensorManager = SensorManager::getInstance();
        ConfigManager& configManager = ConfigManager::getInstance();

        sensorManager.registerSensor<WeatherStation>("weatherStation", "weatherStation 1");
        sensorManager.registerSensor<WeatherStation>("weatherStation2", "weatherStation 2");

        std::thread sensorReadingThread(continuouslyReadSensorData, std::ref(sensorManager), std::ref(configManager));

        sensorReadingThread.join();
        
        /*
            T2
            thread that will handle the broadcasting to the 
            frontend based on phase type maybe on callback
            or interval.
        */

        /*
            T3
            thread that will handle the playback request and
            read information from db and broadcast to FE
            pauses T2 only.
        */

    } catch (const std::exception& ex) {
        LOG_ERROR("Application Exception");
    }
}
