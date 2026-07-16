const path = require('path');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in the environment. Copy .env.example to .env and set a value.');
}

module.exports = {
    PORT: process.env.PORT || 5001,
    DB_PATH: path.join(__dirname, 'db', 'database.sqlite'),
    JWT_SECRET
};
