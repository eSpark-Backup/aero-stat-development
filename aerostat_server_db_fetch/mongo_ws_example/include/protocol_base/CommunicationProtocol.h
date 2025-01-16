#ifndef COMMUNICATION_PROTOCOL_H
#define COMMUNICATION_PROTOCOL_H

#include <string>
#include "ProtocolEvents.h"
#include <functional>

using EventCallbackType = void (*)(const ProtocolEventParams&);

class CommunicationProtocol {
public:
    virtual ~CommunicationProtocol() = default;
    
    virtual void startListening(void) = 0;
    virtual void sendData(const std::string& message) = 0;
    virtual std::string receiveData(void) = 0;
    virtual void setEventCallback(EventCallbackType callback) = 0;

protected:
    EventCallbackType eventCallback = nullptr;
    void triggerEvent(const ProtocolEventParams& eventParams) {
        if (eventCallback) {
            eventCallback(eventParams);  // Invoke the callback with the event data
        }
    }
};

#endif // COMMUNICATION_PROTOCOL_H
