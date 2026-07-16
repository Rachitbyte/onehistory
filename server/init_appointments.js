const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('./config');

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        case_id TEXT,
        creator_id TEXT NOT NULL,
        created_by_role TEXT NOT NULL,
        start_time TEXT NOT NULL,
        duration_minutes INTEGER NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        rescheduled_from_id TEXT,
        cancelled_at TEXT,
        reason_tags TEXT,
        reason_text TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(patient_id) REFERENCES users(id),
        FOREIGN KEY(provider_id) REFERENCES users(id)
    )`, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Table 'appointments' created successfully.");
        }
    });
});

db.close();
