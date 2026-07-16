const db = require('./db');

const alterTable = `
    ALTER TABLE patient_profiles ADD COLUMN gender TEXT;
    ALTER TABLE patient_profiles ADD COLUMN medical_conditions TEXT;
`;

const updateMockData = `
    UPDATE patient_profiles 
    SET gender = 'Female',
        medical_conditions = 'Type 2 Diabetes, Hypertension',
        dob = '1985-04-12' -- Ensure DOB is set for age calculation
    WHERE user_id = 'patient-123';
`;

db.serialize(() => {
    // 1. Add 'gender' column
    db.run("ALTER TABLE patient_profiles ADD COLUMN gender TEXT", (err) => {
        if (err && !err.message.includes("duplicate column")) {
            console.error("Error adding gender column:", err);
        } else {
            console.log("Column 'gender' added (or already exists).");
        }
    });

    // 2. Add 'medical_conditions' column
    db.run("ALTER TABLE patient_profiles ADD COLUMN medical_conditions TEXT", (err) => {
        if (err && !err.message.includes("duplicate column")) {
            console.error("Error adding medical_conditions column:", err);
        } else {
            console.log("Column 'medical_conditions' added (or already exists).");
        }
    });

    // 3. Update Mock Data
    db.run(updateMockData, (err) => {
        if (err) console.error("Error updating mock data:", err);
        else console.log("Mock data updated with new fields.");
    });
});
