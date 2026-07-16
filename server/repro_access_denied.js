const http = require('http');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, body: JSON.parse(data || '{}') });
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function run() {
    try {
        // 1. Login
        console.log("Logging in as doctor-123...");
        const loginRes = await request('POST', '/auth/login', { id: 'doctor-123', password: 'password' });

        if (loginRes.statusCode !== 200) {
            console.error("Login failed:", loginRes.body);
            return;
        }

        const token = loginRes.body.token;
        console.log("Login successful. Token acquired.");

        // 2. Access Case Timeline
        const caseId = '660ec8d2-e22a-49a5-9884-901240256f1b';
        console.log(`Accessing timeline for case ${caseId}...`);

        const timelineRes = await request('GET', `/api/cases/${caseId}/timeline`, null, token);

        console.log(`Status Code: ${timelineRes.statusCode}`);
        if (timelineRes.statusCode !== 200) {
            console.error("Access Denied Response:", timelineRes.body);
        } else {
            console.log("Success! Case title:", timelineRes.body.case?.title);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

run();
