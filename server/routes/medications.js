const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/medications - List medications
// If Patient: returns their own meds
// If Doctor: returns meds for `patientId` query param (if access granted - simplified for now as per context)
router.get('/', (req, res) => {
    const { id, role } = req.user;
    const { patientId } = req.query;

    let targetId = id;
    if (role === 'DOCTOR') {
        if (!patientId) return res.status(400).json({ error: "Patient ID required for doctors" });
        targetId = patientId;
        // In a real app, we'd check consent here. 
        // For MVP/Demo as per previous context logic (Dashboard search), we assume if they can see the case/profile they can see this.
    }

    const sql = `SELECT * FROM patient_reported_medications WHERE patient_id = ? ORDER BY created_at DESC`;
    db.all(sql, [targetId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST /api/medications - Add new medication
router.post('/', (req, res) => {
    const { id, role } = req.user;
    if (role !== 'PATIENT') return res.status(403).json({ error: "Only patients can report medications" });

    const { name, type, dosage, frequency, start_date, reason, notes } = req.body;

    if (!name || !type) return res.status(400).json({ error: "Name and Type are required" });

    const sql = `
        INSERT INTO patient_reported_medications (patient_id, name, type, dosage, frequency, start_date, reason, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [id, name, type, dosage, frequency, start_date, reason, notes], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, message: "Medication added" });
    });
});

// PUT /api/medications/:id - Update medication
router.put('/:id', (req, res) => {
    const { id, role } = req.user;
    if (role !== 'PATIENT') return res.status(403).json({ error: "Only patients can edit medications" });

    const medId = req.params.id;
    const { name, type, dosage, frequency, start_date, end_date, reason, notes } = req.body;

    // Verify ownership
    db.get(`SELECT patient_id FROM patient_reported_medications WHERE id = ?`, [medId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Medication not found" });
        if (row.patient_id !== id) return res.status(403).json({ error: "Unauthorized" });

        const sql = `
            UPDATE patient_reported_medications 
            SET name = ?, type = ?, dosage = ?, frequency = ?, start_date = ?, end_date = ?, reason = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(sql, [name, type, dosage, frequency, start_date, end_date, reason, notes, medId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Medication updated" });
        });
    });
});

// DELETE /api/medications/:id - Delete medication
router.delete('/:id', (req, res) => {
    const { id, role } = req.user;
    if (role !== 'PATIENT') return res.status(403).json({ error: "Only patients can delete medications" });

    const medId = req.params.id;

    // Verify ownership
    db.get(`SELECT patient_id FROM patient_reported_medications WHERE id = ?`, [medId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Medication not found" });
        if (row.patient_id !== id) return res.status(403).json({ error: "Unauthorized" });

        db.run(`DELETE FROM patient_reported_medications WHERE id = ?`, [medId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Medication deleted" });
        });
    });
});

module.exports = router;
