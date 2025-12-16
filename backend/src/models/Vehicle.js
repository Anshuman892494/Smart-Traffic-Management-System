const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); // ADD THIS LINE

const vehicleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleNumber: {
        type: String,
        required: [true, 'Vehicle number is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    vehicleType: {
        type: String,
        enum: ['car', 'bike', 'bus', 'truck'],
        required: [true, 'Vehicle type is required']
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

vehicleSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});
// Add pagination plugin
vehicleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Vehicle', vehicleSchema);