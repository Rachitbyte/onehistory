const path = require('path');

module.exports = {
    PORT: process.env.PORT || 5001,
    DB_PATH: path.resolve(__dirname, 'db/database.sqlite'),
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-123'
};
