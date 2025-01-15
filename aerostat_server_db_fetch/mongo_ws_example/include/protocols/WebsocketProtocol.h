#ifndef WS_PROTOCOL_H
#define WS_PROTOCOL_H

#include "../protocol_base/CommunicationProtocol.h"
#include <App.h>
#include <string>
#include <thread>
#include <atomic>

struct PerSocketData {
    /* Fill with user data */
};

class WebSocketProtocol : public CommunicationProtocol {
public:
    WebSocketProtocol(const std::string& url);
    ~WebSocketProtocol() override;

    void startReading(void) override;
    void sendData(const std::string& message) override;
    std::string receiveData(void) override;

private:
    std::string url;
    std::unique_ptr<std::thread> listeningThread;
    std::atomic<bool> isRunning;
    uWS::WebSocket<false, true, PerSocketData> * ws = nullptr;

    void listen();
};

#endif //WS_PROTOCOL_H
