const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Determine file type category
const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return 'DOCX';
    return 'OTHER';
};

// GET /api/documents/:caseId - List documents for a case
router.get('/:caseId', (req, res) => {
    const { caseId } = req.params;
    console.log(`[GET] Fetching documents for case: ${caseId}`);
    db.all("SELECT * FROM case_documents WHERE case_id = ? ORDER BY created_at DESC", [caseId], (err, rows) => {
        if (err) {
            console.error("Error fetching documents:", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log(`Found ${rows.length} documents for case ${caseId}`);
        res.json(rows);
    });
});

// POST /api/documents/upload - Upload files
router.post('/upload', upload.array('files'), (req, res) => {
    // Note: upload.array('files') expects the field name 'files'
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
    }

    const { caseId, uploaderId, notes } = req.body;

    // Notes: notes will be applied to all uploaded files in this batch

    if (!caseId || !uploaderId) {
        // Cleanup files
        req.files.forEach(f => fs.unlinkSync(f.path));
        return res.status(400).json({ error: "Missing caseId or uploaderId" });
    }

    const stmt = db.prepare(`
        INSERT INTO case_documents (id, case_id, uploader_id, file_path, original_name, file_type, title, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let completed = 0;
    let errors = 0;

    console.log(`[POST] Uploading ${req.files.length} files for case ${caseId} by ${uploaderId}`);

    req.files.forEach(file => {
        const fileType = getFileType(file.mimetype);
        const documentId = uuidv4();
        const finalTitle = file.originalname;

        stmt.run([documentId, caseId, uploaderId, file.filename, file.originalname, fileType, finalTitle, notes || ''], function (err) {
            if (err) {
                console.error("Error saving document:", err);
                errors++;
            }
            completed++;
            if (completed === req.files.length) {
                stmt.finalize();
                if (errors > 0 && errors === req.files.length) {
                    return res.status(500).json({ error: "Failed to save document metadata" });
                }
                res.status(201).json({ message: "Documents uploaded successfully" });
            }
        });
    });
});

// GET /api/documents/file/:filename - Serve the file
router.get('/file/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: "File not found" });
    }
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // First get the file path
    db.get("SELECT file_path FROM case_documents WHERE id = ?", [id], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: "Document not found" });
        }

        const filePath = path.join(__dirname, '../uploads', row.file_path);

        db.run("DELETE FROM case_documents WHERE id = ?", [id], (err) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }
            // Try to delete file, but don't fail if it's already gone
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (e) {
                console.error("Error deleting file from disk:", e);
            }
            res.json({ message: "Document deleted" });
        });
    });
});

module.exports = router;
