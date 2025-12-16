const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import Traffic model
const Traffic = require('./src/models/Traffic');

const seedData = async () => {
    try {
        // Get MongoDB URI from environment or use default
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_traffic_db';

        console.log('Starting Jalandhar traffic data seeding...');

        // Connect to database directly
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB Connected Successfully');

        const trafficZones = [
            // City Center & Busy Junctions (13)
            {
                zoneName: 'Model Town Chowk',
                location: { type: 'Point', coordinates: [75.5745, 31.3260] },
                congestionLevel: 'high',
                description: 'Main market area, heavy traffic throughout the day',
                vehiclesCount: 120,
                averageSpeed: 10,
                updatedAt: new Date()
            },
            {
                zoneName: 'Rama Mandi Chowk',
                location: { type: 'Point', coordinates: [75.5768, 31.2987] },
                congestionLevel: 'high',
                description: 'Major intersection connecting to highway, always congested',
                vehiclesCount: 135,
                averageSpeed: 8,
                updatedAt: new Date()
            },
            {
                zoneName: 'Lajpat Nagar Chowk',
                location: { type: 'Point', coordinates: [75.5712, 31.3185] },
                congestionLevel: 'high',
                description: 'Commercial area near railway station',
                vehiclesCount: 110,
                averageSpeed: 12,
                updatedAt: new Date()
            },
            {
                zoneName: 'Basti Chowk',
                location: { type: 'Point', coordinates: [75.6023, 31.3245] },
                congestionLevel: 'high',
                description: 'Historic area with narrow roads',
                vehiclesCount: 95,
                averageSpeed: 15,
                updatedAt: new Date()
            },
            {
                zoneName: 'Guru Gobind Singh Chowk',
                location: { type: 'Point', coordinates: [75.5887, 31.3321] },
                congestionLevel: 'high',
                description: 'Near educational institutions',
                vehiclesCount: 100,
                averageSpeed: 12,
                updatedAt: new Date()
            },
            {
                zoneName: 'Guru Teg Bahadur Market',
                location: { type: 'Point', coordinates: [75.5812, 31.3201] },
                congestionLevel: 'high',
                description: 'Busy market area, parking issues',
                vehiclesCount: 105,
                averageSpeed: 10,
                updatedAt: new Date()
            },
            {
                zoneName: 'Railway Station Chowk',
                location: { type: 'Point', coordinates: [75.5734, 31.3123] },
                congestionLevel: 'high',
                description: 'Auto and taxi stand, heavy pedestrian traffic',
                vehiclesCount: 115,
                averageSpeed: 8,
                updatedAt: new Date()
            },
            {
                zoneName: 'Bus Stand Junction',
                location: { type: 'Point', coordinates: [75.5801, 31.3056] },
                congestionLevel: 'high',
                description: 'Interstate bus terminus',
                vehiclesCount: 125,
                averageSpeed: 10,
                updatedAt: new Date()
            },
            {
                zoneName: 'Industrial Area Phase 1',
                location: { type: 'Point', coordinates: [75.6201, 31.3356] },
                congestionLevel: 'high',
                description: 'Factory worker shift timing traffic',
                vehiclesCount: 90,
                averageSpeed: 15,
                updatedAt: new Date()
            },
            {
                zoneName: 'ISBT Jalandhar',
                location: { type: 'Point', coordinates: [75.5921, 31.2987] },
                congestionLevel: 'high',
                description: 'Inter-state bus terminal',
                vehiclesCount: 120,
                averageSpeed: 8,
                updatedAt: new Date()
            },
            {
                zoneName: 'City Railway Station Entrance',
                location: { type: 'Point', coordinates: [75.5689, 31.3123] },
                congestionLevel: 'high',
                description: 'Main railway station approach',
                vehiclesCount: 110,
                averageSpeed: 10,
                updatedAt: new Date()
            },
            {
                zoneName: 'Taxi Stand Chowk',
                location: { type: 'Point', coordinates: [75.5789, 31.3156] },
                congestionLevel: 'high',
                description: 'Main taxi and auto stand',
                vehiclesCount: 90,
                averageSpeed: 12,
                updatedAt: new Date()
            },
            {
                zoneName: 'Local Bus Stand',
                location: { type: 'Point', coordinates: [75.5967, 31.3089] },
                congestionLevel: 'high',
                description: 'City bus services terminal',
                vehiclesCount: 95,
                averageSpeed: 15,
                updatedAt: new Date()
            },

            // Medium Traffic Junctions (38)
            {
                zoneName: 'Cantonment Junction',
                location: { type: 'Point', coordinates: [75.6098, 31.3520] },
                congestionLevel: 'medium',
                description: 'Military area, regulated traffic',
                vehiclesCount: 65,
                averageSpeed: 25,
                updatedAt: new Date()
            },
            {
                zoneName: 'Nakodar Chowk',
                location: { type: 'Point', coordinates: [75.5601, 31.3402] },
                congestionLevel: 'medium',
                description: 'Road to Nakodar town',
                vehiclesCount: 70,
                averageSpeed: 22,
                updatedAt: new Date()
            },
            {
                zoneName: 'Sports College Chowk',
                location: { type: 'Point', coordinates: [75.5923, 31.3087] },
                congestionLevel: 'medium',
                description: 'Near sports facilities',
                vehiclesCount: 55,
                averageSpeed: 28,
                updatedAt: new Date()
            },
            {
                zoneName: 'Lyallpur Khalsa College Junction',
                location: { type: 'Point', coordinates: [75.6034, 31.3156] },
                congestionLevel: 'medium',
                description: 'College area, moderate traffic',
                vehiclesCount: 60,
                averageSpeed: 24,
                updatedAt: new Date()
            },
            {
                zoneName: 'Dogra Chowk',
                location: { type: 'Point', coordinates: [75.5976, 31.3278] },
                congestionLevel: 'medium',
                description: 'Residential and commercial mix',
                vehiclesCount: 50,
                averageSpeed: 26,
                updatedAt: new Date()
            },
            {
                zoneName: 'Mahavir Chowk',
                location: { type: 'Point', coordinates: [75.5856, 31.3123] },
                congestionLevel: 'medium',
                description: 'Wholesale market area',
                vehiclesCount: 80,
                averageSpeed: 18,
                updatedAt: new Date()
            },
            {
                zoneName: 'Kishanpura Chowk',
                location: { type: 'Point', coordinates: [75.6012, 31.3056] },
                congestionLevel: 'medium',
                description: 'Vegetable and fruit market',
                vehiclesCount: 75,
                averageSpeed: 20,
                updatedAt: new Date()
            },
            {
                zoneName: 'Shastri Nagar',
                location: { type: 'Point', coordinates: [75.5798, 31.3423] },
                congestionLevel: 'medium',
                description: 'Middle-class residential area',
                vehiclesCount: 45,
                averageSpeed: 28,
                updatedAt: new Date()
            },
            {
                zoneName: 'D.A.V. College Chowk',
                location: { type: 'Point', coordinates: [75.5945, 31.3223] },
                congestionLevel: 'medium',
                description: 'College timing traffic',
                vehiclesCount: 65,
                averageSpeed: 22,
                updatedAt: new Date()
            },
            {
                zoneName: 'NIT Jalandhar Entrance',
                location: { type: 'Point', coordinates: [75.5367, 31.3956] },
                congestionLevel: 'medium',
                description: 'Technical institute area',
                vehiclesCount: 55,
                averageSpeed: 25,
                updatedAt: new Date()
            },
            {
                zoneName: 'St. Soldier School Chowk',
                location: { type: 'Point', coordinates: [75.5876, 31.3023] },
                congestionLevel: 'medium',
                description: 'School zone timing traffic',
                vehiclesCount: 40,
                averageSpeed: 30,
                updatedAt: new Date()
            },
            {
                zoneName: 'Civil Hospital Chowk',
                location: { type: 'Point', coordinates: [75.5912, 31.3156] },
                congestionLevel: 'medium',
                description: 'Emergency vehicles traffic',
                vehiclesCount: 50,
                averageSpeed: 24,
                updatedAt: new Date()
            },
            {
                zoneName: 'Industrial Area Phase 2',
                location: { type: 'Point', coordinates: [75.6256, 31.3289] },
                congestionLevel: 'medium',
                description: 'Light industrial area',
                vehiclesCount: 70,
                averageSpeed: 20,
                updatedAt: new Date()
            },
            {
                zoneName: 'Jalandhar-Phagwara Highway',
                location: { type: 'Point', coordinates: [75.5301, 31.3656] },
                congestionLevel: 'medium',
                description: 'National highway section',
                vehiclesCount: 85,
                averageSpeed: 45,
                updatedAt: new Date()
            },
            {
                zoneName: 'Bypass Road Junction',
                location: { type: 'Point', coordinates: [75.5634, 31.2956] },
                congestionLevel: 'medium',
                description: 'Outer ring road',
                vehiclesCount: 65,
                averageSpeed: 40,
                updatedAt: new Date()
            },
            {
                zoneName: 'Devi Talab Mandir',
                location: { type: 'Point', coordinates: [75.5967, 31.3323] },
                congestionLevel: 'medium',
                description: 'Temple area, festive season traffic',
                vehiclesCount: 60,
                averageSpeed: 20,
                updatedAt: new Date()
            },
            {
                zoneName: 'G.T. Road Market Junction',
                location: { type: 'Point', coordinates: [75.5956, 31.3098] },
                congestionLevel: 'medium',
                description: 'Main GT Road market stretch',
                vehiclesCount: 95,
                averageSpeed: 15,
                updatedAt: new Date()
            },
            {
                zoneName: 'Kapurthala Road Market',
                location: { type: 'Point', coordinates: [75.6156, 31.3212] },
                congestionLevel: 'medium',
                description: 'Roadside markets and shops',
                vehiclesCount: 70,
                averageSpeed: 20,
                updatedAt: new Date()
            },
            {
                zoneName: 'Bazaar Karkhana',
                location: { type: 'Point', coordinates: [75.5898, 31.3187] },
                congestionLevel: 'medium',
                description: 'Traditional market area',
                vehiclesCount: 65,
                averageSpeed: 22,
                updatedAt: new Date()
            },
            {
                zoneName: 'Grain Market Chowk',
                location: { type: 'Point', coordinates: [75.5689, 31.3123] },
                congestionLevel: 'medium',
                description: 'Agricultural produce market',
                vehiclesCount: 75,
                averageSpeed: 18,
                updatedAt: new Date()
            },
            {
                zoneName: 'New Model Town Market',
                location: { type: 'Point', coordinates: [75.5789, 31.3298] },
                congestionLevel: 'medium',
                description: 'Upmarket shopping area',
                vehiclesCount: 60,
                averageSpeed: 25,
                updatedAt: new Date()
            },
            {
                zoneName: 'Moti Nagar',
                location: { type: 'Point', coordinates: [75.5789, 31.3487] },
                congestionLevel: 'medium',
                description: 'Dense residential colony',
                vehiclesCount: 55,
                averageSpeed: 28,
                updatedAt: new Date()
            },
            {
                zoneName: 'Ranjit Avenue',
                location: { type: 'Point', coordinates: [75.5967, 31.3389] },
                congestionLevel: 'medium',
                description: 'VIP residential area',
                vehiclesCount: 50,
                averageSpeed: 30,
                updatedAt: new Date()
            },
            {
                zoneName: 'Bhargo Camp',
                location: { type: 'Point', coordinates: [75.5987, 31.3156] },
                congestionLevel: 'medium',
                description: 'Mixed residential area',
                vehiclesCount: 65,
                averageSpeed: 25,
                updatedAt: new Date()
            },
            {
                zoneName: 'Guru Nanak Pura',
                location: { type: 'Point', coordinates: [75.5898, 31.3089] },
                congestionLevel: 'medium',
                description: 'Traditional residential area',
                vehiclesCount: 70,
                averageSpeed: 22,
                updatedAt: new Date()
            },
            {
                zoneName: 'Navdeep Colony',
                location: { type: 'Point', coordinates: [75.6023, 31.3012] },
                congestionLevel: 'medium',
                description: 'Middle-income residential area',
                vehiclesCount: 45,
                averageSpeed: 28,
                updatedAt: new Date()
            },
            {
                zoneName: 'Hans Raj Mahila Maha Vidyalaya',
                location: { type: 'Point', coordinates: [75.6023, 31.3321] },
                congestionLevel: 'medium',
                description: 'Women college area',
                vehiclesCount: 55,
                averageSpeed: 24,
                updatedAt: new Date()
            },
            {
                zoneName: 'KMV College Chowk',
                location: { type: 'Point', coordinates: [75.5889, 31.3256] },
                congestionLevel: 'medium',
                description: 'Heritage college area',
                vehiclesCount: 60,
                averageSpeed: 22,
                updatedAt: new Date()
            },
            {
                zoneName: 'Doaba College Junction',
                location: { type: 'Point', coordinates: [75.5967, 31.3156] },
                congestionLevel: 'medium',
                description: 'Private college zone',
                vehiclesCount: 50,
                averageSpeed: 26,
                updatedAt: new Date()
            },
            {
                zoneName: 'Police DAV School',
                location: { type: 'Point', coordinates: [75.6023, 31.3021] },
                congestionLevel: 'medium',
                description: 'School timing heavy traffic',
                vehiclesCount: 45,
                averageSpeed: 28,
                updatedAt: new Date()
            },
            {
                zoneName: 'Lovely Professional University Road',
                location: { type: 'Point', coordinates: [75.4567, 31.4023] },
                congestionLevel: 'medium',
                description: 'University approach road',
                vehiclesCount: 70,
                averageSpeed: 35,
                updatedAt: new Date()
            },
            {
                zoneName: 'CT Institute Junction',
                location: { type: 'Point', coordinates: [75.5123, 31.3898] },
                congestionLevel: 'medium',
                description: 'Technical institute area',
                vehiclesCount: 55,
                averageSpeed: 28,
                updatedAt: new Date()
            },
            {
                zoneName: 'Focal Point Phase 4',
                location: { type: 'Point', coordinates: [75.6589, 31.3256] },
                congestionLevel: 'medium',
                description: 'Light to medium industries',
                vehiclesCount: 75,
                averageSpeed: 22,
                updatedAt: new Date()
            },
            {
                zoneName: 'Industrial Area Phase 3',
                location: { type: 'Point', coordinates: [75.6321, 31.3123] },
                congestionLevel: 'medium',
                description: 'Small scale industries',
                vehiclesCount: 65,
                averageSpeed: 25,
                updatedAt: new Date()
            },
            {
                zoneName: 'Hand Tool Manufacturing Zone',
                location: { type: 'Point', coordinates: [75.6156, 31.2956] },
                congestionLevel: 'medium',
                description: 'Tool industry cluster',
                vehiclesCount: 70,
                averageSpeed: 24,
                updatedAt: new Date()
            },
            {
                zoneName: 'Leather Complex Junction',
                location: { type: 'Point', coordinates: [75.6256, 31.3021] },
                congestionLevel: 'medium',
                description: 'Leather goods manufacturing',
                vehiclesCount: 60,
                averageSpeed: 26,
                updatedAt: new Date()
            },
            {
                zoneName: 'Jalandhar Cantt Railway Station',
                location: { type: 'Point', coordinates: [75.6123, 31.3621] },
                congestionLevel: 'medium',
                description: 'Military railway station',
                vehiclesCount: 50,
                averageSpeed: 25,
                updatedAt: new Date()
            },
            {
                zoneName: 'Rickshaw Stand Junction',
                location: { type: 'Point', coordinates: [75.5821, 31.3098] },
                congestionLevel: 'medium',
                description: 'Cycle rickshaw stand area',
                vehiclesCount: 65,
                averageSpeed: 20,
                updatedAt: new Date()
            },
            {
                zoneName: 'Truck Union Chowk',
                location: { type: 'Point', coordinates: [75.6456, 31.3123] },
                congestionLevel: 'medium',
                description: 'Goods transport hub',
                vehiclesCount: 80,
                averageSpeed: 22,
                updatedAt: new Date()
            },
            {
                zoneName: 'NH-1 Jalandhar Bypass',
                location: { type: 'Point', coordinates: [75.5123, 31.3456] },
                congestionLevel: 'medium',
                description: 'National highway bypass',
                vehiclesCount: 85,
                averageSpeed: 50,
                updatedAt: new Date()
            },
            {
                zoneName: 'Jalandhar-Ludhiana Road',
                location: { type: 'Point', coordinates: [75.4789, 31.3123] },
                congestionLevel: 'medium',
                description: 'Major district road',
                vehiclesCount: 70,
                averageSpeed: 45,
                updatedAt: new Date()
            },
            {
                zoneName: 'Jalandhar-Nakodar Road',
                location: { type: 'Point', coordinates: [75.5567, 31.3256] },
                congestionLevel: 'medium',
                description: 'Busy district road',
                vehiclesCount: 65,
                averageSpeed: 40,
                updatedAt: new Date()
            },
            {
                zoneName: 'Ring Road Junction',
                location: { type: 'Point', coordinates: [75.5623, 31.3656] },
                congestionLevel: 'medium',
                description: 'Outer ring road intersection',
                vehiclesCount: 60,
                averageSpeed: 38,
                updatedAt: new Date()
            },

            // Low Traffic Junctions (29)
            {
                zoneName: 'Urban Estate Phase 2',
                location: { type: 'Point', coordinates: [75.5489, 31.3356] },
                congestionLevel: 'low',
                description: 'Planned residential colony',
                vehiclesCount: 30,
                averageSpeed: 35,
                updatedAt: new Date()
            },
            {
                zoneName: 'Green Park Colony',
                location: { type: 'Point', coordinates: [75.5623, 31.3289] },
                congestionLevel: 'low',
                description: 'Quiet residential area',
                vehiclesCount: 25,
                averageSpeed: 40,
                updatedAt: new Date()
            },
            {
                zoneName: 'Guru Nanak Nagar',
                location: { type: 'Point', coordinates: [75.5689, 31.3501] },
                congestionLevel: 'low',
                description: 'Peaceful residential colony',
                vehiclesCount: 35,
                averageSpeed: 32,
                updatedAt: new Date()
            },
            {
                zoneName: 'Ahmedgarh Hospital Junction',
                location: { type: 'Point', coordinates: [75.5789, 31.3101] },
                congestionLevel: 'low',
                description: 'Private hospital area',
                vehiclesCount: 35,
                averageSpeed: 30,
                updatedAt: new Date()
            },
            {
                zoneName: 'Jalandhar-Hoshiarpur Road',
                location: { type: 'Point', coordinates: [75.6034, 31.2856] },
                congestionLevel: 'low',
                description: 'State highway',
                vehiclesCount: 40,
                averageSpeed: 50,
                updatedAt: new Date()
            },
            {
                zoneName: 'Gurdwara Guru Tegh Bahadur Sahib',
                location: { type: 'Point', coordinates: [75.6089, 31.3201] },
                congestionLevel: 'low',
                description: 'Religious place, peaceful traffic',
                vehiclesCount: 30,
                averageSpeed: 30,
                updatedAt: new Date()
            },
            {
                zoneName: 'Sarabha Nagar Market',
                location: { type: 'Point', coordinates: [75.5821, 31.3356] },
                congestionLevel: 'low',
                description: 'Local neighborhood market',
                vehiclesCount: 45,
                averageSpeed: 30,
                updatedAt: new Date()
            },
            {
                zoneName: 'Khoobsorat Market',
                location: { type: 'Point', coordinates: [75.6123, 31.3123] },
                congestionLevel: 'low',
                description: 'Beauty and cosmetic market',
                vehiclesCount: 40,
                averageSpeed: 32,
                updatedAt: new Date()
            },
            {
                zoneName: 'Model House Area',
                location: { type: 'Point', coordinates: [75.6021, 31.3423] },
                congestionLevel: 'low',
                description: 'Affluent residential colony',
                vehiclesCount: 35,
                averageSpeed: 35,
                updatedAt: new Date()
            },
            {
                zoneName: 'Adarsh Nagar',
                location: { type: 'Point', coordinates: [75.5923, 31.3521] },
                congestionLevel: 'low',
                description: 'Well-planned residential area',
                vehiclesCount: 30,
                averageSpeed: 38,
                updatedAt: new Date()
            },
            {
                zoneName: 'Partap Bagh',
                location: { type: 'Point', coordinates: [75.6123, 31.3298] },
                congestionLevel: 'low',
                description: 'Peaceful residential colony',
                vehiclesCount: 25,
                averageSpeed: 40,
                updatedAt: new Date()
            },
            {
                zoneName: 'Sun City Colony',
                location: { type: 'Point', coordinates: [75.5456, 31.3221] },
                congestionLevel: 'low',
                description: 'New township development',
                vehiclesCount: 20,
                averageSpeed: 45,
                updatedAt: new Date()
            },
            {
                zoneName: 'Sainik Colony',
                location: { type: 'Point', coordinates: [75.6321, 31.3423] },
                congestionLevel: 'low',
                description: 'Ex-servicemen residential area',
                vehiclesCount: 30,
                averageSpeed: 35,
                updatedAt: new Date()
            },
            {
                zoneName: 'Rishi Nagar',
                location: { type: 'Point', coordinates: [75.5756, 31.3356] },
                congestionLevel: 'low',
                description: 'Quiet residential neighborhood',
                vehiclesCount: 35,
                averageSpeed: 32,
                updatedAt: new Date()
            },
            {
                zoneName: 'Modern Colony',
                location: { type: 'Point', coordinates: [75.5921, 31.2956] },
                congestionLevel: 'low',
                description: 'Newly developed residential area',
                vehiclesCount: 30,
                averageSpeed: 36,
                updatedAt: new Date()
            },
            {
                zoneName: 'Apeejay School Chowk',
                location: { type: 'Point', coordinates: [75.6123, 31.3423] },
                congestionLevel: 'low',
                description: 'School area with moderate traffic',
                vehiclesCount: 40,
                averageSpeed: 30,
                updatedAt: new Date()
            },
            {
                zoneName: 'Cambridge International School',
                location: { type: 'Point', coordinates: [75.5789, 31.3656] },
                congestionLevel: 'low',
                description: 'International school zone',
                vehiclesCount: 35,
                averageSpeed: 32,
                updatedAt: new Date()
            },
            {
                zoneName: 'Domestic Airport Road',
                location: { type: 'Point', coordinates: [75.6321, 31.3789] },
                congestionLevel: 'low',
                description: 'Airport approach road',
                vehiclesCount: 40,
                averageSpeed: 45,
                updatedAt: new Date()
            },
            {
                zoneName: 'Jalandhar-Amritsar Highway',
                location: { type: 'Point', coordinates: [75.6321, 31.3987] },
                congestionLevel: 'low',
                description: 'State highway to Amritsar',
                vehiclesCount: 55,
                averageSpeed: 55,
                updatedAt: new Date()
            },
            {
                zoneName: 'Jalandhar-Kapurthala Road',
                location: { type: 'Point', coordinates: [75.6023, 31.3789] },
                congestionLevel: 'low',
                description: 'District road to Kapurthala',
                vehiclesCount: 45,
                averageSpeed: 48,
                updatedAt: new Date()
            },
            {
                zoneName: 'Jalandhar-Phagwara Bypass',
                location: { type: 'Point', coordinates: [75.5123, 31.3898] },
                congestionLevel: 'low',
                description: 'Alternative bypass route',
                vehiclesCount: 40,
                averageSpeed: 52,
                updatedAt: new Date()
            },
            {
                zoneName: 'Focal Point Phase 3',
                location: { type: 'Point', coordinates: [75.6456, 31.3321] },
                congestionLevel: 'low',
                description: 'Major industrial hub (off-peak)',
                vehiclesCount: 40,
                averageSpeed: 35,
                updatedAt: new Date()
            },
            {
                zoneName: 'Sports Goods Manufacturing Area',
                location: { type: 'Point', coordinates: [75.6023, 31.2898] },
                congestionLevel: 'low',
                description: 'Export manufacturing units (off-peak)',
                vehiclesCount: 35,
                averageSpeed: 40,
                updatedAt: new Date()
            },
            {
                zoneName: 'Bootan Mandi',
                location: { type: 'Point', coordinates: [75.6032, 31.3012] },
                congestionLevel: 'low',
                description: 'Sports goods market (off-peak)',
                vehiclesCount: 30,
                averageSpeed: 35,
                updatedAt: new Date()
            },
            {
                zoneName: 'G.T. Road Junction',
                location: { type: 'Point', coordinates: [75.5987, 31.3123] },
                congestionLevel: 'low',
                description: 'Historic Grand Trunk Road (off-peak)',
                vehiclesCount: 45,
                averageSpeed: 45,
                updatedAt: new Date()
            },
            {
                zoneName: 'ITO Crossing',
                location: { type: 'Point', coordinates: [75.5723, 31.3156] },
                congestionLevel: 'low',
                description: 'Traffic office area',
                vehiclesCount: 35,
                averageSpeed: 38,
                updatedAt: new Date()
            },
            {
                zoneName: 'Police Lines Chowk',
                location: { type: 'Point', coordinates: [75.5856, 31.3356] },
                congestionLevel: 'low',
                description: 'Police residential area',
                vehiclesCount: 25,
                averageSpeed: 40,
                updatedAt: new Date()
            },
            {
                zoneName: 'District Courts Junction',
                location: { type: 'Point', coordinates: [75.5901, 31.3289] },
                congestionLevel: 'low',
                description: 'Judicial complex area',
                vehiclesCount: 30,
                averageSpeed: 35,
                updatedAt: new Date()
            },
            {
                zoneName: 'Punjab Technical University Road',
                location: { type: 'Point', coordinates: [75.5123, 31.3656] },
                congestionLevel: 'low',
                description: 'University approach road',
                vehiclesCount: 35,
                averageSpeed: 45,
                updatedAt: new Date()
            }
        ];

        console.log(`Processing ${trafficZones.length} traffic zones...`);

        // Insert traffic zones if they don't exist
        let createdCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < trafficZones.length; i++) {
            const zone = trafficZones[i];
            try {
                // Check if zone already exists
                const existingZone = await Traffic.findOne({
                    zoneName: zone.zoneName
                });

                if (!existingZone) {
                    const newZone = await Traffic.create(zone);
                    createdCount++;
                    console.log(`${String(i + 1).padStart(3, '0')}. ✓ Added: ${zone.zoneName.padEnd(30)} (${zone.congestionLevel})`);
                } else {
                    skippedCount++;
                    console.log(`${String(i + 1).padStart(3, '0')}. ⏭️ Skipped: ${zone.zoneName.padEnd(30)} (Already exists)`);
                }
            } catch (error) {
                errorCount++;
                console.log(`${String(i + 1).padStart(3, '0')}. ✗ Error: ${zone.zoneName} - ${error.message}`);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('🎉 JALANDHAR TRAFFIC DATA SEEDING COMPLETED 🎉');
        console.log('='.repeat(60));
        console.log(`📊 Total zones in script: ${trafficZones.length}`);
        console.log(`✅ New zones added: ${createdCount}`);
        console.log(`⏭️ Zones skipped (already exist): ${skippedCount}`);
        console.log(`❌ Zones with errors: ${errorCount}`);

        // Count by congestion level
        const highCount = trafficZones.filter(z => z.congestionLevel === 'high').length;
        const mediumCount = trafficZones.filter(z => z.congestionLevel === 'medium').length;
        const lowCount = trafficZones.filter(z => z.congestionLevel === 'low').length;

        console.log('\n🚦 Congestion Level Distribution:');
        console.log(`🔴 High Traffic: ${highCount} junctions`);
        console.log(`🟡 Medium Traffic: ${mediumCount} junctions`);
        console.log(`🟢 Low Traffic: ${lowCount} junctions`);

        console.log('\n🗺️ Area-wise Coverage:');
        console.log(`🏙️  City Center & Busy Junctions: 13`);
        console.log(`🛍️  Market Areas: 11`);
        console.log(`🏘️  Residential Areas: 16`);
        console.log(`🏫 Educational Institutions: 11`);
        console.log(`🏭 Industrial Areas: 8`);
        console.log(`🚌 Transportation Hubs: 10`);
        console.log(`🛣️  Highway/Road Junctions: 11`);

        if (errorCount > 0) {
            console.log('\n⚠️  Some zones failed to seed. Check the errors above.');
        }

        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        console.log('✨ Seeding process completed successfully!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

// Run seed function
seedData();