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
    
    console.log(buffer.slice(0, bytesRead).toString('utf8'));
} catch (e) {
    console.error(e);
}
