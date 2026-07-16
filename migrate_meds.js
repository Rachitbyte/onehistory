const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/medical_system.db'); // Adjust path as needed
const db = new sqlite3.Database(dbPath);

const sql = `
CREATE TABLE IF NOT EXISTS patient_reported_medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('OTC', 'SUPPLEMENT', 'HERBAL', 'OTHER')),
    dosage TEXT,
    frequency TEXT,
    start_date DATE,
    end_date DATE,
    reason TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES users(id)
);
`;

db.run(sql, (err) => {
    if (err) {
        console.error("Migration failed:", err);
    } else {
        console.log("Migration successful: patient_reported_medications table created.");
    }
    db.close();
});
