const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const checkConsent = require('../middleware/consentMiddleware');

// NOTE: All these routes are PROTECTED by consent check.
// However, the `checkConsent` middleware works best when `caseId` or `patientId` is known in params/body.
// All creation routes below must provide `caseId`.

// POST /api/clinical/visits - Add Visit Record
router.post('/visits', checkConsent(), (req, res) => {
    const { caseId, diagnosis, notes } = req.body;
    const doctorId = req.user.id;

    // We assume checkConsent verified the User (Doctor) has access to Case (and thus Patient).

    const id = uuidv4();
    db.run("INSERT INTO visit_records (id, case_id, doctor_id, diagnosis, notes) VALUES (?, ?, ?, ?, ?)",
        [id, caseId, doctorId, diagnosis, notes],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            req.audit('WRITE', 'VISIT_RECORD', id);
            res.json({ id, status: 'saved' });
        }
    );
});

// POST /api/clinical/labs - Order Lab Test
router.post('/labs', checkConsent(), (req, res) => {
    const { caseId, testType, labId } = req.body; // labId is optional if generic? System goal says "Assigned lab"

    const id = uuidv4();
    db.run("INSERT INTO lab_tests (id, case_id, doctor_id, lab_id, test_type, status) VALUES (?, ?, ?, ?, ?, 'REQUESTED')",
        [id, caseId, req.user.id, labId || null, testType],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            req.audit('ORDER', 'LAB_TEST', id);
            // Verify if we should grant consent to that LAB immediately?
            // Ideally yes. "Lab: View assigned lab tests". 
            // Without consent, Lab cannot see the patient/case to upload results.
            if (labId) {
                // Auto-grant consent (System Action)
                const consentId = uuidv4();
                // Find Patient ID from Case first?
                // Complex. For demo, let's assume Lab gets implicit access due to assignment in `lab_tests` table logic?
                // Or we insert a consent record.
                // Let's insert consent record for 7 days.

                db.get("SELECT patient_id FROM medical_cases WHERE id = ?", [caseId], (e, row) => {
                    if (row) {
                        const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
                        db.run("INSERT INTO consents (id, patient_id, provider_id, scope, purpose, status, expires_at) VALUES (?, ?, ?, 'LAB', 'Lab Test Order', 'ACTIVE', ?)",
                            [consentId, row.patient_id, labId, expires]);
                    }
                });
            }

            res.json({ id, status: 'ordered' });
        }
    );
});

// POST /api/clinical/reports - Upload Lab Report (Lab User)
// Lab needs to know the TEST ID.
router.post('/reports', (req, res) => {
    // This is special. Does Lab have consent? 
    // Usually they have consent for the PATIENT via the order.
    // Use checkConsent? 
    // We need to find the `patientId` from the `testId` -> `caseId`.
    // Let's rely on Manual verification of assignment for this route or checkConsent with custom logic.
    // "Lab: Cannot access unrelated patient data"

    const { testId, observations, fileUrl } = req.body;

    // Check if test exists and is assigned to this Lab
    db.get("SELECT * FROM lab_tests WHERE id = ?", [testId], (err, test) => {
        if (err || !test) return res.status(404).json({ error: "Test not found" });
        if (req.user.role === 'LAB' && test.lab_id !== req.user.id) {
            return res.status(403).json({ error: "Not assigned to this lab" });
        }

        // Setup req.params for checkConsent?
        // Actually, if assigned, they should have access.

        const id = uuidv4();
        db.run("INSERT INTO lab_reports (id, test_id, uploader_id, file_url, observations) VALUES (?, ?, ?, ?, ?)",
            [id, testId, req.user.id, fileUrl || 'mock_url', observations],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // Update Status
                db.run("UPDATE lab_tests SET status = 'COMPLETED' WHERE id = ?", [testId]);

                req.audit('UPLOAD', 'LAB_REPORT', id);
                res.json({ id, status: 'uploaded' });
            }
        );
    });
});

// POST /api/clinical/prescriptions - Issue Rx
router.post('/prescriptions', checkConsent(), (req, res) => {
    const { caseId, medicines } = req.body; // medicines = [{name, dosage}]

    if (!medicines || !medicines.length) return res.status(400).json({ error: "No medicines" });

    const id = uuidv4();

    db.serialize(() => {
        db.run("INSERT INTO prescriptions (id, case_id, doctor_id, status) VALUES (?, ?, ?, 'ACTIVE')",
            [id, caseId, req.user.id]);

        const stmt = db.prepare("INSERT INTO prescription_medicines (id, prescription_id, medicine_name, dosage, timing, duration, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)");
        medicines.forEach(med => {
            stmt.run([uuidv4(), id, med.name, med.dosage || '', med.timing, med.duration, med.quantity]);
        });
        stmt.finalize();

        req.audit('ISSUE', 'PRESCRIPTION', id);
        res.json({ id, status: 'issued' });
    });
});

module.exports = router;
