const http = require('http');
const fs = require('fs');
const path = require('path');

const filename = '1769195766207-677426916.png';
const url = `http://localhost:5001/api/documents/file/${filename}`;

console.log(`Testing URL: ${url}`);

http.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);

    if (res.statusCode === 200) {
        console.log("File found and served.");
    } else {
        console.log("Failed to fetch file.");
        res.on('data', d => process.stdout.write(d));
    }
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});
