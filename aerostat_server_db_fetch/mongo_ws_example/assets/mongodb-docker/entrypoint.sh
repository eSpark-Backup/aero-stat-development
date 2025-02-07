#!/bin/bash
set -e

# Check if the database has been restored
if [ ! -f "/data/db/.restored" ]; then
    echo "Restoring MongoDB dump..."
    mongorestore --host localhost --port 27017 --db alfacor01 /dump/alfacor01
    touch /data/db/.restored
    echo "Database restored successfully."
else
    echo "Database already restored, skipping."
fi

# Start MongoDB
exec mongod --bind_ip_all
