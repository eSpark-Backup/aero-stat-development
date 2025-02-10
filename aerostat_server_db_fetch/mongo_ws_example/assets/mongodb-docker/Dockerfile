# Use the official MongoDB image as base
FROM mongo

# Set the working directory inside the container
WORKDIR /data

# Expose MongoDB default port
EXPOSE 27017

# Copy the database dump into the container
COPY alfacor01dump /dump

# Set an entrypoint script to restore the database on first run
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ENTRYPOINT ["/entrypoint.sh"]

# Start MongoDB
CMD ["mongod"]

## docker build -t mongodb-alfaops .

## docker run -it --rm --name alfa-mongo-container -p 27017:27017 mongodb-alfaops

## COPY THE DB DUMP TP CONTAINER
## OPEN THIS DIRECTORY WHERE DOCKERFILE IS then run
## docker cp alfacor01dump alfa-mongo-container:/dump

## docker exec -it alfa-mongo-container /bin/bash

##RUN MONGORESTORE IN CONTAINER
## mongorestore --host localhost --port 27017 --db alfacor01 /dump/alfacor01
