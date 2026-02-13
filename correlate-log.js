const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'logs', 'access-2026-02-12.log');

try {
    const stats = fs.statSync(logPath);
    const size = stats.size;
    const bufferSize = 10000;
    const buffer = Buffer.alloc(bufferSize);
    
    const fd = fs.openSync(logPath, 'r');
    const position = Math.max(0, size - bufferSize);
    const bytesRead = fs.readSync(fd, buffer, 0, bufferSize, position);
    fs.closeSync(fd);
    
    const content = buffer.slice(0, bytesRead).toString('utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
        if (line.includes('[CLIENT]') || line.includes('/api/download')) {
            console.log(line.substring(0, 300)); // Print enough to see
        }
    });
} catch (e) {
    console.error(e);
}
