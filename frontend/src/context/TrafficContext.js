import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const TrafficContext = createContext();

export const useTraffic = () => {
    const context = useContext(TrafficContext);
    if (!context) {
        throw new Error('useTraffic must be used within a TrafficProvider');
    }
    return context;
};

export const TrafficProvider = ({ children }) => {
    const [trafficZones, setTrafficZones] = useState([]);
    const [nearbyTraffic, setNearbyTraffic] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedZone, setSelectedZone] = useState(null);

    // Fetch all traffic zones
    const fetchTrafficZones = async (params = {}) => {
        try {
            setLoading(true);
            const response = await axios.get('/api/traffic', { params });
            setTrafficZones(response.data.data);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching traffic zones:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Fetch nearby traffic
    const fetchNearbyTraffic = async (longitude, latitude, radius = 5000) => {
        try {
            const response = await axios.get('/api/traffic/nearby', {
                params: { longitude, latitude, radius }
            });
            setNearbyTraffic(response.data.data);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching nearby traffic:', error);
            throw error;
        }
    };

    // Fetch traffic analytics
    const fetchTrafficAnalytics = async () => {
        try {
            const response = await axios.get('/api/traffic/analytics');
            setAnalytics(response.data.data);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching traffic analytics:', error);
            throw error;
        }
    };

    // Get user's current location
    const getUserLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setUserLocation(location);
                    resolve(location);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    reject(error);
                }
            );
        });
    };

    // Search traffic zones
    const searchTrafficZones = async (query) => {
        try {
            const response = await axios.get(`/api/traffic/search/${query}`);
            return response.data.data;
        } catch (error) {
            console.error('Error searching traffic zones:', error);
            throw error;
        }
    };

    // Create traffic zone (admin only)
    const createTrafficZone = async (zoneData) => {
        try {
            const response = await axios.post('/api/traffic', zoneData);
            // Refresh traffic zones
            await fetchTrafficZones();
            return response.data.data;
        } catch (error) {
            console.error('Error creating traffic zone:', error);
            throw error;
        }
    };

    // Update traffic zone (admin only)
    const updateTrafficZone = async (id, zoneData) => {
        try {
            const response = await axios.put(`/api/traffic/${id}`, zoneData);
            // Update local state
            setTrafficZones(prevZones =>
                prevZones.map(zone => zone._id === id ? response.data.data : zone)
            );
            return response.data.data;
        } catch (error) {
            console.error('Error updating traffic zone:', error);
            throw error;
        }
    };

    // Delete traffic zone (admin only)
    const deleteTrafficZone = async (id) => {
        try {
            await axios.delete(`/api/traffic/${id}`);
            // Update local state
            setTrafficZones(prevZones => prevZones.filter(zone => zone._id !== id));
            return true;
        } catch (error) {
            console.error('Error deleting traffic zone:', error);
            throw error;
        }
    };

    // Simulate traffic update (admin only)
    const simulateTrafficUpdate = async () => {
        try {
            const response = await axios.post('/api/traffic/simulate');
            // Refresh all traffic data
            await Promise.all([
                fetchTrafficZones(),
                fetchTrafficAnalytics()
            ]);
            return response.data;
        } catch (error) {
            console.error('Error simulating traffic update:', error);
            throw error;
        }
    };

    // Get traffic color by congestion level
    const getTrafficColor = (congestionLevel) => {
        switch (congestionLevel) {
            case 'low':
                return { color: '#10b981', bgColor: '#d1fae5' };
            case 'medium':
                return { color: '#f59e0b', bgColor: '#fef3c7' };
            case 'high':
                return { color: '#ef4444', bgColor: '#fee2e2' };
            default:
                return { color: '#6b7280', bgColor: '#f3f4f6' };
        }
    };

    // Initialize
    useEffect(() => {
        const initializeTrafficData = async () => {
            try {
                await Promise.all([
                    fetchTrafficZones({ limit: 50 }),
                    fetchTrafficAnalytics()
                ]);
            } catch (error) {
                console.error('Error initializing traffic data:', error);
            }
        };

        initializeTrafficData();
    }, []);

    const value = {
        trafficZones,
        nearbyTraffic,
        analytics,
        loading,
        userLocation,
        selectedZone,
        setSelectedZone,
        fetchTrafficZones,
        fetchNearbyTraffic,
        fetchTrafficAnalytics,
        getUserLocation,
        searchTrafficZones,
        createTrafficZone,
        updateTrafficZone,
        deleteTrafficZone,
        simulateTrafficUpdate,
        getTrafficColor
    };

    return (
        <TrafficContext.Provider value={value}>
            {children}
        </TrafficContext.Provider>
    );
};