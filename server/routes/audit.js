const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/audit - View Access Logs (Patient Only for their own resources)
router.get('/', (req, res) => {
    // Requirements: "Patient-visible access timeline"
    // "Log every data access"
    // So Patient should see logs where resource_id belongs to them OR access involves them.
    // The `access_logs` table has `resource_id`. 
    // BUT we didn't store `patient_id` in access_logs explicitly.
    // We only have `resource_id`.
    // We need to join? Complex.
    // For demo, let's just show logs where `accessor_id` is the Patient (what they did)
    // AND maybe logs where `resource_type` = 'CASE' and `resource_id` IN (SELECT id FROM cases WHERE patient_id = me)
    // This is getting complicated for a single SQL query in SQLite without big joins.

    if (req.user.role !== 'PATIENT') return res.status(403).json({ error: "Restricted" });

    const patientId = req.user.id; // Corrected from user.id

    // 1. Logs where I accessed something
    // 2. Logs where someone accessed MY case.

    // Find my case IDs
    db.all("SELECT id FROM medical_cases WHERE patient_id = ?", [patientId], (err, cases) => {
        if (err) return res.status(500).json({ error: err.message });
        const caseIds = cases.map(c => c.id);

        if (caseIds.length === 0) return res.json([]);

        // Query logs
        // resource_type = 'CASE' and resource_id IN caseIds
        // OR resource_type = 'PATIENT' and resource_id = patientId

        const placeholders = caseIds.map(() => '?').join(',');
        const query = `
            SELECT * FROM access_logs 
            WHERE (resource_type = 'CASE' AND resource_id IN (${placeholders}))
            OR (resource_type = 'CASE_TIMELINE' AND resource_id IN (${placeholders}))
            ORDER BY timestamp DESC LIMIT 50
        `;

        db.all(query, [...caseIds, ...caseIds], (err, logs) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(logs);
        });
    });
});

module.exports = router;
