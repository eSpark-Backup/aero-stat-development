#ifndef COMMUNICATION_PROTOCOL_H
#define COMMUNICATION_PROTOCOL_H

#include <string>
#include "ProtocolEvents.h"
#include <functional>

using EventCallbackType = std::function<void(const ProtocolEventParams&)>;

class CommunicationProtocol {
public:
    virtual ~CommunicationProtocol() = default;
    
    virtual void startListening(void){}
    virtual void sendData(const std::string& message){}
    virtual std::string receiveData(void){ return "";}
    virtual void setEventCallback(EventCallbackType callback){};

protected:
    EventCallbackType eventCallback = nullptr;
    void triggerEvent(const ProtocolEventParams& eventParams) {
        if (eventCallback) {
            eventCallback(eventParams);  // Invoke the callback with the event data
        }
    }
};

#endif // COMMUNICATION_PROTOCOL_H
