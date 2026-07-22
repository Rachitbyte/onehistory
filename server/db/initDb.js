const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

if (fs.existsSync(dbPath)) {
    console.log('Deleting existing database...');
    fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Could not connect to database', err);
    else console.log('Connected to SQLite database');
});

const schema = fs.readFileSync(schemaPath, 'utf8');

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
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

    const PATIENT_ID = 'patient-123';
    const DOCTOR_ID = 'doctor-123';
    const LAB_ID = 'lab-123';
    const PHARMACY_ID = 'pharmacy-123';
    const INSURANCE_ID = 'insurance-123';

    const DOCTOR_2_ID = 'doctor-456';
    const PATIENT_2_ID = 'patient-456';

    db.serialize(() => {
        const stmtUser = db.prepare("INSERT INTO users (id, name, role, password) VALUES (?, ?, ?, ?)");
        [
            [PATIENT_ID, 'John Doe', 'PATIENT', 'password'],
            [PATIENT_2_ID, 'Priya Sharma', 'PATIENT', 'password'],
            [DOCTOR_ID, 'Dr. Sarah Smith', 'DOCTOR', 'password'],
            [DOCTOR_2_ID, 'Dr. Aakash Mehta', 'DOCTOR', 'password'],
            [LAB_ID, 'City Diagnostics Lab', 'LAB', 'password'],
            [PHARMACY_ID, 'Green Cross Pharmacy', 'PHARMACY', 'password'],
            [INSURANCE_ID, 'HealthGuard Insurance', 'INSURANCE', 'password']
        ].forEach(u => stmtUser.run(u));
        stmtUser.finalize();

        db.run(`INSERT INTO patient_profiles (user_id, dob, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, gender, medical_conditions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [PATIENT_ID, '1994-03-12', '+91 98765 43210', 'john.doe@example.com', '221B Residency Road, Ahmedabad, Gujarat',
             'Mary Doe', '+91 98765 43211', 'O+', 'Penicillin, Peanuts', 'Male', 'Mild hypertension']);

        db.run(`INSERT INTO patient_profiles (user_id, dob, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, gender, medical_conditions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [PATIENT_2_ID, '1998-07-22', '+91 91234 56780', 'priya.sharma@example.com', '14 Satellite Road, Ahmedabad, Gujarat',
             'Raj Sharma', '+91 91234 56781', 'B+', 'None known', 'Female', 'None']);

        db.run(`INSERT INTO doctor_profiles (user_id, designation, specialty, license_number, experience_years, affiliated_hospital, consultation_modes, verification_status, availability_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [DOCTOR_ID, 'MD, General Physician', 'Internal Medicine', 'GJ-MED-20145', 9, 'Sunrise Multispecialty Hospital', 'IN_PERSON,VIDEO', 'VERIFIED', 'AVAILABLE']);

        db.run(`INSERT INTO doctor_profiles (user_id, designation, specialty, license_number, experience_years, affiliated_hospital, consultation_modes, verification_status, availability_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [DOCTOR_2_ID, 'MBBS, MD Cardiology', 'Cardiology', 'GJ-MED-30291', 14, 'City Heart Institute', 'IN_PERSON', 'VERIFIED', 'AVAILABLE']);

        const CASE_1 = 'case-2024-001';
        const CASE_2 = 'case-2025-002';
        const CASE_3 = 'case-2025-003';

        db.run("INSERT INTO medical_cases (id, patient_id, creator_id, title, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [CASE_1, PATIENT_ID, DOCTOR_ID, 'Annual Checkup 2024', 'CLOSED', '2024-01-15 10:00:00']);

        db.run("INSERT INTO medical_cases (id, patient_id, creator_id, title, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [CASE_2, PATIENT_ID, DOCTOR_ID, 'Persistent Cough & Fatigue', 'OPEN', '2025-06-02 09:15:00']);

        db.run("INSERT INTO medical_cases (id, patient_id, creator_id, title, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [CASE_3, PATIENT_2_ID, DOCTOR_2_ID, 'Routine Cardiac Screening', 'OPEN', '2025-05-20 14:00:00']);

        db.run("INSERT INTO visit_records (id, case_id, doctor_id, diagnosis, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [uuidv4(), CASE_1, DOCTOR_ID, 'Healthy', 'Routine checkup. All vitals normal. BP 120/80, HR 72bpm.', '2024-01-15 10:30:00']);

        db.run("INSERT INTO visit_records (id, case_id, doctor_id, diagnosis, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [uuidv4(), CASE_2, DOCTOR_ID, 'Suspected Bronchitis', 'Patient reports 2-week cough, low-grade fever, fatigue. Chest sounds clear on auscultation. Ordering CBC and chest X-ray to rule out infection.', '2025-06-02 09:45:00']);

        db.run("INSERT INTO visit_records (id, case_id, doctor_id, diagnosis, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [uuidv4(), CASE_3, DOCTOR_2_ID, 'Routine screening - no acute findings', 'Annual cardiac risk assessment. ECG within normal limits. Recommending lipid panel.', '2025-05-20 14:30:00']);

        const LAB_TEST_1 = uuidv4();
        const LAB_TEST_2 = uuidv4();
        db.run("INSERT INTO lab_tests (id, case_id, doctor_id, lab_id, test_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [LAB_TEST_1, CASE_2, DOCTOR_ID, LAB_ID, 'Complete Blood Count (CBC)', 'COMPLETED', '2025-06-02 11:00:00']);
        db.run("INSERT INTO lab_reports (id, test_id, uploader_id, file_url, observations, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            [uuidv4(), LAB_TEST_1, LAB_ID, '/mock/reports/cbc-patient123.pdf', 'WBC slightly elevated (11,200/uL), consistent with mild infection. Otherwise within normal range.', '2025-06-03 08:30:00']);

        db.run("INSERT INTO lab_tests (id, case_id, doctor_id, lab_id, test_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [LAB_TEST_2, CASE_2, DOCTOR_ID, LAB_ID, 'Chest X-Ray', 'REQUESTED', '2025-06-02 11:05:00']);

        db.run("INSERT INTO lab_tests (id, case_id, doctor_id, lab_id, test_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [uuidv4(), CASE_3, DOCTOR_2_ID, LAB_ID, 'Lipid Panel', 'REQUESTED', '2025-05-20 15:00:00']);

        const RX_1 = uuidv4();
        db.run("INSERT INTO prescriptions (id, case_id, doctor_id, status, created_at) VALUES (?, ?, ?, ?, ?)",
            [RX_1, CASE_2, DOCTOR_ID, 'ACTIVE', '2025-06-02 09:50:00']);
        const stmtMed = db.prepare("INSERT INTO prescription_medicines (id, prescription_id, medicine_name, dosage, timing, duration, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)");
        stmtMed.run([uuidv4(), RX_1, 'Azithromycin', '500mg', 'Once daily, after food', '5 days', '5 tablets']);
        stmtMed.run([uuidv4(), RX_1, 'Cetirizine', '10mg', 'At night', '7 days', '7 tablets']);
        stmtMed.finalize();

        const RX_2 = uuidv4();
        db.run("INSERT INTO prescriptions (id, case_id, doctor_id, status, created_at) VALUES (?, ?, ?, ?, ?)",
            [RX_2, CASE_1, DOCTOR_ID, 'DISPENSED', '2024-01-15 10:35:00']);
        db.run("INSERT INTO prescription_medicines (id, prescription_id, medicine_name, dosage, timing, duration, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [uuidv4(), RX_2, 'Multivitamin', '1 tablet', 'Morning, after breakfast', '30 days', '30 tablets']);

        const stmtOtc = db.prepare(`INSERT INTO patient_reported_medications (patient_id, name, type, dosage, frequency, start_date, reason, notes)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
        stmtOtc.run([PATIENT_ID, 'Vitamin D3', 'SUPPLEMENT', '2000 IU', 'Daily', '2025-01-10', 'Doctor-recommended for low levels', 'Taken with breakfast']);
        stmtOtc.run([PATIENT_ID, 'Ibuprofen', 'OTC', '400mg', 'As needed', '2025-06-01', 'Occasional headaches', 'Max 2/day']);
        stmtOtc.finalize();

        const stmtAppt = db.prepare(`INSERT INTO appointments (id, provider_id, patient_id, case_id, creator_id, created_by_role, start_time, duration_minutes, type, status, reason_tags, reason_text, created_at)
                                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmtAppt.run([uuidv4(), DOCTOR_ID, PATIENT_ID, CASE_2, PATIENT_ID, 'PATIENT', '2026-07-28 11:00:00', 30, 'IN_PERSON', 'CONFIRMED', '["Follow-up"]', 'Follow-up on cough and lab results', '2025-06-02 09:00:00']);
        stmtAppt.run([uuidv4(), DOCTOR_2_ID, PATIENT_2_ID, CASE_3, PATIENT_2_ID, 'PATIENT', '2026-07-30 15:30:00', 30, 'VIDEO', 'REQUESTED', '["General Consultation"]', 'Discuss lipid panel results', '2025-05-21 10:00:00']);
        stmtAppt.run([uuidv4(), DOCTOR_ID, PATIENT_ID, CASE_1, DOCTOR_ID, 'DOCTOR', '2024-01-15 10:00:00', 30, 'IN_PERSON', 'COMPLETED', '["General Consultation"]', 'Annual checkup', '2024-01-10 09:00:00']);
        stmtAppt.run([uuidv4(), DOCTOR_ID, PATIENT_ID, null, PATIENT_ID, 'PATIENT', '2025-05-10 14:00:00', 15, 'AUDIO', 'CANCELLED', '["Prescription Renewal"]', 'Needed prescription refill', '2025-05-08 12:00:00']);
        stmtAppt.finalize();

        const stmtConsent = db.prepare(`INSERT INTO consents (id, patient_id, provider_id, scope, purpose, status, granted_at, requested_at, expires_at)
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmtConsent.run([uuidv4(), PATIENT_ID, DOCTOR_ID, `CASE:${CASE_2}`, 'Ongoing treatment for respiratory case', 'ACTIVE', '2025-06-02 09:00:00', '2025-06-02 08:55:00', '2025-12-02 09:00:00']);
        stmtConsent.run([uuidv4(), PATIENT_ID, LAB_ID, 'LAB', 'Lab Test Order', 'ACTIVE', '2025-06-02 11:00:00', '2025-06-02 11:00:00', '2025-07-02 11:00:00']);
        stmtConsent.run([uuidv4(), PATIENT_ID, INSURANCE_ID, 'ALL', 'Insurance claim verification', 'REQUESTED', null, '2025-07-15 10:00:00', null]);
        stmtConsent.run([uuidv4(), PATIENT_2_ID, DOCTOR_2_ID, `CASE:${CASE_3}`, 'Cardiac screening follow-up', 'ACTIVE', '2025-05-20 14:00:00', '2025-05-20 13:50:00', '2025-11-20 14:00:00']);
        stmtConsent.finalize();

        db.run(`INSERT INTO case_documents (id, case_id, uploader_id, file_path, original_name, file_type, title, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), CASE_2, PATIENT_ID, '/mock/uploads/xray-referral.pdf', 'xray-referral.pdf', 'application/pdf', 'X-Ray Referral Letter', 'From Dr. Smith', '2025-06-02 11:10:00']);
        db.run(`INSERT INTO case_documents (id, case_id, uploader_id, file_path, original_name, file_type, title, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), CASE_1, DOCTOR_ID, '/mock/uploads/annual-summary-2024.pdf', 'annual-summary-2024.pdf', 'application/pdf', 'Annual Checkup Summary', null, '2024-01-15 10:40:00']);

        const stmtLog = db.prepare(`INSERT INTO access_logs (id, accessor_id, resource_type, resource_id, action, timestamp, reason)
                                     VALUES (?, ?, ?, ?, ?, ?, ?)`);
        stmtLog.run([uuidv4(), DOCTOR_ID, 'CASE', CASE_2, 'READ', '2025-06-02 09:15:00', null]);
        stmtLog.run([uuidv4(), DOCTOR_ID, 'CASE', CASE_2, 'WRITE', '2025-06-02 09:45:00', null]);
        stmtLog.run([uuidv4(), LAB_ID, 'CASE', CASE_2, 'READ', '2025-06-02 11:00:00', null]);
        stmtLog.run([uuidv4(), INSURANCE_ID, 'CASE', CASE_2, 'DENIED', '2025-07-15 10:01:00', 'Consent not yet granted']);
        stmtLog.finalize();

        db.run(`INSERT INTO insurance_claims (id, case_id, insurance_id, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [uuidv4(), CASE_1, INSURANCE_ID, 2400.00, 'SUBMITTED', '2024-01-16 09:00:00']);

        db.run(`INSERT INTO record_disputes (id, patient_id, record_type, record_id, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), PATIENT_ID, 'LAB', LAB_TEST_1, 'WBC count seems inconsistent with how I feel — requesting recheck', 'OPEN', '2025-06-04 09:00:00']);

        console.log('Seeding commands queued.');
    });
}