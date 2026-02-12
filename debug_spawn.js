const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Use the same binary path logic as server.js
const exePath = path.join(__dirname, 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe');
const url = 'https://www.youtube.com/watch?v=slZ_PwzVCUg'; // User provided video
const tempFilePath = path.join(__dirname, 'temp', `debug_${Date.now()}.mp4`);

if (!fs.existsSync('temp')) fs.mkdirSync('temp');

const args = [
    url,
    '--output', tempFilePath,
    '--no-check-certificates',
    '--newline', // Force newlines for progress parsing
    '--force-overwrites',
    '--format', 'bestvideo+bestaudio/best', // Match server default
    '--add-header', 'referer:youtube.com',
    '--add-header', 'user-agent:googlebot'
];

console.log(`Spawning: ${exePath} ${args.join(' ')}`);

const subprocess = spawn(exePath, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
});

let stdoutBuffer = '';
let stderrBuffer = '';

const processLine = (line, source) => {
    // console.log(`[RAW LINE ${source}]: ${JSON.stringify(line)}`); // Debug full lines
    
    // Robust ANSI stripping
    const cleanLine = line.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    
    // Regex to find percentages
    // server.js regex: /(?:\s|^|\[)(\d{1,3}(?:\.\d+)?)%/g
    const matches = [...cleanLine.matchAll(/(?:\s|^|\[)(\d{1,3}(?:\.\d+)?)%/g)];
    
    if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        const lastPercent = parseFloat(lastMatch[1]);
        
        if (!isNaN(lastPercent) && lastPercent >= 0 && lastPercent <= 100) {
            console.log(`[PARSED SUCCESS] ${lastPercent}%`);
        }
    } else {
        console.log(`[NO MATCH] ${JSON.stringify(cleanLine)}`);
    }
};

const handleData = (data, source) => {
    const chunk = data.toString();
    let buffer = source === 'STDOUT' ? stdoutBuffer : stderrBuffer;
    
    buffer += chunk;
    
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.substring(0, newlineIndex);
        processLine(line, source);
        buffer = buffer.substring(newlineIndex + 1);
    }
    
    // Update persistent buffer
    if (source === 'STDOUT') stdoutBuffer = buffer;
    else stderrBuffer = buffer;
};

subprocess.stdout.on('data', (data) => handleData(data, 'STDOUT'));
subprocess.stderr.on('data', (data) => handleData(data, 'STDERR'));

subprocess.on('close', (code) => {
    console.log(`Exited with code ${code}`);
    if (fs.existsSync(tempFilePath)) {
        console.log('Cleanup: deleting temp file');
        fs.unlinkSync(tempFilePath);
    }
});
