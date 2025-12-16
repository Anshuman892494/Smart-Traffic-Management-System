const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const trafficSchema = new mongoose.Schema({
    zoneName: {
        type: String,
        required: [true, 'Zone name is required'],
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    congestionLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    description: {
        type: String,
        trim: true
    },
    colorCode: {
        type: String,
        default: 'green'
    },
    vehiclesCount: {
        type: Number,
        default: 0
    },
    averageSpeed: {
        type: Number, // in km/h
        default: 40
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Create geospatial index for location queries
trafficSchema.index({ location: '2dsphere' });

trafficSchema.pre('save', function (next) {
    // Set color code based on congestion level
    const colorMap = {
        low: 'green',
        medium: 'yellow',
        high: 'red'
    };
    this.colorCode = colorMap[this.congestionLevel] || 'green';
    this.updatedAt = Date.now();
    next();
});

// Add pagination plugin
trafficSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Traffic', trafficSchema);