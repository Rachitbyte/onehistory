const db = require('../db');

// Middleware to check if the Provider has consent to access Patient's data
// This assumes the route parameters will contain either `patientId` or `caseId`.
// If `caseId` is present, we resolve it to `patientId` first.

const checkConsent = (requiredScope = 'ANY') => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        // 1. Patient accessing their own data
        // We need to identify who the 'target' patient is.
        // It might be in req.params.patientId or derived from req.params.caseId

        // This middleware requires async resolution, so we wrap in promise or use callback hell.
        // Let's use a helper to get patientId.

        const deriveContext = (cb) => {
            const params = req.params || {};
            const body = req.body || {};

            if (params.patientId) return cb(params.patientId, null);
            if (body.patientId) return cb(body.patientId, null);

            // Check caseId or id (common param name)
            const cId = params.caseId || body.caseId || params.id;

            if (cId) {
                db.get("SELECT patient_id, creator_id FROM medical_cases WHERE id = ?", [cId], (err, row) => {
                    if (err || !row) return cb(null, null);
                    cb(row.patient_id, row.creator_id);
                });
            } else {
                cb(null, null);
            }
        };

        deriveContext((targetPatientId, creatorId) => {
            console.log(`[ConsentCheck] User: ${user.id} (${user.role}) -> Target Patient: ${targetPatientId}, Creator: ${creatorId}`);

            if (!targetPatientId) {
                console.log("[ConsentCheck] Could not derive patient ID");
                return res.status(400).json({ error: 'Context (Patient/Case) required for consent check' });
            }

            // Case A: User is the Patient
            if (String(user.id) === String(targetPatientId)) {
                console.log("[ConsentCheck] Patient accessing own data. Allow.");
                return next();
            }

            // Case A.5: User is the Creator of the Case (Doctor)
            // Use loose comparison or string conversion to be safe
            if (user.role === 'DOCTOR' && String(user.id) === String(creatorId)) {
                console.log("[ConsentCheck] Doctor is creator of case. Allow.");
                return next();
            }

            // Case B: User is a Provider - Check Consents Table
            const now = new Date().toISOString();

            const query = `
                SELECT * FROM consents 
                WHERE patient_id = ? AND provider_id = ? 
                AND status = 'ACTIVE' 
                AND (expires_at IS NULL OR expires_at > ?)
            `;

            db.get(query, [targetPatientId, user.id, now], (err, consent) => {
                if (err) {
                    console.error("[ConsentCheck] DB Error:", err);
                    return res.status(500).json({ error: 'Db error checking consent' });
                }

                if (consent) {
                    console.log("[ConsentCheck] Active consent found:", consent.id);
                    return next();
                }

                console.log("[ConsentCheck] No active consent found. Checking Emergency...");

                // Case C: Emergency Access
                const emergencyQuery = `
                    SELECT * FROM emergency_accessps 
                    WHERE patient_id = ? AND u_provider_id = ? 
                    AND granted_at <= ? AND expires_at > ?
                `;

                db.get(emergencyQuery, [targetPatientId, user.id, now, now], (err2, emergency) => {
                    if (emergency) {
                        console.log("[ConsentCheck] Emergency access found.");
                        return next();
                    }

                    console.log("[ConsentCheck] DENIED. No Consent or Emergency Access.");
                    return res.status(403).json({ error: 'Access Denied: No active consent or emergency access found.' });
                });
            });
        });
    };
};

module.exports = checkConsent;
