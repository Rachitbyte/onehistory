const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Helper: Check Availability (Step 3)
const checkAvailability = (providerId, startTime, endTime, excludeId = null) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT id FROM appointments 
            WHERE provider_id = ? 
            AND status IN ('CONFIRMED', 'REQUESTED', 'RESCHEDULED')
            AND (
                (start_time < ? AND datetime(start_time, '+' || duration_minutes || ' minutes') > ?)
            )
        `;
        const params = [providerId, endTime, startTime];

        if (excludeId) {
            query += " AND id != ?";
            params.push(excludeId);
        }

        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(!!row); // Returns true if collision exists
        });
    });
};

// GET /api/appointments-v2 - List with Filters
router.get('/', (req, res) => {
    const user = req.user;
    const { status, limit, offset, view } = req.query;

    let query = `
        SELECT a.*, 
        p.name as patient_name, d.name as provider_name
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        JOIN users d ON a.provider_id = d.id
        WHERE 
    `;
    let params = [];

    if (user.role === 'PATIENT') {
        query += "a.patient_id = ?";
        params.push(user.id);
    } else {
        query += "a.provider_id = ?";
        params.push(user.id);
    }

    if (view === 'upcoming') {
        // Active appointments in future (Dashboard/Upcoming Tab)
        query += " AND a.status IN ('REQUESTED', 'CONFIRMED')";
        query += " AND a.start_time >= datetime('now')";
        query += " ORDER BY a.start_time ASC";
    } else if (view === 'history') {
        query += " AND (a.status IN ('COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED') OR a.start_time < datetime('now'))";
        query += " ORDER BY a.start_time DESC";
    } else {
        // Raw filter fallback
        if (status) {
            query += " AND a.status = ?";
            params.push(status);
        }
        query += " ORDER BY a.start_time DESC";
    }

    if (limit) {
        query += " LIMIT ?";
        params.push(limit);
    }

    if (offset) {
        query += " OFFSET ?";
        params.push(offset);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/appointments-v2 - Create Request
router.post('/', async (req, res) => {
    console.log("!!! SERVER HIT !!! POST /api/appointments-v2"); // MARKER
    console.log("Request Body:", req.body); // Check entire body
    const { targetId, startTime, duration, type, reasonTags, reasonText, caseId, rescheduledFromId } = req.body;
    console.log(`[DEBUG] Creating Appointment. CaseID matches: ${caseId}`);
    const user = req.user;

    const missing = [];
    if (!targetId) missing.push('targetId');
    if (!startTime) missing.push('startTime');
    if (!duration) missing.push('duration');
    if (!type) missing.push('type');

    if (missing.length > 0) {
        console.log("Missing fields:", missing);
        return res.status(400).json({ error: `DEBUG_SERVER_V2: Missing required fields: ${missing.join(', ')}` });
    }

    let patientId, providerId, creatorRole;

    if (user.role === 'PATIENT') {
        patientId = user.id;
        providerId = targetId;
        creatorRole = 'PATIENT';
    } else {
        providerId = user.id;
        patientId = targetId;
        creatorRole = 'DOCTOR';
    }

    // Calculate End Time for availability check
    const start = new Date(startTime).toISOString();
    const endDate = new Date(new Date(startTime).getTime() + duration * 60000).toISOString();

    try {
        // Step 3: Availability Rule
        const isBooked = await checkAvailability(providerId, start, endDate);
        if (isBooked) {
            return res.status(409).json({ error: "Time slot unavailable." });
        }

        const id = uuidv4();
        const status = 'REQUESTED';
        const now = new Date().toISOString();

        db.run(`INSERT INTO appointments (
            id, provider_id, patient_id, case_id, 
            creator_id, created_by_role, 
            start_time, duration_minutes, type, status, 
            rescheduled_from_id, cancelled_at,
            reason_tags, reason_text, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, providerId, patientId, caseId || null,
                user.id, creatorRole,
                start, duration, type, status,
                rescheduledFromId || null, null,
                JSON.stringify(reasonTags || []), reasonText || '', now, now
            ],
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                req.audit('BOOK', 'APPOINTMENT', id);
                res.json({ id, status: 'success' });
            });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/appointments-v2/:id/status
router.patch('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    const user = req.user;

    const allowedTransitions = {
        'REQUESTED': ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED': ['COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'],
        'RESCHEDULED': ['CANCELLED']
    };

    db.get("SELECT * FROM appointments WHERE id = ?", [id], (err, appt) => {
        if (err || !appt) return res.status(404).json({ error: "Appointment not found" });

        // Access Control
        if (appt.provider_id !== user.id && appt.patient_id !== user.id) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const currentStatus = appt.status;

        // Step 2: Enforce Transitions
        if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(status)) {
            return res.status(400).json({ error: `Invalid transition from ${currentStatus} to ${status}` });
        }

        // Specific Rules
        // Only Doctor can Confirm
        if (status === 'CONFIRMED' && user.role !== 'DOCTOR') {
            return res.status(403).json({ error: "Only doctors can confirm appointments" });
        }

        let changes = { status, updated_at: new Date().toISOString() };
        let sql = "UPDATE appointments SET status = ?, updated_at = ?";
        let params = [status, changes.updated_at];

        // Soft Delete for Cancel
        if (status === 'CANCELLED') {
            sql += ", cancelled_at = ?";
            params.push(new Date().toISOString());
        }

        sql += " WHERE id = ?";
        params.push(id);

        db.run(sql, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            req.audit('UPDATE', 'APPOINTMENT_STATUS', id, `Changed to ${status}`);
            res.json({ success: true, status });
        });
    });
});

module.exports = router;
