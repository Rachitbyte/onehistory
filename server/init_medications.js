const db = require('./db');

const createTable = `
CREATE TABLE IF NOT EXISTS patient_reported_medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'RX' or 'SUPPLEMENT'
    dosage TEXT,
    frequency TEXT,
    start_date TEXT,
    end_date TEXT,
    reason TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES users(id)
)
`;

db.serialize(() => {
    db.run(createTable, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Table 'patient_reported_medications' ready.");
        }
    });
});
