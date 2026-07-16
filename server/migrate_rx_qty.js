const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    console.log("Adding quantity column...");
    db.run("ALTER TABLE prescription_medicines ADD COLUMN quantity TEXT", (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error("Error adding quantity:", err);
        } else {
            console.log("Quantity column added (or already exists).");
        }
    });
});
