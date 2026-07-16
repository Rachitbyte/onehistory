const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Middleware to verify JWT and populate req.user
const authenticateToken = (req, res, next) => {
    // For demo simplicity, we also allow passing user specific headers if token missing?? 
    // No, let's stick to JWT for cleanliness. Login will issue it.

    // Exception for login/register routes is handled in app structure or router

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware to enforce role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied: insufficient privileges' });
        }
        next();
    };
};

module.exports = { authenticateToken, requireRole };
