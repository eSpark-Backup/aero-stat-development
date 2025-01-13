#ifndef HTTP_PROTOCOL_H
#define HTTP_PROTOCOL_H

#include "CommunicationProtocol.h"
#include <curl/curl.h>

class HTTPProtocol : public CommunicationProtocol {
public:
    HTTPProtocol();
    ~HTTPProtocol();

    bool sendData(const std::string& data) override;
    std::string receiveData() override;

private:
    CURL* curl;
};

#endif // HTTP_PROTOCOL_H
