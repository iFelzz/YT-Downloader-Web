const ytDlp = require('yt-dlp-exec');
const path = require('path');

const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll (short)

console.log('Testing yt-dlp streaming...');

const subprocess = ytDlp.exec(url, {
    output: path.join(__dirname, 'test_video.%(ext)s'),
    format: 'best[height<=360]',
    noCheckCertificates: true,
    newline: true // Force newlines for progress
});

subprocess.stdout.on('data', (data) => {
    const output = data.toString();
    const progressMatches = [...output.matchAll(/(\d+\.?\d*)%/g)];
    if (progressMatches.length > 0) {
        const lastPercent = progressMatches[progressMatches.length - 1][1];
        console.log('Progress:', lastPercent + '%');
    }
});

subprocess.stderr.on('data', (data) => {
    console.log('STDERR chunk:', data.toString());
});

subprocess.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
});

console.log('Process started.');
