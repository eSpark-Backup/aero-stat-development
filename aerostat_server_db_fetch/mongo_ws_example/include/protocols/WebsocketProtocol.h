#ifndef WS_PROTOCOL_H
#define WS_PROTOCOL_H

#include "../protocolBase/CommunicationProtocol.h"
#include <App.h>
#include <string>
#include <thread>
#include <atomic>

struct PerSocketData {
    /* Fill with user data */
    std::string id; // Unique identifier for the connection
};

class WebSocketProtocol : public CommunicationProtocol {
public:
    WebSocketProtocol(const std::string& url);
    ~WebSocketProtocol() override;

    void startListening(void) override;
    void sendData(const std::string& message) override;
    std::string receiveData(void) override;
    void setEventCallback(EventCallbackType callback) override;

private:
    std::string url;
    std::string host;
    int port;
    std::unique_ptr<std::thread> listeningThread;
    std::atomic<bool> isRunning;
    std::unordered_map<std::string, uWS::WebSocket<false, true, PerSocketData> *> wsConnections;
    std::atomic<int> connectionCounter; // Counter to generate unique IDs

    void parseUrl();
    void listen();
    std::string generateUniqueId();
};

#endif //WS_PROTOCOL_H
