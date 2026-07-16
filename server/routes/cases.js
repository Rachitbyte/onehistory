const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const checkConsent = require('../middleware/consentMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

// GET /api/cases - List cases for the user
router.get('/', (req, res) => {
    const user = req.user;

    if (user.role === 'PATIENT') {
        db.all("SELECT * FROM medical_cases WHERE patient_id = ? ORDER BY created_at DESC", [user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    } else {
        // Provider: See cases they created OR have consent for.
        // For simple list, let's just show cases they created.
        // Or if they want to search a patient, they should use a search param?
        // Let's support ?patientId=...

        if (req.query.patientId) {
            // Check consent for this patient
            // We can't use middleware easily here because it's a query param logic inside the handler or we invoke function.
            // Let's do raw query check for consent.

            const pId = req.query.patientId;
            // Check consent
            const now = new Date().toISOString();
            db.get("SELECT * FROM consents WHERE patient_id = ? AND provider_id = ? AND status = 'ACTIVE' AND (expires_at IS NULL OR expires_at > ?)",
                [pId, user.id, now], (err, consent) => {
                    if (!consent) return res.status(403).json({ error: "No consent to view this patient's cases" });

                    db.all("SELECT * FROM medical_cases WHERE patient_id = ? ORDER BY created_at DESC", [pId], (err, rows) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json(rows);
                    });
                });
        } else {
            // Just show cases created by me
            db.all("SELECT * FROM medical_cases WHERE creator_id = ? ORDER BY created_at DESC", [user.id], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            });
        }
    }
});

// POST /api/cases - Create new case (Doctor only)
router.post('/', requireRole(['DOCTOR']), (req, res) => {
    console.log("Create Case Request Body:", req.body);
    const { patientId, title } = req.body;
    if (!patientId || !title) return res.status(400).json({ error: "Missing fields" });

    // Enforce Consent: Regardless of general access, creating a NEW case requires specific permission for that case.
    // We create the case in 'PENDING_CONSENT' mode and generate a request.
    const now = new Date().toISOString();

    // We assume any valid doctor can TRY to create a case. The check happens via the Patient Approval.
    const id = uuidv4();
    const status = 'PENDING_CONSENT';

    db.run("INSERT INTO medical_cases (id, patient_id, creator_id, title, status) VALUES (?, ?, ?, ?, ?)",
        [id, patientId, req.user.id, title, status],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Case is Pending. Create a Consent Request specifically for this case.
            // Scope = 'CASE:' + id
            const consentId = uuidv4();
            const purpose = `Allow creation of case: ${title}`;

            db.run(`INSERT INTO consents (id, patient_id, provider_id, scope, purpose, status, requested_at) 
                    VALUES (?, ?, ?, ?, ?, 'REQUESTED', ?)`,
                [consentId, patientId, req.user.id, `CASE:${id}`, purpose, now],
                (err2) => {
                    if (err2) return res.status(500).json({ error: "Case created but consent request failed." });

                    req.audit('REQUEST_CONSENT', 'CASE', id);
                    res.json({ id, status: 'pending_consent', message: 'Case pending approval.' });
                }
            );
        }
    );
});

// GET /api/cases/:caseId/timeline - The Core View
router.get('/:caseId/timeline', checkConsent(), async (req, res) => {
    const { caseId } = req.params;

    // Helper for async queries
    const query = (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    try {
        const caseData = await query("SELECT * FROM medical_cases WHERE id = ?", [caseId]);
        if (!caseData.length) return res.status(404).json({ error: "Case not found" });

        // Parallel fetch for demo speed (could be Promise.all)
        const visits = await query("SELECT id, 'VISIT' as type, created_at, diagnosis as summary, notes as details, doctor_id as actor FROM visit_records WHERE case_id = ?", [caseId]);

        const labs = await query("SELECT id, 'LAB_REQUEST' as type, created_at, test_type as summary, status as details, doctor_id as actor FROM lab_tests WHERE case_id = ?", [caseId]);

        const reports = await query(`SELECT r.id, 'LAB_REPORT' as type, r.created_at, 'Report Uploaded' as summary, r.observations as details, r.uploader_id as actor 
                FROM lab_reports r 
                JOIN lab_tests t ON r.test_id = t.id 
                WHERE t.case_id = ?`, [caseId]);

        const rxs = await query(`
            SELECT p.id, 'PRESCRIPTION' as type, p.created_at, 'Prescription' as summary, 
            'Medicines: ' || GROUP_CONCAT(
                pm.medicine_name || ' (' || COALESCE(pm.quantity, pm.dosage, '') || ')' || 
                CASE WHEN pm.timing IS NOT NULL AND pm.timing != '' THEN ' - ' || pm.timing ELSE '' END || 
                CASE WHEN pm.duration IS NOT NULL AND pm.duration != '' THEN ' [' || pm.duration || ']' ELSE '' END
            , ' ||| ') as details, 
            p.doctor_id as actor 
            FROM prescriptions p
            LEFT JOIN prescription_medicines pm ON p.id = pm.prescription_id
            WHERE p.case_id = ?
            GROUP BY p.id
        `, [caseId]);

        const appointments = await query(`
            SELECT id, 'APPOINTMENT' as type, created_at, 'Appointment Scheduled' as summary, 
            start_time as details, creator_id as actor 
            FROM appointments 
            WHERE case_id = ?
        `, [caseId]);

        const timeline = [...visits, ...labs, ...reports, ...rxs, ...appointments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest first

        req.audit('READ', 'CASE_TIMELINE', caseId);
        res.json({ case: caseData[0], timeline });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/cases/:id/status - Update Status (Close/Reopen)
// PATCH /api/cases/:id/status - Update Status (Close/Reopen/Approve)
router.patch('/:id/status', requireRole(['DOCTOR', 'PATIENT']), (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    // Validate Status Logic
    // Doctor: Can Close or Reopen (OPEN <-> CLOSED)
    // Patient: Can Approve (PENDING_CONSENT -> OPEN)

    // First, fetch the case to verify permissions and current state
    db.get("SELECT * FROM medical_cases WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Case not found" });

        // Logic Check
        let allowed = false;

        if (user.role === 'DOCTOR') {
            // Doctors can manage OPEN/CLOSED. 
            // Ideally, they shouldn't force approve a pending case, but for flexibility we might allow logic improvements later.
            // For now, let's keep Doctor logic as OPEN/closed.
            if (['OPEN', 'CLOSED'].includes(status)) allowed = true;
        }
        else if (user.role === 'PATIENT') {
            // Patient Owner Check
            if (row.patient_id !== user.id) return res.status(403).json({ error: "Unauthorized access to this case." });

            // Approval Flow: Only PENDING -> OPEN
            if (row.status === 'PENDING_CONSENT' && status === 'OPEN') {
                allowed = true;
            }
        }

        if (!allowed) {
            return res.status(403).json({ error: "Action not allowed for your role or current case status." });
        }

        // Perform Update
        db.run("UPDATE medical_cases SET status = ? WHERE id = ?", [status, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            req.audit('UPDATE', 'CASE_STATUS', id, `Changed to ${status} by ${user.role}`);
            res.json({ message: "Status updated", status });
        });
    });
});

module.exports = router;
