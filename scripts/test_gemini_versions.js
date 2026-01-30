const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
const modelName = "gemini-2.0-flash-lite";

const payload = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: "Hello, are you working?" }] }]
});

function testEndpoint(version) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/${version}/models/${modelName}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({ version, status: res.statusCode, body: data });
            });
        });

        req.on('error', (e) => {
            resolve({ version, status: 'Error', error: e.message });
        });

        req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log(`Testing ${modelName} availability...`);

    const v1beta = await testEndpoint('v1beta');
    console.log(`[v1beta] Status: ${v1beta.status}`);
    if (v1beta.status !== 200) console.log(`[v1beta] Body: ${v1beta.body.substring(0, 200)}...`);

    const v1 = await testEndpoint('v1');
    console.log(`[v1] Status: ${v1.status}`);
    if (v1.status !== 200) console.log(`[v1] Body: ${v1.body.substring(0, 200)}...`);
}

runTests();
