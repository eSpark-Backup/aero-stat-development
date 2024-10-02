import os
import logging
from datetime import datetime

# Constants
MAX_LOG_FILE_SIZE = 5 * 1024 * 1024
LOG_DIR_PATH = os.path.expanduser("~/logs")
DATE_TIME_FORMAT = "%d%m%Y_%H-%M-%S"
log_file_path = None

# Ensure the log directory exists
def setup_log_directory():
    if not os.path.exists(LOG_DIR_PATH):
        os.makedirs(LOG_DIR_PATH)

# Get current date and time
def get_current_datetime():
    return datetime.now().strftime(DATE_TIME_FORMAT)

# Create a new log file
def create_log_file():
    global log_file_path
    file_name = f"{get_current_datetime()}.txt"
    log_file_path = os.path.join(LOG_DIR_PATH, file_name)
    
    print(f"Log file created: {log_file_path}")
    return log_file_path

# Check if the file exceeds the max size
def check_file_size():
    global log_file_path
    if os.path.getsize(log_file_path) >= MAX_LOG_FILE_SIZE:
        logging.shutdown()
        create_log_file()

# Log a message to the file
def log_message(message):
    global log_file_path
    if log_file_path is None:
        create_log_file()

    with open(log_file_path, 'a') as log_file:
        log_file.write(f"{get_current_datetime()} - {message}\n")

    check_file_size()