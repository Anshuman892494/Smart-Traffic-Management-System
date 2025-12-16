const express = require('express');
const router = express.Router();
const trafficController = require('../controllers/trafficController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Public routes (for map visualization)
router.get('/', trafficController.getAllTrafficZones);
router.get('/nearby', trafficController.getTrafficNearby);
router.get('/analytics', trafficController.getTrafficAnalytics);
router.get('/search/:query', trafficController.searchTrafficZones);
router.get('/:id', trafficController.getTrafficZoneById);

// Admin only routes
router.post('/', authMiddleware, roleMiddleware('admin'), trafficController.createTrafficZone);
router.post('/bulk', authMiddleware, roleMiddleware('admin'), trafficController.bulkCreateTrafficZones);
router.put('/:id', authMiddleware, roleMiddleware('admin'), trafficController.updateTrafficZone);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), trafficController.deleteTrafficZone);
router.post('/simulate', authMiddleware, roleMiddleware('admin'), trafficController.simulateTrafficUpdate);

module.exports = router;