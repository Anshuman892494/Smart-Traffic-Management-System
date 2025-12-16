import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaCar,
    FaMapMarkerAlt,
    FaTrafficLight,
    FaRoad,
    FaBell,
    FaHistory,
    FaSearch,
    FaExclamationTriangle
} from 'react-icons/fa';
import MapView from './MapView';
import Loader from '../common/Loader';
import '../../styles/main.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        vehicleStatus: 'Active',
        lastTrip: '2 hours ago',
        trafficAlerts: 3,
        favoriteRoutes: 2
    });
    const [trafficData, setTrafficData] = useState([]);
    const [nearbyTraffic, setNearbyTraffic] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        fetchDashboardData();

        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(location);
                    fetchNearbyTraffic(location[1], location[0]);
                },
                (error) => {
                    console.log('Location access denied or error:', error);
                    // Use default location (Delhi)
                    setUserLocation([28.6139, 77.2090]);
                    fetchNearbyTraffic(77.2090, 28.6139);
                }
            );
        } else {
            // Default to Delhi if geolocation not supported
            setUserLocation([28.6139, 77.2090]);
            fetchNearbyTraffic(77.2090, 28.6139);
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch traffic data
            const [trafficRes, analyticsRes] = await Promise.all([
                axios.get('/api/traffic?limit=5'),
                axios.get('/api/traffic/analytics')
            ]);

            setTrafficData(trafficRes.data.data);

            // Update stats with analytics
            setStats(prev => ({
                ...prev,
                trafficAlerts: analyticsRes.data.data.congestionDistribution.high || 0
            }));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyTraffic = async (longitude, latitude) => {
        try {
            const response = await axios.get('/api/traffic/nearby', {
                params: { longitude, latitude, radius: 5000 }
            });
            setNearbyTraffic(response.data.data);
        } catch (error) {
            console.error('Error fetching nearby traffic:', error);
        }
    };

    const getTrafficAlertColor = (level) => {
        switch (level) {
            case 'high': return 'var(--danger-color)';
            case 'medium': return 'var(--warning-color)';
            case 'low': return 'var(--success-color)';
            default: return 'var(--gray-color)';
        }
    };

    const handleReportIssue = () => {
        navigate('/report');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader type="spinner" text="Loading your dashboard..." />
            </div>
        );
    }

    return (
        <div>
            {/* Welcome Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Welcome back, {user?.fullName}!</h1>
                <p style={{ color: 'var(--gray-color)' }}>
                    Here's your traffic overview and personalized recommendations.
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/map')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaMapMarkerAlt />
                    View Live Traffic Map
                </button>

                <button
                    className="btn btn-success"
                    onClick={() => navigate('/route-planner')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaRoad />
                    Plan Route
                </button>

                <button
                    className="btn btn-danger"
                    onClick={handleReportIssue}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaExclamationTriangle />
                    Report Traffic Incident
                </button>
            </div>

            {/* Map and Traffic Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <h3 style={{ marginBottom: '15px' }}>Live Traffic Map</h3>
                    <MapView />
                </div>

                <div>
                    <h3 style={{ marginBottom: '15px' }}>Nearby Traffic Alerts</h3>
                    <div className="card">
                        {nearbyTraffic.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {nearbyTraffic.slice(0, 5).map((zone) => (
                                    <div
                                        key={zone._id}
                                        style={{
                                            padding: '12px',
                                            borderLeft: `4px solid ${getTrafficAlertColor(zone.congestionLevel)}`,
                                            backgroundColor: '#f9fafb',
                                            borderRadius: 'var(--border-radius)',
                                            cursor: 'pointer',
                                            transition: 'var(--transition)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                        onClick={() => navigate('/map')}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '5px'
                                        }}>
                                            <strong style={{ fontSize: '14px' }}>{zone.zoneName}</strong>
                                            <span style={{
                                                fontSize: '12px',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                backgroundColor: getTrafficAlertColor(zone.congestionLevel) + '20',
                                                color: getTrafficAlertColor(zone.congestionLevel),
                                                fontWeight: '600'
                                            }}>
                                                {zone.congestionLevel.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                                            {zone.vehiclesCount} vehicles • Avg {zone.averageSpeed} km/h
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray-color)' }}>
                                <FaTrafficLight size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                <p>No traffic alerts in your area</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Search */}
                    <div className="card" style={{ marginTop: '20px' }}>
                        <h4 style={{ marginBottom: '15px' }}>Quick Search</h4>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search for routes, locations..."
                                style={{
                                    width: '100%',
                                    padding: '10px 40px 10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '14px'
                                }}
                            />
                            <FaSearch style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--gray-color)'
                            }} />
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--gray-color)' }}>
                            Search for optimal routes based on current traffic
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Recent Traffic Updates</h3>
                    <button
                        className="btn"
                        onClick={() => navigate('/traffic-history')}
                        style={{ fontSize: '14px', padding: '8px 16px' }}
                    >
                        <FaHistory style={{ marginRight: '8px' }} />
                        View History
                    </button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Zone</th>
                                <th>Status</th>
                                <th>Vehicles</th>
                                <th>Avg Speed</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trafficData.map((zone) => (
                                <tr key={zone._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: getTrafficAlertColor(zone.congestionLevel)
                                            }} />
                                            {zone.zoneName}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`traffic-status traffic-${zone.congestionLevel}`}>
                                            {zone.congestionLevel}
                                        </span>
                                    </td>
                                    <td>{zone.vehiclesCount}</td>
                                    <td>{zone.averageSpeed} km/h</td>
                                    <td>{new Date(zone.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tips Section */}
            <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px' }}>Traffic Tips</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    <div style={{
                        backgroundColor: '#f0f9ff',
                        padding: '15px',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #e0f2fe'
                    }}>
                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '8px' }}>Peak Hours</h4>
                        <p style={{ fontSize: '14px', color: 'var(--gray-color)' }}>
                            Avoid travel between 8-10 AM and 5-7 PM for smoother commutes.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#f0fdf4',
                        padding: '15px',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #dcfce7'
                    }}>
                        <h4 style={{ color: 'var(--success-color)', marginBottom: '8px' }}>Alternative Routes</h4>
                        <p style={{ fontSize: '14px', color: 'var(--gray-color)' }}>
                            Save alternative routes in your favorites for quick access during congestion.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#fef3c7',
                        padding: '15px',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid  #fde68aff'
                    }}>
                        <h4 style={{ color: 'var(--warning-color)', marginBottom: '8px' }}>Real-time Updates</h4>
                        <p style={{ fontSize: '14px', color: 'var(--gray-color)' }}>
                            Check traffic updates every 15 minutes for the most accurate information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;