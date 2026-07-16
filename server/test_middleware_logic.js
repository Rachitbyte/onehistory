const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(dbPath);

const DOCTOR_ID = 'doctor-123';
const PATIENT_ID = 'patient-123';
const CASE_ID = '660ec8d2-e22a-49a5-9884-901240256f1b';

console.log(`Simulating check for User: ${DOCTOR_ID} (DOCTOR) accessing Case: ${CASE_ID}`);

// Simulate deriveContext
db.get("SELECT patient_id, creator_id FROM medical_cases WHERE id = ?", [CASE_ID], (err, row) => {
    if (err) {
        console.error("DB Error getting case:", err);
        return;
    }
    if (!row) {
        console.log("No case found or deriveContext failed to find row.");
        return;
    }

    console.log("Derived Context:", row);

    // Simulate Check
    const targetPatientId = row.patient_id;
    const creatorId = row.creator_id;

    console.log(`Comparing User ID '${DOCTOR_ID}' with Creator ID '${creatorId}'`);

    // Strict equality check
    if (DOCTOR_ID === creatorId) {
        console.log("ALLOW: Doctor is creator.");
    } else {
        console.log("DENY: Doctor is NOT creator (strict check failed).");
        console.log(`Types: DOCTOR_ID=${typeof DOCTOR_ID}, creatorId=${typeof creatorId}`);
    }
});
