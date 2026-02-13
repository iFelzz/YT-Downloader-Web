require('dotenv').config();
const express = require('express');
const compression = require('compression');
const loggingMiddleware = require('./middleware/logging');
const errorHandler = require('./middleware/errorHandler');

// Routes
const infoRoutes = require('./routes/info');
const downloadRoutes = require('./routes/download');
const adminRoutes = require('./routes/admin');
const playlistRoutes = require('./routes/playlist');
const { downloadQueue } = require('./middleware/download-queue');

const app = express();

// Global Middleware
app.use(express.json());
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        if (req.path.includes('/api/progress')) return false; // Important for SSE
        return compression.filter(req, res);
    }
}));
app.use(express.static('public'));
app.use(loggingMiddleware);

// API Routes
app.use('/api', infoRoutes);
app.use('/api', downloadRoutes); // Includes /info, /download, /batch, /progress
app.use('/api', playlistRoutes);
app.use('/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        queue: downloadQueue.getStatus()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Centralized Error Handler
app.use(errorHandler);

const config = require('./config');

const fs = require('fs');
const path = require('path');

// Cleanup Temp Directory on Startup
function cleanupTempDir() {
    const tempDir = config.DIR_TEMP;
    if (!fs.existsSync(tempDir)) return;

    console.log(`🧹 Cleaning up temp directory: ${tempDir}`);
    fs.readdir(tempDir, (err, files) => {
        if (err) return console.error('❌ Error reading temp dir:', err);

        files.forEach(file => {
            if (file === '.gitkeep') return; // Keep .gitkeep
            
            const filePath = path.join(tempDir, file);
            fs.unlink(filePath, err => {
                if (err) console.error(`❌ Error deleting ${file}:`, err);
                else console.log(`deleted ${file}`);
            });
        });
    });
}

const PORT = config.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📂 Temp Dir: ${config.DIR_TEMP}`);
    console.log(`📝 Logs Dir: ${config.DIR_LOGS}`);
    
    // Run cleanup
    cleanupTempDir();
});
