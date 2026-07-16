const db = require('./db');

const patientId = 'patient-123';

db.get('SELECT * FROM patient_profiles WHERE user_id = ?', [patientId], (err, row) => {
    if (err) {
        console.error("DB Error:", err);
    } else {
        console.log("Patient Profile found:", row);
    }
});
