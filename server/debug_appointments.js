const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'db/database.sqlite'); // Correct relative path from server dir

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
        return;
    }
    console.log('Connected to SQLite database');

    db.all("SELECT * FROM appointments WHERE case_id IS NOT NULL", [], (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Appointments with case_id:', rows);
        }
    });

    db.all("SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5", [], (err, rows) => {
        if (err) console.error(err);
        else console.log('Last 5 appointments (any):', rows);
    });
});
