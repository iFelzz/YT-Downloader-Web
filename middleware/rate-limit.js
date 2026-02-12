/**
 * Rate Limiting Middleware Configuration
 * Protects against abuse and DoS attacks
 */

const rateLimit = require('express-rate-limit');
const logger = require('../logger');

/**
 * General API rate limiter
 * - 100 requests per 15 minutes per IP
 */
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        success: false,
        error: 'Terlalu banyak permintaan. Silakan coba lagi dalam 15 menit.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, options) => {
        logger.warn('Rate limit exceeded', {
            action: 'rate_limit_exceeded',
            ip: req.userIp,
            path: req.path,
            limit: options.max,
            windowMs: options.windowMs
        });
        res.status(429).json(options.message);
    }
});

/**
 * Download rate limiter (stricter)
 * - 10 downloads per hour per IP
 */
const downloadRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 downloads per hour
    message: {
        success: false,
        error: 'Batas unduhan tercapai. Silakan coba lagi dalam 1 jam.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.userIp || req.ip,
    handler: (req, res, options) => {
        logger.warn('Download rate limit exceeded', {
            action: 'download_rate_limit_exceeded',
            ip: req.userIp,
            limit: options.max,
            windowMs: options.windowMs
        });
        res.status(429).json(options.message);
    }
});

/**
 * Admin API rate limiter
 * - 60 requests per 15 minutes per IP
 */
const adminRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // Limit each IP to 60 requests per window
    message: {
        success: false,
        error: 'Terlalu banyak permintaan admin. Silakan coba lagi.',
        retryAfter: 15
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.userIp || req.ip,
    handler: (req, res, options) => {
        logger.warn('Admin rate limit exceeded', {
            action: 'admin_rate_limit_exceeded',
            ip: req.userIp,
            path: req.path,
            limit: options.max
        });
        res.status(429).json(options.message);
    }
});

module.exports = {
    apiRateLimiter,
    downloadRateLimiter,
    adminRateLimiter
};
