const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Checking schema for appointments...");

db.all("PRAGMA table_info(appointments)", (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);
});
