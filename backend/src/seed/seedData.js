const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Import models
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Traffic = require('../models/Traffic');

const connectDB = require('../config/database');

const seedData = async () => {
    try {
        // Connect to database
        await connectDB();

        console.log('Starting data seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Vehicle.deleteMany({});
        await Traffic.deleteMany({});

        console.log('Cleared existing data');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminUser = await User.create({
            fullName: 'System Administrator',
            email: 'admin@traffic.com',
            password: adminPassword,
            role: 'admin'
        });

        console.log('Created admin user');

        // Create regular users
        const users = [];
        const vehicles = [];

        for (let i = 1; i <= 20; i++) {
            const userPassword = await bcrypt.hash(`user${i}123`, 10);
            const user = await User.create({
                fullName: `User ${i}`,
                email: `user${i}@example.com`,
                password: userPassword,
                role: 'user'
            });

            users.push(user);

            // Create vehicle for each user
            const vehicleTypes = ['car', 'bike', 'bus', 'truck'];
            const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];

            const vehicle = await Vehicle.create({
                user: user._id,
                vehicleNumber: `DL${String(i).padStart(2, '0')}AB${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
                vehicleType: vehicleType
            });

            vehicles.push(vehicle);
        }

        console.log(`Created ${users.length} users and ${vehicles.length} vehicles`);

        // Create traffic zones (for Delhi area)
        const trafficZones = [
            {
                zoneName: 'Connaught Place',
                coordinates: [77.2185, 28.6315],
                congestionLevel: 'high',
                description: 'Central business district, heavy traffic during peak hours',
                vehiclesCount: 85,
                averageSpeed: 15,
                createdBy: adminUser._id
            },
            {
                zoneName: 'Karol Bagh',
                coordinates: [77.1907, 28.6518],
                congestionLevel: 'high',
                description: 'Commercial market area, always busy',
                vehiclesCount: 95,
                averageSpeed: 12,
                createdBy: adminUser._id
            },
            {
                zoneName: 'India Gate',
                coordinates: [77.2295, 28.6129],
                congestionLevel: 'medium',
                description: 'Tourist area, moderate traffic',
                vehiclesCount: 45,
                averageSpeed: 25,
                createdBy: adminUser._id
            },
            {
                zoneName: 'Rajouri Garden',
                coordinates: [77.1231, 28.6482],
                congestionLevel: 'medium',
                description: 'Residential and commercial mix',
                vehiclesCount: 55,
                averageSpeed: 22,
                createdBy: adminUser._id
            },
            {
                zoneName: 'Lodi Garden',
                coordinates: [77.2182, 28.5933],
                congestionLevel: 'low',
                description: 'Park area, light traffic',
                vehiclesCount: 20,
                averageSpeed: 35,
                createdBy: adminUser._id
            },
            {
                zoneName: 'Dwarka Sector 21',
                coordinates: [77.0494, 28.5522],
                congestionLevel: 'low',
                description: 'Residential area, smooth traffic flow',
                vehiclesCount: 15,
                averageSpeed: 45,
                createdBy: adminUser._id
            },
            {
                zoneName: 'ITO Crossing',
                coordinates: [77.2425, 28.6279],
                congestionLevel: 'high',
                description: 'Major intersection, heavy government office traffic',
                vehiclesCount: 110,
                averageSpeed: 8,
                createdBy: adminUser._id
            },
            {
                zoneName: 'AIIMS Crossing',
                coordinates: [77.2065, 28.5678],
                congestionLevel: 'high',
                description: 'Hospital area, constant traffic',
                vehiclesCount: 90,
                averageSpeed: 10,
                createdBy: adminUser._id
            },
            {
                zoneName: 'Nehru Place',
                coordinates: [77.2518, 28.5502],
                congestionLevel: 'medium',
                description: 'IT market, moderate traffic',
                vehiclesCount: 60,
                averageSpeed: 20,
                createdBy: adminUser._id
            },
            {
                zoneName: 'Hauz Khas Village',
                coordinates: [77.2019, 28.5535],
                congestionLevel: 'low',
                description: 'Heritage and nightlife area, light evening traffic',
                vehiclesCount: 25,
                averageSpeed: 30,
                createdBy: adminUser._id
            }
        ];

        const createdZones = await Traffic.insertMany(trafficZones);

        console.log(`Created ${createdZones.length} traffic zones`);

        // Summary
        console.log('\n=== Seeding Completed Successfully ===');
        console.log(`Total Users: ${users.length + 1} (1 admin)`);
        console.log(`Total Vehicles: ${vehicles.length}`);
        console.log(`Total Traffic Zones: ${createdZones.length}`);

        console.log('\nSample Credentials:');
        console.log('Admin: admin@traffic.com / admin123');
        console.log('User 1: user1@example.com / user1123');

        process.exit(0);

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

// Run seed function
seedData();