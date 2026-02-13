const http = require('http');

const data = JSON.stringify({
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    resolution: '720p',
    format: 'mp4',
    clientId: 'test-client'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/download',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', d => {
        process.stdout.write(d);
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();
