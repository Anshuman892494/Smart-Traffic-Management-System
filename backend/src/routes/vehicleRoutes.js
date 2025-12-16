const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Public routes
router.get('/search/:query', vehicleController.searchVehicles);

// Protected routes (admin only)
router.get('/', authMiddleware, roleMiddleware('admin'), vehicleController.getAllVehicles);
router.get('/stats', authMiddleware, roleMiddleware('admin'), vehicleController.getVehicleStats);
router.get('/user/:userId', authMiddleware, roleMiddleware('admin'), vehicleController.getVehiclesByUserId);
router.get('/:id', authMiddleware, roleMiddleware('admin'), vehicleController.getVehicleById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), vehicleController.updateVehicle);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), vehicleController.deleteVehicle);

module.exports = router;