const db = require('./db');

const createTables = `
CREATE TABLE IF NOT EXISTS doctor_profiles (
    user_id TEXT PRIMARY KEY,
    designation TEXT,
    specialty TEXT,
    license_number TEXT,
    experience_years INTEGER,
    affiliated_hospital TEXT,
    consultation_modes TEXT, -- 'IN_PERSON,ONLINE'
    verification_status TEXT DEFAULT 'PENDING',
    availability_status TEXT DEFAULT 'AVAILABLE',
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS patient_profiles (
    user_id TEXT PRIMARY KEY,
    dob DATE,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    blood_group TEXT,
    allergies TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
`;

db.serialize(() => {
    // 1. Create Tables
    db.exec(createTables, (err) => {
        if (err) {
            console.error("Error creating tables:", err);
            return;
        }
        console.log("Profile tables created.");

        // 2. Insert Mock Data for Doctor
        const insertDoctor = `
        INSERT OR IGNORE INTO doctor_profiles 
        (user_id, designation, specialty, license_number, experience_years, affiliated_hospital, consultation_modes, verification_status)
        VALUES 
        ('doctor-123', 'MD, Cardiology', 'Cardiologist', 'LIC-987654', 12, 'City General Hospital', 'IN_PERSON,ONLINE', 'VERIFIED');
        `;

        db.run(insertDoctor, (err) => {
            if (err) console.error("Error inserting doctor profile:", err);
            else console.log("Doctor profile inserted (if not exists).");
        });

        // 3. Insert Mock Data for Patient
        const insertPatient = `
        INSERT OR IGNORE INTO patient_profiles 
        (user_id, dob, phone, email, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies)
        VALUES 
        ('patient-123', '1985-04-12', '+1-555-0123', 'patient123@example.com', '42 Willow Lane, Springfield', 'Jane Doe', '+1-555-0987', 'O+', 'Penicillin, Peanuts');
        `;

        db.run(insertPatient, (err) => {
            if (err) console.error("Error inserting patient profile:", err);
            else console.log("Patient profile inserted (if not exists).");
        });
    });
});
