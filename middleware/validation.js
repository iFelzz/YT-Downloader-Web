/**
 * Request Validation Middleware using Joi
 * Validates all incoming requests
 */

const Joi = require('joi');
const logger = require('../logger');

// YouTube URL validation regex patterns
const youtubeUrlPatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/watch\/[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/playlist\?list=[a-zA-Z0-9_-]+/
];

// Schema untuk validate YouTube URL
function validateYouTubeUrl(url) {
    return youtubeUrlPatterns.some(pattern => pattern.test(url));
}

// Video Info Request Schema
const videoInfoSchema = Joi.object({
    url: Joi.string()
        .uri()
        .required()
        .messages({
            'string.empty': 'URL tidak boleh kosong',
            'string.uri': 'Format URL tidak valid',
            'any.required': 'URL wajib diisi'
        })
        .custom((value, helpers) => {
            if (!validateYouTubeUrl(value)) {
                return helpers.error('string.pattern.base');
            }
            return value;
        }, 'YouTube URL validation')
});

// Download Request Schema
const downloadSchema = Joi.object({
    url: Joi.string()
        .uri()
        .required()
        .messages({
            'string.empty': 'URL tidak boleh kosong',
            'string.uri': 'Format URL tidak valid',
            'any.required': 'URL wajib diisi'
        })
        .custom((value, helpers) => {
            if (!validateYouTubeUrl(value)) {
                return helpers.error('string.pattern.base');
            }
            return value;
        }, 'YouTube URL validation'),
    resolution: Joi.string()
        .allow('')
        .optional()
        .pattern(/^\d+p$|^best$/)
        .messages({
            'string.pattern.base': 'Resolusi tidak valid. Contoh: 720p, 1080p, atau best'
        })
        .default('best'),
    format: Joi.string()
        .valid('mp4', 'webm', 'audio')
        .optional()
        .allow('')
        .default('mp4'),
    clientId: Joi.string().optional()
});

// Batch Download Request Schema
const batchDownloadSchema = Joi.object({
    urls: Joi.array()
        .items(Joi.string().uri().required())
        .min(1)
        .max(10)
        .required()
        .messages({
            'array.min': 'Minimal 1 URL',
            'array.max': 'Maksimal 10 URL',
            'any.required': 'URLs wajib diisi'
        }),
    resolution: Joi.string()
        .allow('')
        .optional()
        .pattern(/^\d+p$|^best$/)
        .optional()
        .default('best'),
    format: Joi.string()
        .valid('mp4', 'webm', 'audio')
        .optional()
        .allow('')
        .default('mp4'),
    clientId: Joi.string().optional()
});

// Validation middleware factory
function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            logger.warn('Validation failed', {
                action: 'validation_failed',
                path: req.path,
                errors: errors,
                ip: req.userIp
            });

            return res.status(400).json({
                success: false,
                error: 'Validasi gagal',
                details: errors
            });
        }

        req.validatedBody = value;
        next();
    };
}

// Helper function untuk extract video ID dari URL (validation helper)
function extractVideoId(url) {
    try {
        const urlObj = new URL(url);
        
        // Handle youtube.com/watch?v=...
        if (urlObj.hostname.includes('youtube.com')) {
            const videoId = urlObj.searchParams.get('v');
            if (videoId) return videoId;
            
            // Handle shorts
            const shortsMatch = urlObj.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
            if (shortsMatch && shortsMatch[1]) return shortsMatch[1];
        }
        
        // Handle youtu.be/...
        if (urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.pathname.substring(1);
            if (videoId) return videoId;
        }
        
        return null;
    } catch {
        return null;
    }
}

module.exports = {
    videoInfoSchema,
    downloadSchema,
    batchDownloadSchema,
    validate,
    validateYouTubeUrl,
    extractVideoId
};
