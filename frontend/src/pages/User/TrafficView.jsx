import React, { useState, useEffect } from 'react';
import { useTraffic } from '../../context/TrafficContext';
import { FaFilter, FaSearch, FaInfoCircle, FaRoute, FaBell, FaStar } from 'react-icons/fa';
import MapView from '../../components/dashboard/MapView';
import Loader from '../../components/common/Loader';
import '../../styles/main.css';

const TrafficView = ({ isAdmin = false }) => {
    const {
        trafficZones,
        nearbyTraffic,
        analytics,
        loading,
        fetchTrafficZones,
        fetchNearbyTraffic,
        getTrafficColor,
        selectedZone,
        setSelectedZone
    } = useTraffic();

    const [searchTerm, setSearchTerm] = useState('');
    const [congestionFilter, setCongestionFilter] = useState('');
    const [sortBy, setSortBy] = useState('congestion');
    const [userLocation, setUserLocation] = useState(null);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setUserLocation(location);
                    fetchNearbyTraffic(location.longitude, location.latitude);
                }, (error) => {
                    console.log('Location access denied:', error);
                    // Default to Jalandhar, Punjab coordinates
                    setUserLocation({ latitude: 31.3260, longitude: 75.5762 });
                    fetchNearbyTraffic(75.5762, 31.3260);
                }
            );
        }
    }, []);

    useEffect(() => {
        const params = {
            search: searchTerm,
            congestionLevel: congestionFilter
        };
        fetchTrafficZones(params);
    }, [searchTerm, congestionFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTrafficZones({ search: searchTerm, congestionLevel: congestionFilter });
    };

    const toggleFavorite = (zoneId) => {
        setFavorites(prev =>
            prev.includes(zoneId)
                ? prev.filter(id => id !== zoneId)
                : [...prev, zoneId]
        );
    };

    const handleZoneClick = (zone) => {
        setSelectedZone(zone);
    };

    const getFilteredAndSortedZones = () => {
        let filtered = [...trafficZones];

        // Apply congestion filter
        if (congestionFilter) {
            filtered = filtered.filter(zone => zone.congestionLevel === congestionFilter);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(zone =>
                zone.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                zone.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'congestion':
                    const levelOrder = { high: 3, medium: 2, low: 1 };
                    return levelOrder[b.congestionLevel] - levelOrder[a.congestionLevel];
                case 'name':
                    return a.zoneName.localeCompare(b.zoneName);
                case 'vehicles':
                    return b.vehiclesCount - a.vehiclesCount;
                case 'speed':
                    return a.averageSpeed - b.averageSpeed;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    if (loading && !trafficZones.length) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader type="spinner" text="Loading traffic data..." />
            </div>
        );
    }

    const filteredZones = getFilteredAndSortedZones();

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>
                    {isAdmin ? 'Traffic Zone Management' : 'Live Traffic View'}
                </h1>
                <p style={{ color: 'var(--gray-color)' }}>
                    {isAdmin
                        ? 'Monitor and manage all traffic zones in the system'
                        : 'Real-time traffic information and navigation assistance'
                    }
                </p>
            </div>

            {/* Filters and Controls */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search traffic zones..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                    </form>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <FaFilter style={{ color: 'var(--gray-color)' }} />
                        <select
                            value={congestionFilter}
                            onChange={(e) => setCongestionFilter(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '14px',
                                minWidth: '120px'
                            }}
                        >
                            <option value="">All Traffic</option>
                            <option value="low">Low Traffic</option>
                            <option value="medium">Medium Traffic</option>
                            <option value="high">Heavy Traffic</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '14px',
                                minWidth: '140px'
                            }}
                        >
                            <option value="congestion">Congestion Level</option>
                            <option value="name">Zone Name</option>
                            <option value="vehicles">Vehicle Count</option>
                            <option value="speed">Average Speed</option>
                        </select>
                    </div>

                    {isAdmin && (
                        <button
                            className="btn btn-primary"
                            onClick={() => alert('Add new zone feature coming soon!')}
                            style={{ padding: '10px 20px' }}
                        >
                            Add New Zone
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
                {/* Map */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                    }}>
                        <h3>Interactive Traffic Map</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn"
                                onClick={() => fetchTrafficZones()}
                                style={{ padding: '8px 16px', fontSize: '14px' }}
                            >
                                Refresh Map
                            </button>
                            {!isAdmin && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => alert('Route planning feature coming soon!')}
                                    style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <FaRoute />
                                    Plan Route
                                </button>
                            )}
                        </div>
                    </div>

                    <MapView isAdmin={isAdmin} onZoneSelect={handleZoneClick} />

                    {/* Map Legend */}
                    <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        backgroundColor: 'white',
                        borderRadius: 'var(--border-radius)',
                        boxShadow: 'var(--box-shadow)',
                        display: 'flex',
                        justifyContent: 'space-around',
                        flexWrap: 'wrap',
                        gap: '10px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '15px', height: '15px', backgroundColor: '#10b981', borderRadius: '50%' }} />
                            <span style={{ fontSize: '14px' }}>Low Traffic</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '15px', height: '15px', backgroundColor: '#f59e0b', borderRadius: '50%' }} />
                            <span style={{ fontSize: '14px' }}>Medium Traffic</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '15px', height: '15px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                            <span style={{ fontSize: '14px' }}>Heavy Traffic</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '15px',
                                height: '15px',
                                backgroundColor: '#3b82f6',
                                borderRadius: '50%',
                                border: '2px solid white',
                                boxShadow: '0 0 0 1px #3b82f6'
                            }} />
                            <span style={{ fontSize: '14px' }}>Your Location</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Selected Zone Details */}
                    {selectedZone && (
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <h3>Zone Details</h3>
                                <button
                                    onClick={() => setSelectedZone(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        color: 'var(--gray-color)'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ marginBottom: '8px' }}>{selectedZone.zoneName}</h4>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    backgroundColor: getTrafficColor(selectedZone.congestionLevel).bgColor,
                                    color: getTrafficColor(selectedZone.congestionLevel).color,
                                    textTransform: 'capitalize',
                                    marginBottom: '10px'
                                }}>
                                    {selectedZone.congestionLevel} Traffic
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Vehicles:</span>
                                    <strong>{selectedZone.vehiclesCount}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Avg Speed:</span>
                                    <strong>{selectedZone.averageSpeed} km/h</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Last Updated:</span>
                                    <strong>{formatTime(selectedZone.updatedAt)}</strong>
                                </div>
                                {selectedZone.description && (
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '5px' }}>
                                            Description
                                        </div>
                                        <div style={{ fontSize: '14px' }}>
                                            {selectedZone.description}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button
                                    className="btn"
                                    onClick={() => toggleFavorite(selectedZone._id)}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <FaStar style={{ color: favorites.includes(selectedZone._id) ? '#f59e0b' : 'var(--gray-color)' }} />
                                    {favorites.includes(selectedZone._id) ? 'Unfavorite' : 'Favorite'}
                                </button>
                                {!isAdmin && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => alert('Navigation feature coming soon!')}
                                        style={{ flex: 1 }}
                                    >
                                        Navigate Here
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Traffic List */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Traffic Zones ({filteredZones.length})</h3>
                            <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                                Updated {analytics?.timestamp ? formatTime(analytics.timestamp) : 'recently'}
                            </div>
                        </div>

                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            {filteredZones.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {filteredZones.map((zone) => (
                                        <div
                                            key={zone._id}
                                            style={{
                                                padding: '12px',
                                                borderLeft: `4px solid ${getTrafficColor(zone.congestionLevel).color}`,
                                                backgroundColor: zone._id === selectedZone?._id ? '#f0f9ff' : 'white',
                                                borderRadius: 'var(--border-radius)',
                                                cursor: 'pointer',
                                                transition: 'var(--transition)',
                                                border: zone._id === selectedZone?._id ? '1px solid #e0f2fe' : '1px solid #f3f4f6'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = zone._id === selectedZone?._id ? '#f0f9ff' : 'white'}
                                            onClick={() => handleZoneClick(zone)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '4px'
                                                    }}>
                                                        <strong style={{ fontSize: '14px' }}>{zone.zoneName}</strong>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleFavorite(zone._id);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '0',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <FaStar size={12} style={{
                                                                color: favorites.includes(zone._id) ? '#f59e0b' : '#d1d5db'
                                                            }} />
                                                        </button>
                                                    </div>
                                                    {zone.description && (
                                                        <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '8px' }}>
                                                            {zone.description.length > 60 ? zone.description.substring(0, 60) + '...' : zone.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    backgroundColor: getTrafficColor(zone.congestionLevel).bgColor,
                                                    color: getTrafficColor(zone.congestionLevel).color
                                                }}>
                                                    {zone.congestionLevel}
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '12px',
                                                color: 'var(--gray-color)'
                                            }}>
                                                <span>{zone.vehiclesCount} vehicles</span>
                                                <span>{zone.averageSpeed} km/h</span>
                                                <span>{formatTime(zone.updatedAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-color)' }}>
                                    <FaInfoCircle size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                    <p>No traffic zones found</p>
                                    {searchTerm && (
                                        <button
                                            className="btn"
                                            onClick={() => setSearchTerm('')}
                                            style={{ marginTop: '10px', fontSize: '12px' }}
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nearby Traffic Alert */}
                    {nearbyTraffic.length > 0 && !isAdmin && (
                        <div className="card" style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                <FaBell style={{ color: 'var(--warning-color)' }} />
                                <h3>Nearby Alerts</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {nearbyTraffic.slice(0, 3).map((zone) => (
                                    <div
                                        key={zone._id}
                                        style={{
                                            padding: '10px',
                                            backgroundColor: getTrafficColor(zone.congestionLevel).bgColor,
                                            borderRadius: 'var(--border-radius)',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>{zone.zoneName}</div>
                                        <div style={{ fontSize: '12px' }}>
                                            {zone.congestionLevel.toUpperCase()} traffic • {zone.vehiclesCount} vehicles
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics Footer */}
            {analytics && (
                <div className="card" style={{ marginTop: '20px' }}>
                    <h3 style={{ marginBottom: '15px' }}>Traffic Statistics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-color)' }}>
                                {analytics.totalZones}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Total Zones</div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                                {analytics.congestionDistribution.low}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Low Traffic Zones</div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
                                {analytics.congestionDistribution.medium}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Medium Traffic Zones</div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                                {analytics.congestionDistribution.high}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Heavy Traffic Zones</div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--dark-color)' }}>
                                {analytics.totalVehicles}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Total Vehicles</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrafficView;