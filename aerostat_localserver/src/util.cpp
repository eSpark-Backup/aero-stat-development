#include <algorithm>
#include <cctype>
#include "util.h"
#include <iomanip>
#include <sstream>

std::string strip(const std::string& str) {
    auto start = str.begin();
    while (start != str.end() && std::isspace(*start)) {
        ++start;
    }

    auto end = str.end();
    do {
        --end;
    } while (end != start && std::isspace(*end));

    return std::string(start, end + 1);
}

// Function to format a float to a string with 2 decimal places
// float formatFloat(float value) {
//     return std:: round(value * 100.0f) / 100.0f; // Round to 2 decimal places
// }