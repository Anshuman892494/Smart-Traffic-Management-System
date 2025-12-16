const Traffic = require('../models/Traffic');

// Get all traffic zones with pagination
exports.getAllTrafficZones = async (req, res) => {
    try {
        const { page = 1, limit = 500, search = '', congestionLevel = '' } = req.query;

        const query = {};

        // Search functionality
        if (search) {
            query.zoneName = { $regex: search, $options: 'i' };
        }

        // Filter by congestion level
        if (congestionLevel) {
            query.congestionLevel = congestionLevel;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { updatedAt: -1 },
            populate: {
                path: 'createdBy',
                select: 'fullName email'
            }
        };

        const zones = await Traffic.paginate(query, options);

        res.status(200).json({
            success: true,
            data: zones.docs,
            pagination: {
                total: zones.totalDocs,
                page: zones.page,
                pages: zones.totalPages,
                limit: zones.limit,
                hasNext: zones.hasNextPage,
                hasPrev: zones.hasPrevPage
            }
        });
    } catch (error) {
        console.error('Get traffic zones error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch traffic zones.',
            error: error.message
        });
    }
};

// Get traffic zone by ID
exports.getTrafficZoneById = async (req, res) => {
    try {
        const zone = await Traffic.findById(req.params.id)
            .populate('createdBy', 'fullName email');

        if (!zone) {
            return res.status(404).json({
                success: false,
                message: 'Traffic zone not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: zone
        });
    } catch (error) {
        console.error('Get traffic zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch traffic zone.',
            error: error.message
        });
    }
};

// Create new traffic zone (admin only)
exports.createTrafficZone = async (req, res) => {
    try {
        const { zoneName, coordinates, congestionLevel, description, vehiclesCount, averageSpeed } = req.body;

        // Validate coordinates
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
            return res.status(400).json({
                success: false,
                message: 'Coordinates must be an array of [longitude, latitude]'
            });
        }

        const trafficZone = await Traffic.create({
            zoneName,
            location: {
                type: 'Point',
                coordinates: coordinates
            },
            congestionLevel: congestionLevel || 'low',
            description,
            vehiclesCount: vehiclesCount || 0,
            averageSpeed: averageSpeed || 40,
            createdBy: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: 'Traffic zone created successfully',
            data: trafficZone
        });
    } catch (error) {
        console.error('Create traffic zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create traffic zone.',
            error: error.message
        });
    }
};

// Update traffic zone (admin only)
exports.updateTrafficZone = async (req, res) => {
    try {
        const { zoneName, coordinates, congestionLevel, description, vehiclesCount, averageSpeed } = req.body;

        const updateData = {
            zoneName,
            congestionLevel,
            description,
            vehiclesCount,
            averageSpeed
        };

        if (coordinates) {
            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Coordinates must be an array of [longitude, latitude]'
                });
            }
            updateData.location = {
                type: 'Point',
                coordinates
            };
        }

        const trafficZone = await Traffic.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!trafficZone) {
            return res.status(404).json({
                success: false,
                message: 'Traffic zone not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Traffic zone updated successfully',
            data: trafficZone
        });
    } catch (error) {
        console.error('Update traffic zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update traffic zone.',
            error: error.message
        });
    }
};

// Delete traffic zone (admin only)
exports.deleteTrafficZone = async (req, res) => {
    try {
        const trafficZone = await Traffic.findByIdAndDelete(req.params.id);

        if (!trafficZone) {
            return res.status(404).json({
                success: false,
                message: 'Traffic zone not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Traffic zone deleted successfully'
        });
    } catch (error) {
        console.error('Delete traffic zone error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete traffic zone.',
            error: error.message
        });
    }
};

// Get traffic zones within radius
exports.getTrafficNearby = async (req, res) => {
    try {
        const { longitude, latitude, radius = 5000, limit = 20 } = req.query; // radius in meters

        if (!longitude || !latitude) {
            return res.status(400).json({
                success: false,
                message: 'Longitude and latitude are required.'
            });
        }

        const zones = await Traffic.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        })
            .limit(parseInt(limit))
            .sort({ congestionLevel: -1 }); // Show high traffic zones first

        res.status(200).json({
            success: true,
            count: zones.length,
            data: zones
        });
    } catch (error) {
        console.error('Get nearby traffic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby traffic.',
            error: error.message
        });
    }
};

