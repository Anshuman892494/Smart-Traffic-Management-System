const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Protected routes for all authenticated users
router.get('/profile', authMiddleware, userController.getUserProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);

// Admin only routes
router.get('/all', authMiddleware, roleMiddleware('admin'), userController.getAllUsers);
router.get('/stats', authMiddleware, roleMiddleware('admin'), userController.getUserStats);
router.put('/:id/role', authMiddleware, roleMiddleware('admin'), userController.updateUserRole);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), userController.deleteUser);

module.exports = router;