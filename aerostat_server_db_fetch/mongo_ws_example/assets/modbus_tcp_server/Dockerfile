FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Python scripts into the container
COPY modbus_server.py tcp_server.py /app/

# Install the required version of pymodbus
RUN pip install pymodbus==2.5.3

EXPOSE 4002 4003 4004 4005 4006 4007 5001 5002 5003 5004 5005 5006 5007 4196

# Set the default command to run both scripts simultaneously
CMD ["sh", "-c", "python modbus_server.py & python tcp_server.py"]

## COMMANDS TO RUN THE DOCKER CONTAINER
##==========================================
##
## docker build -t modbus_tcp_server . --no-cache
## docker run -it --rm modbus_tcp_server
##
##==========================================