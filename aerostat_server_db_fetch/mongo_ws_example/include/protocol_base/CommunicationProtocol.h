#ifndef COMMUNICATION_PROTOCOL_H
#define COMMUNICATION_PROTOCOL_H

#include <string>

class CommunicationProtocol {
public:
    virtual ~CommunicationProtocol() = default;
    
    virtual void startReading(void) = 0;
    virtual void sendData(const std::string& message) = 0;
    virtual std::string receiveData(void) = 0;
};

#endif // COMMUNICATION_PROTOCOL_H
