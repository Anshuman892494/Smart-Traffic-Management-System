const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const trafficRoutes = require('./routes/trafficRoutes');

// Import validation middleware
const { registerValidation, loginValidation } = require('./middleware/validator');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Apply rate limiting to all requests
app.use(apiLimiter);

// Apply stricter rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// API Routes with validation
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/traffic', trafficRoutes);

// Health check endpoint (no rate limiting)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Smart Traffic Management System API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0',
        uptime: process.uptime()
    });
});

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
    res.status(200).json({
        success: true,
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                forgotPassword: 'POST /api/auth/forgot-password'
            },
            users: {
                getProfile: 'GET /api/users/profile',
                updateProfile: 'PUT /api/users/profile',
                getAllUsers: 'GET /api/users/all (admin only)',
                getUserStats: 'GET /api/users/stats (admin only)'
            },
            vehicles: {
                getAllVehicles: 'GET /api/vehicles (admin only)',
                getVehicleStats: 'GET /api/vehicles/stats (admin only)',
                searchVehicles: 'GET /api/vehicles/search/:query'
            },
            traffic: {
                getAllZones: 'GET /api/traffic',
                getNearby: 'GET /api/traffic/nearby',
                getAnalytics: 'GET /api/traffic/analytics',
                createZone: 'POST /api/traffic (admin only)',
                simulateUpdate: 'POST /api/traffic/simulate (admin only)'
            }
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        requestedUrl: req.originalUrl,
        availableEndpoints: {
            health: 'GET /api/health',
            docs: 'GET /api/docs',
            auth: 'POST /api/auth/*',
            users: 'GET /api/users/*',
            vehicles: 'GET /api/vehicles/*',
            traffic: 'GET /api/traffic/*'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
  🚀 Server running on port ${PORT}
  📍 Environment: ${process.env.NODE_ENV}
  🌐 Frontend URL: ${process.env.FRONTEND_URL}
  📍 Health check: http://localhost:${PORT}/api/health
  📚 API Docs: http://localhost:${PORT}/api/docs
  🔗 MongoDB: ${process.env.MONGODB_URI}
  
  📊 Available Endpoints:
  - POST /api/auth/register     - Register new user
  - POST /api/auth/login        - User login
  - GET  /api/users/profile     - Get user profile
  - GET  /api/traffic           - Get traffic zones
  - GET  /api/traffic/analytics - Get traffic analytics
  `);
});