-- Users (Patient, Doctor, Lab, Pharmacy, Insurance)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- UUID
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('PATIENT', 'DOCTOR', 'LAB', 'PHARMACY', 'INSURANCE')),
    password TEXT NOT NULL -- Simple plain text or hash
);

-- Medical Cases (The Backbone)
CREATE TABLE IF NOT EXISTS medical_cases (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    creator_id TEXT NOT NULL, -- Doctor who started it
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('OPEN', 'CLOSED', 'PENDING_CONSENT')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES users(id),
    FOREIGN KEY(creator_id) REFERENCES users(id)
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    case_id TEXT, -- Can be linked to a case or generic
    patient_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    scheduled_time DATETIME NOT NULL,
    status TEXT DEFAULT 'SCHEDULED' CHECK(status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES users(id),
    FOREIGN KEY(provider_id) REFERENCES users(id),
    FOREIGN KEY(case_id) REFERENCES medical_cases(id)
);

-- Visit Records (Clinical Notes) - Append Only (Amendments linked via parent_id?)
-- Prompt says: "Corrections are stored as amendments"
CREATE TABLE IF NOT EXISTS visit_records (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    diagnosis TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    amendment_of_id TEXT, -- If this is a correction, points to original
    FOREIGN KEY(case_id) REFERENCES medical_cases(id),
    FOREIGN KEY(doctor_id) REFERENCES users(id),
    FOREIGN KEY(amendment_of_id) REFERENCES visit_records(id)
);

-- Lab Tests
CREATE TABLE IF NOT EXISTS lab_tests (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    lab_id TEXT, -- Assigned lab
    test_type TEXT NOT NULL,
    status TEXT DEFAULT 'REQUESTED' CHECK(status IN ('REQUESTED', 'COMPLETED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(case_id) REFERENCES medical_cases(id),
    FOREIGN KEY(doctor_id) REFERENCES users(id),
    FOREIGN KEY(lab_id) REFERENCES users(id)
);

-- Lab Reports
CREATE TABLE IF NOT EXISTS lab_reports (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL,
    uploader_id TEXT NOT NULL, -- Lab user
    file_url TEXT, -- Mock URL
    observations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(test_id) REFERENCES lab_tests(id),
    FOREIGN KEY(uploader_id) REFERENCES users(id)
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'DISPENSED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(case_id) REFERENCES medical_cases(id),
    FOREIGN KEY(doctor_id) REFERENCES users(id)
);

-- Medicines in Prescription
CREATE TABLE IF NOT EXISTS prescription_medicines (
    id TEXT PRIMARY KEY,
    prescription_id TEXT NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    FOREIGN KEY(prescription_id) REFERENCES prescriptions(id)
);

-- Consents (Granular Access Control)
CREATE TABLE IF NOT EXISTS consents (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    scope TEXT NOT NULL, -- e.g. 'CASE:case_id' or 'ALL' or 'LAB'
    purpose TEXT,
    status TEXT DEFAULT 'REQUESTED' CHECK(status IN ('ACTIVE', 'REVOKED', 'EXPIRED', 'REQUESTED')),
    granted_at DATETIME,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY(patient_id) REFERENCES users(id),
    FOREIGN KEY(provider_id) REFERENCES users(id)
);

-- Access Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS access_logs (
    id TEXT PRIMARY KEY,
    accessor_id TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'CASE', 'REPORT', etc
    resource_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'READ', 'WRITE', 'DENIED'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    reason TEXT, -- For emergency access
    FOREIGN KEY(accessor_id) REFERENCES users(id)
);

-- Emergency Access
CREATE TABLE IF NOT EXISTS emergency_accessps (
    id TEXT PRIMARY KEY,
    u_provider_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(u_provider_id) REFERENCES users(id),
    FOREIGN KEY(patient_id) REFERENCES users(id)
);

-- Record Dispute
CREATE TABLE IF NOT EXISTS record_disputes (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    record_type TEXT NOT NULL, -- 'VISIT', 'LAB'
    record_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES users(id)
);

-- Insurance Claims
CREATE TABLE IF NOT EXISTS insurance_claims (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    insurance_id TEXT NOT NULL,
    amount DECIMAL(10,2),
    status TEXT DEFAULT 'SUBMITTED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(case_id) REFERENCES medical_cases(id),
    FOREIGN KEY(insurance_id) REFERENCES users(id)
);

-- Patient Reported Medications (Non-Prescription)
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
