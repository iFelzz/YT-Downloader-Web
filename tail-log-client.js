const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'logs', 'access-2026-02-12.log');

try {
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    const clientLines = lines.filter(line => line.includes('[CLIENT]'));
    
    // Get last 5
    const last5 = clientLines.slice(-5);
    
    last5.forEach(line => {
        try {
            const json = JSON.parse(line);
            console.log(json.timestamp, json.message);
        } catch (e) {
            console.log('RAW:', line);
        }
    });
} catch (e) {
    console.error(e);
}
