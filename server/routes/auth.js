const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../config');

// POST /auth/login
router.post('/login', (req, res) => {
    const { id, password } = req.body;

    // Simple password check (plaintext for demo as per requirements)
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        // Payload includes id, name, role
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    });
});

module.exports = router;
