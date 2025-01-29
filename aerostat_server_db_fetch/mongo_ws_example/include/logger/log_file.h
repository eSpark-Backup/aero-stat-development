#ifndef LOGFILE_H
#define LOGFILE_H

#include <string>

void setup_log_directory();
std::string get_current_datetime();
std::string create_log_file();
void check_file_size();
void log_message(const std::string& message);

#endif //LOGFILE_H