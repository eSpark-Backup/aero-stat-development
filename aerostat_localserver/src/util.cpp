#include <algorithm>
#include <cctype>
#include "util.h"
#include <iomanip>
#include <sstream>

#ifndef WINDOWS
#include <cmath>
#endif 

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

float formatFloat(float value) {
    return std::ceil(value * 100.0) / 100.0;; // Round to 2 decimal places
}