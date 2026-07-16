const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/db/database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log("Checking medical_cases...");
    db.all("SELECT id, title, status, creator_id FROM medical_cases", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Found cases:", rows);
        }
    });
});

db.close();
