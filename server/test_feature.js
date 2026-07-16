const id = 'doctor-123';
const password = 'password';
const caseId = 'case-2024-001';

async function test() {
    try {
        console.log("Logging in via http://127.0.0.1:5001/auth/login ...");
        const loginRes = await fetch('http://127.0.0.1:5001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password })
        });

        if (!loginRes.ok) {
            const txt = await loginRes.text();
            console.error(`Login failed: ${loginRes.status} ${txt}`);
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Login Success. Got token.");

        console.log("Updating case status via http://127.0.0.1:5001/api/cases/...");
        const updateRes = await fetch(`http://127.0.0.1:5001/api/cases/${caseId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'OPEN' })
        });

        const updateData = await updateRes.json();
        console.log("Update Status:", updateRes.status);
        console.log("Update Response:", updateData);

    } catch (err) {
        console.error("Test Script Error:", err.message);
        if (err.cause) console.error("Cause:", err.cause);
    }
}

test();
