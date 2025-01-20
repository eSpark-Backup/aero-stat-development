// init-db.js

db = db.getSiblingDB('alfacor01');  // Switch to 'alfacor01' database
db.createCollection('sampleCollection');  // Optional: create a sample collection
