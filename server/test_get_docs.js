const api = require('axios');

const CASE_ID = '660ec8d2-e22a-49a5-9884-901240256f1b';

async function testGet() {
    try {
        const res = await api.get(`http://localhost:5000/api/documents/${CASE_ID}`);
        console.log("Status:", res.status);
        console.log("Data:", res.data);
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) console.error("Response:", error.response.data);
    }
}

testGet();