// Simulate traffic update
exports.simulateTrafficUpdate = async (req, res) => {
    try {
        const zones = await Traffic.find();

        // Simulate random traffic updates
        const updates = [];
        for (const zone of zones) {
            const randomChange = Math.random();

            if (randomChange < 0.4) { // 40% chance of change
                const levels = ['low', 'medium', 'high'];
                const randomLevel = levels[Math.floor(Math.random() * levels.length)];

                // Update vehicles count based on congestion level
                let newVehiclesCount;
                let newAverageSpeed;

                switch (randomLevel) {
                    case 'low':
                        newVehiclesCount = Math.floor(Math.random() * 20) + 5;
                        newAverageSpeed = Math.floor(Math.random() * 30) + 40; // 40-70 km/h
                        break;
                    case 'medium':
                        newVehiclesCount = Math.floor(Math.random() * 40) + 25;
                        newAverageSpeed = Math.floor(Math.random() * 20) + 20; // 20-40 km/h
                        break;
                    case 'high':
                        newVehiclesCount = Math.floor(Math.random() * 60) + 50;
                        newAverageSpeed = Math.floor(Math.random() * 15) + 5; // 5-20 km/h
                        break;
                }

                zone.congestionLevel = randomLevel;
                zone.vehiclesCount = newVehiclesCount;
                zone.averageSpeed = newAverageSpeed;

                await zone.save();
                updates.push(zone);
            }
        }

        res.status(200).json({
            success: true,
            message: `Traffic simulation completed. Updated ${updates.length} zones.`,
            data: updates
        });
    } catch (error) {
        console.error('Traffic simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to simulate traffic.',
            error: error.message
        });
    }
};

// Get traffic analytics
exports.getTrafficAnalytics = async (req, res) => {
    try {
        const zones = await Traffic.find();

        if (zones.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalZones: 0,
                    congestionDistribution: { low: 0, medium: 0, high: 0 },
                    totalVehicles: 0,
                    averageSpeed: 0,
                    recentUpdates: []
                }
            });
        }

        // Calculate analytics
        const totalZones = zones.length;
        const lowTraffic = zones.filter(z => z.congestionLevel === 'low').length;
        const mediumTraffic = zones.filter(z => z.congestionLevel === 'medium').length;
        const highTraffic = zones.filter(z => z.congestionLevel === 'high').length;

        const totalVehicles = zones.reduce((sum, zone) => sum + zone.vehiclesCount, 0);
        const avgSpeed = zones.reduce((sum, zone) => sum + zone.averageSpeed, 0) / totalZones;

        // Get zones with highest congestion
        const highestCongestion = zones
            .sort((a, b) => {
                const levelOrder = { high: 3, medium: 2, low: 1 };
                return levelOrder[b.congestionLevel] - levelOrder[a.congestionLevel];
            })
            .slice(0, 5);

        // Get traffic trends (last 24 hours)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const recentActivity = zones.filter(zone =>
            zone.updatedAt > twentyFourHoursAgo
        ).length;

        res.status(200).json({
            success: true,
            data: {
                totalZones,
                congestionDistribution: {
                    low: lowTraffic,
                    medium: mediumTraffic,
                    high: highTraffic
                },
                totalVehicles,
                averageSpeed: avgSpeed.toFixed(2),
                recentUpdates: highestCongestion,
                recentActivity,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics.',
            error: error.message
        });
    }
};

// Bulk create traffic zones (for initial setup)
exports.bulkCreateTrafficZones = async (req, res) => {
    try {
        const { zones } = req.body;

        if (!Array.isArray(zones) || zones.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Zones array is required.'
            });
        }

        // Validate each zone
        const validZones = zones.map(zone => ({
            ...zone,
            location: {
                type: 'Point',
                coordinates: zone.coordinates
            },
            createdBy: req.user.userId
        }));

        const createdZones = await Traffic.insertMany(validZones);

        res.status(201).json({
            success: true,
            message: `${createdZones.length} traffic zones created successfully`,
            data: createdZones
        });
    } catch (error) {
        console.error('Bulk create error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create traffic zones.',
            error: error.message
        });
    }
};

// Search traffic zones
exports.searchTrafficZones = async (req, res) => {
    try {
        const { query } = req.params;

        const zones = await Traffic.find({
            $or: [
                { zoneName: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        })
            .limit(10)
            .sort({ congestionLevel: -1 });

        res.status(200).json({
            success: true,
            count: zones.length,
            data: zones
        });
    } catch (error) {
        console.error('Search traffic zones error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search traffic zones.',
            error: error.message
        });
    }
};