#include "protocols/WebsocketProtocol.h"
#include <iostream>
#include <chrono>
#include <thread>
#include <App.h>
#include <regex>
#include "logger/logger.h"

WebSocketProtocol::WebSocketProtocol(const std::string& _url)
    : url(_url), isRunning(false) {
    LOG_INFO("WebSocketProtocol initialized with URL: %s", _url.c_str());
    parseUrl();
}

void WebSocketProtocol::parseUrl() {
    // Regular expression to match the ws://<host>:<port> pattern
    std::regex urlRegex(R"(^ws://([^:/]+):(\d+)$)");
    std::smatch matches;

    if (std::regex_match(url, matches, urlRegex) && matches.size() == 3) {
        host = matches[1].str();        // Extract the hostname (IP or domain)
        port = std::stoi(matches[2].str());  // Extract the port number

        LOG_INFO("Parsed Host: %s", host.c_str());
        LOG_INFO("Parsed Port: %d", port);
    } else {
        // std::cerr << "Invalid URL format. Expected ws://<host>:<port>" << std::endl;
        LOG_ERROR("Invalid URL format. Expected ws://<%s>:<%d>", host.c_str(), port);
    }
}

WebSocketProtocol::~WebSocketProtocol() {
    if (isRunning) {
        isRunning = false;
        if (listeningThread && listeningThread->joinable()) {
            listeningThread->join();
        }
    }
    LOG_INFO("WebSocketProtocol destroyed");
}

void WebSocketProtocol::sendData(const std::string& message) {
    for (auto &connection : wsConnections) {
        auto *ws = connection.second;
        if (ws) {
            ws->send(message, uWS::OpCode::TEXT);
            LOG_VERBOSE("Sent custom message: %s", message.c_str());
        } else {
            LOG_ERROR("WebSocket is not connected, cannot send message.");
        }
    }
}

void WebSocketProtocol::startListening(void) {
    if (isRunning) {
        // std::cerr << "WebSocketProtocol is already listening!" << std::endl;
        LOG_WARNING("WebSocketProtocol is already listening!");
        return;
    }
    LOG_INFO("Starting Websocket Reading thread!");
    isRunning = true;
    try {
        listeningThread = std::make_unique<std::thread>(&WebSocketProtocol::listen, this);
    } catch (const std::exception& e) {
        // std::cerr << "Error creating thread: " << e.what() << std::endl;tcpConnectionManager.h
        LOG_ERROR("Error creating thread: %s", e.what());
    }

}

void WebSocketProtocol::listen() {


    /* Keep in mind that uWS::SSLApp({options}) is the same as uWS::App() when compiled without SSL support.
     * You may swap to using uWS:App() if you don't need SSL */
    uWS::App({
        /* There are example certificates in uWebSockets.js repo */
	    .key_file_name = "misc/key.pem",
	    .cert_file_name = "misc/cert.pem",
	    .passphrase = "1234"
	}).ws<PerSocketData>("/*", {
        /* Settings */
        .compression = uWS::CompressOptions(uWS::DEDICATED_COMPRESSOR_4KB | uWS::DEDICATED_DECOMPRESSOR),
        .maxPayloadLength = 100 * 1024 * 1024,
        .idleTimeout = 16,
        .maxBackpressure = 100 * 1024 * 1024,
        .closeOnBackpressureLimit = false,
        .resetIdleTimeoutOnSend = false,
        .sendPingsAutomatically = true,
        /* Handlers */
        .upgrade = nullptr,
        .open = [this](auto *ws) {
            /* Open event here, you may access ws->getUserData() which points to a PerSocketData struct */
            auto *data = (PerSocketData *) ws->getUserData();
            data->id = generateUniqueId();
            // LOG_INFO("WebSocket opened, ID: " << data->id);
            LOG_INFO("WebSocket opened, ID: %s", (data->id).c_str());
            wsConnections[data->id] = ws;
        },
        .message = [this](auto *ws, std::string_view message, uWS::OpCode opCode) {
            /* This is the opposite of what you probably want; compress if message is LARGER than 16 kb
             * the reason we do the opposite here; compress if SMALLER than 16 kb is to allow for 
             * benchmarking of large message sending without compression */
            // ws->send(message, opCode, message.length() < 16 * 1024);
            auto *data = (PerSocketData *) ws->getUserData();

            ProtocolEventParams event = {
                .type = ProtocolEvent::MESSAGE_RECEIVED,
                .eventData = {.messageReceived = {.message = ""}}
            };

            strncpy(event.eventData.messageReceived.message, message.data(), message.size());
            strncpy(event.eventData.messageReceived.connectionId, (data->id).data(), (data->id).size());
            this->triggerEvent(event);  // Trigger the callback with the event data
            
        },
        .dropped = [](auto */*ws*/, std::string_view /*message*/, uWS::OpCode /*opCode*/) {
            /* A message was dropped due to set maxBackpressure and closeOnBackpressureLimit limit */
        },
        .drain = [](auto */*ws*/) {
            /* Check ws->getBufferedAmount() here */
        },
        .ping = [](auto */*ws*/, std::string_view) {
            /* Not implemented yet */
        },
        .pong = [](auto */*ws*/, std::string_view) {
            /* Not implemented yet */
        },
        .close = [this](auto *ws, int /*code*/, std::string_view /*message*/) {
            /* You may access ws->getUserData() here */

            /* Remove the connection from the active connections map */
            auto *data = (PerSocketData *) ws->getUserData();
            // LOG_INFO("WebSocket closed, ID: " << data->id);
            LOG_INFO("WebSocket closed, ID: %s", (data->id).c_str());
            wsConnections.erase(data->id);
        }
    }).listen(WebSocketProtocol::port, [this](auto *listen_socket) {
        if (listen_socket) {
            // LOG_INFO("Listening on port " << this->port);
            LOG_INFO("Listening on port : %d", this->port);
        }
    }).run();

    while (isRunning) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    // LOG_INFO("WebSocketProtocol listener stopped");
    LOG_INFO("WebSocketProtocol listener stopped");

}

std::string WebSocketProtocol::receiveData(void) {
    // This method can be implemented to receive data in a real-world application
    // Depending on your specific requirements, you can store received data in a buffer or process it differently
    return ""; // Return empty string for now
}

std::string WebSocketProtocol::generateUniqueId() {
    return "conn-" + std::to_string(connectionCounter++);
}

void WebSocketProtocol::setEventCallback(EventCallbackType callback) {
    eventCallback = callback;
}