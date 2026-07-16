const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');
const db = require('./db');

// Middleware
const authMiddleware = require('./middleware/authMiddleware'); // Object {authenticateToken, requireRole}
const logAccess = require('./middleware/auditMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Public Routes
app.get('/', (req, res) => res.send('Medical History System API'));

// Auth Routes (Login)
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Protected Routes
// Apply Authentication and Auditing globally to API routes
app.use('/api', authMiddleware.authenticateToken);
app.use('/api', logAccess);

// API Route Handlers
app.use('/api/cases', require('./routes/cases'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/appointments-v2', require('./routes/appointments_new')); // DEBUG FIX
app.use('/api/consent', require('./routes/consent'));
app.use('/api/clinical', require('./routes/clinical')); // Visit, Prescription, Lab
app.use('/api/audit', require('./routes/audit'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/medications', require('./routes/medications'));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Health check: System v2.1 loaded (Timeline Appointments Enabled)");
});
