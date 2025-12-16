const { verifyAccessToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        // Verify token
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        // Add user info to request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

module.exports = authMiddleware;