const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Get all vehicles (admin only)
exports.getAllVehicles = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', vehicleType = '' } = req.query;

        const query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { vehicleNumber: { $regex: search, $options: 'i' } },
                {
                    user: {
                        $in: await User.find({
                            $or: [
                                { fullName: { $regex: search, $options: 'i' } },
                                { email: { $regex: search, $options: 'i' } }
                            ]
                        }).select('_id')
                    }
                }
            ];
        }

        // Filter by vehicle type
        if (vehicleType) {
            query.vehicleType = vehicleType;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { registeredAt: -1 },
            populate: {
                path: 'user',
                select: 'fullName email role'
            }
        };

        const vehicles = await Vehicle.paginate(query, options);

        res.status(200).json({
            success: true,
            data: vehicles.docs,
            pagination: {
                total: vehicles.totalDocs,
                page: vehicles.page,
                pages: vehicles.totalPages,
                limit: vehicles.limit,
                hasNext: vehicles.hasNextPage,
                hasPrev: vehicles.hasPrevPage
            }
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles.',
            error: error.message
        });
    }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id)
            .populate('user', 'fullName email role');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle.',
            error: error.message
        });
    }
};

// Get vehicles by user ID
exports.getVehiclesByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const vehicles = await Vehicle.find({ user: userId })
            .populate('user', 'fullName email');

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        console.error('Get user vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user vehicles.',
            error: error.message
        });
    }
};

// Update vehicle (admin only)
exports.updateVehicle = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType } = req.body;

        // Check if vehicle number already exists (excluding current vehicle)
        if (vehicleNumber) {
            const existingVehicle = await Vehicle.findOne({
                vehicleNumber,
                _id: { $ne: req.params.id }
            });

            if (existingVehicle) {
                return res.status(400).json({
                    success: false,
                    message: 'Vehicle number already exists.'
                });
            }
        }

        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { vehicleNumber, vehicleType },
            { new: true, runValidators: true }
        ).populate('user', 'fullName email');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vehicle.',
            error: error.message
        });
    }
};

// Delete vehicle (admin only)
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete vehicle.',
            error: error.message
        });
    }
};

// Get vehicle statistics
exports.getVehicleStats = async (req, res) => {
    try {
        const totalVehicles = await Vehicle.countDocuments();

        // Count by vehicle type
        const vehicleTypeStats = await Vehicle.aggregate([
            {
                $group: {
                    _id: '$vehicleType',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Recent registrations
        const recentVehicles = await Vehicle.find()
            .sort({ registeredAt: -1 })
            .limit(5)
            .populate('user', 'fullName email');

        // Monthly registrations
        const monthlyStats = await Vehicle.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$registeredAt' },
                        month: { $month: '$registeredAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            },
            {
                $limit: 6
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalVehicles,
                vehicleTypeStats,
                recentVehicles,
                monthlyStats
            }
        });
    } catch (error) {
        console.error('Get vehicle stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle statistics.',
            error: error.message
        });
    }
};

// Search vehicles
exports.searchVehicles = async (req, res) => {
    try {
        const { query } = req.params;

        const vehicles = await Vehicle.find({
            $or: [
                { vehicleNumber: { $regex: query, $options: 'i' } }
            ]
        })
            .populate('user', 'fullName email')
            .limit(10);

        res.status(200).json({
            success: true,
            count: vehicles.length,
            data: vehicles
        });
    } catch (error) {
        console.error('Search vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search vehicles.',
            error: error.message
        });
    }
};