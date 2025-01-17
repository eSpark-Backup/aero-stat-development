#include <string>

enum class ProtocolEvent {
    MESSAGE_RECEIVED,
    CONNECTED,
    DISCONNECTED,
    ERROR_OCCURRED,
};

// Event-specific data structures
struct MessageReceived {
    char message[1024*16]; 
    char connectionId[64];
};

struct Connected {
    char host[128]; 
    int port;
};

struct Disconnected {
    char reason[256]; 
};

struct ErrorOccurred {
    char errorMessage[256]; 
};

struct ProtocolEventParams {
    ProtocolEvent type;  // Event type

    union {
        MessageReceived messageReceived;
        Connected connected;
        Disconnected disconnected;
        ErrorOccurred errorOccurred;
    } eventData;  // Union holding event-specific data
};