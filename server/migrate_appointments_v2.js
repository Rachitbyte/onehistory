const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log("Migrating Appointments Table to V2 Schema...");

db.serialize(() => {
    // 1. Rename old table
    db.run("ALTER TABLE appointments RENAME TO appointments_old", (err) => {
        if (err && !err.message.includes('no such table')) {
            console.error("Error renaming table (maybe it doesn't exist?):", err);
        }

        // 2. Create new table
        db.run(`CREATE TABLE IF NOT EXISTS appointments (
            id TEXT PRIMARY KEY,
            provider_id TEXT NOT NULL,
            patient_id TEXT NOT NULL,
            case_id TEXT,
            creator_id TEXT NOT NULL,
            created_by_role TEXT NOT NULL, -- 'DOCTOR' | 'PATIENT'
            rescheduled_from_id TEXT, -- Self-referencing FK
            start_time DATETIME NOT NULL,
            duration_minutes INTEGER NOT NULL,
            type TEXT NOT NULL, -- 'IN_PERSON', 'VIDEO', 'AUDIO'
            status TEXT NOT NULL, -- 'REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'
            reason_tags TEXT, -- JSON Array
            reason_text TEXT,
            cancelled_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(provider_id) REFERENCES users(id),
            FOREIGN KEY(patient_id) REFERENCES users(id),
            FOREIGN KEY(case_id) REFERENCES medical_cases(id),
            FOREIGN KEY(rescheduled_from_id) REFERENCES appointments(id)
        )`, (err) => {
            if (err) {
                console.error("Error creating new table:", err);
                return;
            }
            console.log("New appointments table created.");

            // 3. Copy data from old table if exists
            // We need to map old columns to new. Old: id, case_id, patient_id, provider_id, scheduled_time, status, created_at
            // New defaults: duration=30, type='IN_PERSON', creator_id=patient_id (assumption), created_by_role='PATIENT'

            db.run(`INSERT INTO appointments (
                id, provider_id, patient_id, case_id, 
                creator_id, created_by_role, 
                start_time, duration_minutes, type, status, 
                created_at, reason_tags, reason_text
            )
            SELECT 
                id, provider_id, patient_id, case_id, 
                patient_id, 'PATIENT', 
                scheduled_time, 30, 'IN_PERSON', status, 
                created_at, '[]', 'Legacy Appointment'
            FROM appointments_old`, (err) => {
                if (err) {
                    console.log("Skipping data migration (maybe old table was empty or missing):", err.message);
                } else {
                    console.log("Migrated existing data.");
                }

                // 4. Drop old table
                // db.run("DROP TABLE appointments_old"); // Keep for safety for now? Or drop? Let's drop to keep it clean.
                db.run("DROP TABLE IF EXISTS appointments_old");
            });
        });
    });
});
