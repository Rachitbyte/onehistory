const db = require('./db');

db.all("SELECT * FROM case_documents", (err, rows) => {
    if (err) {
        console.error("Error fetching documents:", err);
    } else {
        console.log("Documents in DB:", rows);
    }
});
