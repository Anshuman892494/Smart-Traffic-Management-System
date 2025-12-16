const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

// Get all users (admin only) - Updated with pagination
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role = '' } = req.query;

        const query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            select: '-password -resetPasswordToken -resetPasswordExpire'
        };

        const users = await User.paginate(query, options);

        // Get vehicle counts for each user
        const usersWithVehicleCount = await Promise.all(
            users.docs.map(async (user) => {
                const vehicleCount = await Vehicle.countDocuments({ user: user._id });
                return {
                    ...user.toObject(),
                    vehicleCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: usersWithVehicleCount,
            pagination: {
                total: users.totalDocs,
                page: users.page,
                pages: users.totalPages,
                limit: users.limit,
                hasNext: users.hasNextPage,
                hasPrev: users.hasPrevPage
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users.',
            error: error.message
        });
    }
};

// Get user profile - Already exists, no changes needed
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Get user's vehicle
        const vehicle = await Vehicle.findOne({ user: user._id });

        res.status(200).json({
            success: true,
            data: {
                user,
                vehicle
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile.',
            error: error.message
        });
    }
};

// Update user profile - Already exists, no changes needed
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, vehicleNumber, vehicleType } = req.body;

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { fullName },
            { new: true, runValidators: true }
        ).select('-password -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Update vehicle if provided
        let vehicle;
        if (vehicleNumber || vehicleType) {
            vehicle = await Vehicle.findOneAndUpdate(
                { user: user._id },
                {
                    vehicleNumber: vehicleNumber || undefined,
                    vehicleType: vehicleType || undefined
                },
                { new: true, runValidators: true }
            );
        } else {
            vehicle = await Vehicle.findOne({ user: user._id });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user,
                vehicle
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile.',
            error: error.message
        });
    }
};

// Change password - Already exists, no changes needed
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password.',
            error: error.message
        });
    }
};

// Delete user (admin only) - Already exists, no changes needed
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find and delete user
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Delete associated vehicle
        await Vehicle.deleteOne({ user: userId });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user.',
            error: error.message
        });
    }
};

// Get user statistics (admin only)
exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalRegularUsers = await User.countDocuments({ role: 'user' });

        // Users by registration date (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Monthly registration stats
        const monthlyStats = await User.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
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
                totalUsers,
                roleDistribution: {
                    admin: totalAdmins,
                    user: totalRegularUsers
                },
                recentUsers,
                monthlyStats
            }
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics.',
            error: error.message
        });
    }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be either "user" or "admin".'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            data: user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user role.',
            error: error.message
        });
    }
};