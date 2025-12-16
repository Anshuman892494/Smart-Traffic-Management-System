const { body, param, query, validationResult } = require('express-validator');

const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        // Format errors
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
        }));

        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    };
};

// User validation rules
const registerValidation = validate([
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('vehicleNumber')
        .trim()
        .notEmpty().withMessage('Vehicle number is required')
        .matches(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/).withMessage('Invalid vehicle number format'),

    body('vehicleType')
        .isIn(['car', 'bike', 'bus', 'truck']).withMessage('Invalid vehicle type')
]);

const loginValidation = validate([
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email'),

    body('password')
        .notEmpty().withMessage('Password is required')
]);

// Traffic zone validation rules
const trafficZoneValidation = validate([
    body('zoneName')
        .trim()
        .notEmpty().withMessage('Zone name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Zone name must be between 2 and 100 characters'),

    body('coordinates')
        .isArray().withMessage('Coordinates must be an array')
        .custom((value) => {
            if (value.length !== 2) {
                throw new Error('Coordinates must be [longitude, latitude]');
            }
            if (typeof value[0] !== 'number' || typeof value[1] !== 'number') {
                throw new Error('Coordinates must be numbers');
            }
            // Validate longitude and latitude ranges
            if (value[0] < -180 || value[0] > 180) {
                throw new Error('Longitude must be between -180 and 180');
            }
            if (value[1] < -90 || value[1] > 90) {
                throw new Error('Latitude must be between -90 and 90');
            }
            return true;
        }),

    body('congestionLevel')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Congestion level must be low, medium, or high'),

    body('vehiclesCount')
        .optional()
        .isInt({ min: 0 }).withMessage('Vehicles count must be a positive number'),

    body('averageSpeed')
        .optional()
        .isFloat({ min: 0, max: 200 }).withMessage('Average speed must be between 0 and 200 km/h')
]);

// Query validation
const paginationValidation = validate([
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
]);

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    trafficZoneValidation,
    paginationValidation
};