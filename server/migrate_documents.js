const db = require('./db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS case_documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    uploader_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'IMAGE', 'PDF', 'DOCX', 'OTHER'
    title TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(case_id) REFERENCES medical_cases(id),
    FOREIGN KEY(uploader_id) REFERENCES users(id)
);
`;

db.serialize(() => {
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error("Error creating case_documents table:", err);
        } else {
            console.log("case_documents table created successfully (or already exists).");
        }
    });
});
