# Use the official MongoDB image as the base
FROM mongo:latest

# Set environment variables for MongoDB initialization
ENV MONGO_INITDB_ROOT_USERNAME=a6admin
ENV MONGO_INITDB_ROOT_PASSWORD=Passw0rd!!

# Copy custom MongoDB initialization script (to create the database)
COPY ./init-db.js /docker-entrypoint-initdb.d/

# Expose MongoDB port
EXPOSE 27017

# The MongoDB image will automatically run the `mongod` process
