#ifndef COMMUNICATION_PROTOCOL_H
#define COMMUNICATION_PROTOCOL_H

#include <string>

class CommunicationProtocol {
public:
    virtual ~CommunicationProtocol() = default;
    
    virtual bool sendData(const std::string& data) = 0;
    virtual std::string receiveData() = 0;
};

#endif // COMMUNICATION_PROTOCOL_H
