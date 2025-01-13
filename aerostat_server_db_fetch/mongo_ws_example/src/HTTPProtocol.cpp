#include "HTTPProtocol.h"
#include <iostream>

HTTPProtocol::HTTPProtocol() {
    curl_global_init(CURL_GLOBAL_DEFAULT);
    curl = curl_easy_init();
}

HTTPProtocol::~HTTPProtocol() {
    if (curl) {
        curl_easy_cleanup(curl);
    }
    curl_global_cleanup();
}

bool HTTPProtocol::sendData(const std::string& data) {
    if (!curl) {
        std::cerr << "Failed to initialize curl." << std::endl;
        return false;
    }

    curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:8080");
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data.c_str());

    CURLcode res = curl_easy_perform(curl);
    if (res != CURLE_OK) {
        std::cerr << "HTTP request failed: " << curl_easy_strerror(res) << std::endl;
        return false;
    }

    return true;
}

std::string HTTPProtocol::receiveData() {
    // Example for receiving data, you can implement actual response handling here
    return "Received data";
}
