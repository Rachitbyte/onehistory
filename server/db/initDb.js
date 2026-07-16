const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

// Delete existing DB for a fresh start in demo
if (fs.existsSync(dbPath)) {
    console.log('Deleting existing database...');
    fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

const schema = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON");

    // Execute schema
    db.exec(schema, (err) => {
        if (err) {
            console.error('Schema execution failed:', err);
            return;
        }
        console.log('Schema applied.');
        seedData();
    });
});

function seedData() {
    console.log('Seeding data...');
    db.serialize(() => {
        const stmtUser = db.prepare("INSERT INTO users (id, name, role, password) VALUES (?, ?, ?, ?)");

        // Define fixed IDs for easy demo login
        const PATIENT_ID = 'patient-123';
        const DOCTOR_ID = 'doctor-123';
        const LAB_ID = 'lab-123';
        const PHARMACY_ID = 'pharmacy-123';
        const INSURANCE_ID = 'insurance-123';

        const users = [
            [PATIENT_ID, 'John Doe', 'PATIENT', 'password'],
            [DOCTOR_ID, 'Dr. Sarah Smith', 'DOCTOR', 'password'],
            [LAB_ID, 'City Lab', 'LAB', 'password'],
            [PHARMACY_ID, 'Green Pharmacy', 'PHARMACY', 'password'],
            [INSURANCE_ID, 'HealthGuard', 'INSURANCE', 'password']
        ];

        users.forEach(u => stmtUser.run(u));
        stmtUser.finalize();

        // Seed initial demo case
        const OLD_CASE_ID = 'case-2024-001'; // Fixed ID
        db.run("INSERT INTO medical_cases (id, patient_id, creator_id, title, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [OLD_CASE_ID, PATIENT_ID, DOCTOR_ID, 'Annual Checkup 2024', 'CLOSED', '2024-01-15 10:00:00']);

        db.run("INSERT INTO visit_records (id, case_id, doctor_id, diagnosis, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [uuidv4(), OLD_CASE_ID, DOCTOR_ID, 'Healthy', 'Routine checkup. All vitals normal.', '2024-01-15 10:30:00'], (err) => {
                if (err) console.error("Error seeding visits:", err);
                else console.log("Seeding visits done.");
            });

        console.log('Seeding commands queued.');
    });
}
