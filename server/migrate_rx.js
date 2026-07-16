const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    console.log("Adding timing column...");
    db.run("ALTER TABLE prescription_medicines ADD COLUMN timing TEXT", (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error("Error adding timing:", err);
        } else {
            console.log("Timing column added (or already exists).");
        }
    });

    console.log("Adding duration column...");
    db.run("ALTER TABLE prescription_medicines ADD COLUMN duration TEXT", (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error("Error adding duration:", err);
        } else {
            console.log("Duration column added (or already exists).");
        }
    });
});
