const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'db/database.sqlite');
const db = new sqlite3.Database(dbPath);

const DOCTOR_ID = 'doctor-123';
const PATIENT_ID = 'patient-123';

console.log("Checking consents for Doctor:", DOCTOR_ID, "and Patient:", PATIENT_ID);

db.serialize(() => {
    db.all("SELECT * FROM consents WHERE provider_id = ? AND patient_id = ?", [DOCTOR_ID, PATIENT_ID], (err, rows) => {
        if (err) console.error(err);
        else {
            console.log("Consents found:", rows);
        }
    });

    db.all("SELECT * FROM medical_cases", [], (err, rows) => {
        if (err) console.error(err);
        else {
            console.log("Cases:", rows.map(c => ({ id: c.id, status: c.status, creator: c.creator_id, patient: c.patient_id })));
        }
    });
});
