/**
 * Download Queue System
 * Manages concurrent downloads to prevent server overload
 */

const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class DownloadQueue extends EventEmitter {
    constructor(options = {}) {
        super();
        this.maxConcurrent = options.maxConcurrent || 2;
        this.maxQueue = options.maxQueue || 50;
        this.activeDownloads = new Map();
        this.queue = [];
        this.completedDownloads = [];
        this.stats = {
            total: 0,
            completed: 0,
            failed: 0
        };
    }

    /**
     * Add download to queue
     */
    add(downloadTask) {
        const job = {
            id: uuidv4(),
            task: downloadTask.task,
            options: downloadTask.options || {},
            priority: downloadTask.priority || 0,
            createdAt: new Date(),
            status: 'queued',
            progress: 0
        };

        // Check if queue is full
        if (this.queue.length + this.activeDownloads.size >= this.maxQueue) {
            throw new Error('Queue is full. Please try again later.');
        }

        // Insert based on priority (higher priority first)
        const insertIndex = this.queue.findIndex(item => item.priority < job.priority);
        if (insertIndex === -1) {
            this.queue.push(job);
        } else {
            this.queue.splice(insertIndex, 0, job);
        }

        this.stats.total++;
        
        this.emit('added', job);
        this.processQueue();

        return job;
    }

    /**
     * Process next job in queue
     */
    async processQueue() {
        // Skip if max concurrent reached or queue empty
        if (this.activeDownloads.size >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        const job = this.queue.shift();
        job.status = 'processing';
        job.startedAt = new Date();
        this.activeDownloads.set(job.id, job);

        this.emit('started', job);

        try {
            // Execute the download task
            const result = await job.task(job.options);
            
            job.status = 'completed';
            job.completedAt = new Date();
            job.result = result;
            this.stats.completed++;
            
            this.activeDownloads.delete(job.id);
            this.completedDownloads.push(job);
            
            // Keep only last 100 completed jobs
            if (this.completedDownloads.length > 100) {
                this.completedDownloads.shift();
            }

            this.emit('completed', job, result);
            
            // Process next job
            this.processQueue();

        } catch (error) {
            job.status = 'failed';
            job.failedAt = new Date();
            job.error = error.message;
            this.stats.failed++;
            
            this.activeDownloads.delete(job.id);
            this.completedDownloads.push(job);

            this.emit('failed', job, error);
            
            // Process next job
            this.processQueue();
        }
    }

    /**
     * Get job status
     */
    getJobStatus(jobId) {
        // Check active downloads
        if (this.activeDownloads.has(jobId)) {
            return {
                id: jobId,
                status: 'processing',
                progress: this.activeDownloads.get(jobId).progress
            };
        }

        // Check completed/failed
        const job = this.completedDownloads.find(j => j.id === jobId);
        if (job) {
            return {
                id: jobId,
                status: job.status,
                completedAt: job.completedAt,
                error: job.error
            };
        }

        // Check queue
        const queuedJob = this.queue.find(j => j.id === jobId);
        if (queuedJob) {
            return {
                id: jobId,
                status: 'queued',
                position: this.queue.indexOf(queuedJob) + 1
            };
        }

        return null;
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            active: this.activeDownloads.size,
            queued: this.queue.length,
            maxConcurrent: this.maxConcurrent,
            maxQueue: this.maxQueue,
            stats: this.stats
        };
    }

    /**
     * Cancel a queued job
     */
    cancelJob(jobId) {
        const index = this.queue.findIndex(j => j.id === jobId);
        if (index !== -1) {
            const job = this.queue.splice(index, 1)[0];
            this.emit('cancelled', job);
            return true;
        }
        return false;
    }
}

// Singleton instance
const downloadQueue = new DownloadQueue({
    maxConcurrent: 2, // Max 2 concurrent downloads
    maxQueue: 50 // Max 50 queued downloads
});

module.exports = { DownloadQueue, downloadQueue };
