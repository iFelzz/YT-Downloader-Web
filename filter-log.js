const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'logs', 'access-2026-02-12.log');

try {
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.includes('[CLIENT]')) {
            console.log('ENTRY:', line.substring(0, 200)); // Print first 200 chars to identify
        }
    });
} catch (e) {
    console.error(e);
}
