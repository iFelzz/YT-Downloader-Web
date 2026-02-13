const http = require('http');

const data = JSON.stringify({
    message: 'Test log from script',
    level: 'info',
    details: { time: Date.now() }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/client-log',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
