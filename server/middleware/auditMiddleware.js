const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const logAccess = (req, res, next) => {
    // We log after the response finishes to capture status? 
    // Or before to capture intent? Prompt says "Log every data access".
    // Better to log "attempt" or "outcome". 
    // Let's log the attempt. If it fails (403), we should update the log?
    // Simplified: Log successful access or denied access. 

    // For this middleware, we can just hook into 'finish' event of response,
    // BUT we need to know RESOURCE ID.
    // Resource ID usually in req.params or req.body.

    // We'll write a helper attached to req that routes can call?
    // Or generic interception? Generic is hard to identify Resource ID.

    // Compromise: This middleware sets up the logger function on req.

    req.audit = (action, resourceType, resourceId, reason = null) => {
        if (!req.user) return; // Should be authenticated

        const stmt = db.prepare(`
            INSERT INTO access_logs (id, accessor_id, resource_type, resource_id, action, reason)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run([uuidv4(), req.user.id, resourceType, resourceId, action, reason], (err) => {
            if (err) console.error("Audit Log Error:", err);
        });
        stmt.finalize();
    };

    next();
};

module.exports = logAccess;
