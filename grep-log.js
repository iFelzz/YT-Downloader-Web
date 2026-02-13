const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logPath = path.join(__dirname, 'logs', 'access-2026-02-12.log');

const rl = readline.createInterface({
    input: fs.createReadStream(logPath),
    crlfDelay: Infinity
});

let matches = [];

rl.on('line', (line) => {
    if (line.includes('15:28') && (line.includes('[CLIENT]') || line.includes('[DEBUG]'))) {
        matches.push(line);
    }
});

rl.on('close', () => {
    console.log('Matches found:', matches.length);
    matches.forEach(m => console.log(m));
});
