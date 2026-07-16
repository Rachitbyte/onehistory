const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.all("PRAGMA table_info(appointments)", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Columns:", rows.map(r => r.name));
});
