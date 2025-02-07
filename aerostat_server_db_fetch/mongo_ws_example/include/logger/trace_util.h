#include <cstring>

#define COLOR_FONT_BLACK "30"
#define COLOR_FONT_RED "31"
#define COLOR_FONT_GREEN "32"
#define COLOR_FONT_YELLOW "33"
#define COLOR_FONT_BLUE "34"
#define COLOR_FONT_MAGENTA "35"
#define COLOR_FONT_CYAN "36"
#define COLOR_FONT_WHITE "37"

#define COLOR_BG_BLACK "40"
#define COLOR_BG_RED "41"
#define COLOR_BG_GREEN "42"
#define COLOR_BG_YELLOW "43"
#define COLOR_BG_BLUE "44"
#define COLOR_BG_MAGENTA "45"
#define COLOR_BG_CYAN "46"
#define COLOR_BG_WHITE "47"

#ifndef __FILENAME__
#define __FILENAME__ (strrchr(__FILE__, '/') ? strrchr(__FILE__, '/') + 1 : __FILE__)
#endif

#define trace_color(log_lvl, txt_color, X, reg...)                                                 \
{                                                                                     \
    Logger::getInstance().log(log_lvl, "\x1B[%sm %s[%d]:" X "\x1B[0m", txt_color, __FILENAME__, __LINE__, ##reg);\
}

#define trace_debug(X, reg...) trace_color(Logger::DEBUG, COLOR_FONT_WHITE, X, ##reg)
#define trace_information(X, reg...) trace_color(Logger::INFO, COLOR_FONT_BLUE, X, ##reg)
#define trace_warning(X, reg...) trace_color(Logger::WARNING, COLOR_FONT_YELLOW, X, ##reg)
#define trace_success(X, reg...) trace_color(Logger::SUCCESS, COLOR_FONT_GREEN, X, ##reg)
#define trace_error(X, reg...) trace_color(Logger::ERROR, COLOR_FONT_RED, X, ##reg)
#define trace_verbose(X, reg...) trace_color(Logger::VERBOSE, COLOR_BG_CYAN, X, ##reg)

#define LOG_DEBUG trace_debug
#define LOG_INFO trace_information
#define LOG_WARNING trace_warning
#define LOG_SUCCESS trace_success
#define LOG_ERROR trace_error
#define LOG_VERBOSE trace_verbose