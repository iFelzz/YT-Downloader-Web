const ytDlp = require('yt-dlp-exec');

const videoId = 'dQw4w9WgXcQ'; // Rick Roll ID
console.log(`Testing yt-dlp with ID: ${videoId}`);

(async () => {
    try {
        console.log('Starting fetch...');
        const startTime = Date.now();
        const info = await ytDlp(videoId, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });
        console.log(`Fetch success! Took ${Date.now() - startTime}ms`);
        console.log('Title:', info.title);
    } catch (error) {
        console.error('Fetch failed:', error);
    }
})();
