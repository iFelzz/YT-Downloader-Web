require('dotenv').config();
const path = require('path');

const config = {
    // Server
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Directories
    DIR_TEMP: process.env.DIR_TEMP || path.join(__dirname, 'temp'),
    DIR_LOGS: process.env.DIR_LOGS || path.join(__dirname, 'logs'),
    DIR_DOWNLOADS: process.env.DIR_DOWNLOADS || path.join(__dirname, 'downloads'), // For final files if needed

    // Files
    FILE_COOKIES: process.env.FILE_COOKIES || path.join(__dirname, 'cookies.txt'),

    // Security/Limits
    MAX_CONCURRENT_DOWNLOADS: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 3,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};

module.exports = config;
