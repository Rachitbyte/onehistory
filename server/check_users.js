const db = require('./db');

db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
        console.error("Error:", err);
        return;
    }
    console.log("Users:", rows);
});

db.all("SELECT * FROM doctor_profiles", [], (err, rows) => {
    if (err) console.error(err);
    console.log("Doctors:", rows);
});
