const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

// Register new user
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, vehicleNumber, vehicleType } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email.'
            });
        }

        // Check if vehicle number exists
        const existingVehicle = await Vehicle.findOne({ vehicleNumber });
        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle number already registered.'
            });
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            password,
            role: 'user' // Default role
        });

        // Create vehicle
        const vehicle = await Vehicle.create({
            user: user._id,
            vehicleNumber,
            vehicleType
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id, user.role);

        // Remove password from response
        user.password = undefined;

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user,
                vehicle,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Get vehicle details
        const vehicle = await Vehicle.findOne({ user: user._id });

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id, user.role);

        // Remove password from response
        user.password = undefined;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                vehicle,
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: error.message
        });
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set token and expiry (1 hour)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email
        const emailSent = await sendPasswordResetEmail(email, resetToken);

        if (emailSent) {
            res.status(200).json({
                success: true,
                message: 'Password reset email sent successfully.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again.'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request.',
            error: error.message
        });
    }
};

// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required.'
            });
        }

        // Verify refresh token (you'll need to implement this)
        // Generate new access token
        // Return new tokens

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token.',
            error: error.message
        });
    }
};