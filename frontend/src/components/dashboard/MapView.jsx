import React, { useState, useEffect } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Circle,
    Polyline
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { FaCar, FaRoad, FaTrafficLight } from 'react-icons/fa';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const MapView = ({ isAdmin = false, onZoneSelect }) => {
    const [trafficZones, setTrafficZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    // Default center (adjust to your city)
    const defaultCenter = [28.6139, 77.2090]; // Delhi coordinates
    const defaultZoom = 12;

    useEffect(() => {
        fetchTrafficZones();

        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([
                        position.coords.latitude,
                        position.coords.longitude
                    ]);
                },
                () => {
                    console.log('Location access denied');
                }
            );
        }
    }, []);

    const fetchTrafficZones = async () => {
        try {
            const response = await axios.get('/api/traffic');
            setTrafficZones(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching traffic zones:', error);
            setLoading(false);
        }
    };

    const getZoneColor = (congestionLevel) => {
        switch (congestionLevel) {
            case 'low':
                return '#10b981'; // Green
            case 'medium':
                return '#f59e0b'; // Yellow/Orange
            case 'high':
                return '#ef4444'; // Red
            default:
                return '#6b7280'; // Gray
        }
    };

    const getZoneIcon = (congestionLevel) => {
        const iconHtml = `
      <div style="
        background-color: ${getZoneColor(congestionLevel)};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${congestionLevel.charAt(0).toUpperCase()}
      </div>
    `;
        return L.divIcon({
            html: iconHtml,
            className: 'custom-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    };

    const getZoneRadius = (congestionLevel, vehiclesCount) => {
        // Base radius on congestion level and vehicle count
        let baseRadius = 200;
        if (congestionLevel === 'medium') baseRadius = 300;
        if (congestionLevel === 'high') baseRadius = 400;

        // Adjust based on vehicle count
        return baseRadius + (vehiclesCount * 2);
    };

    if (loading) {
        return (
            <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Loading map data...</div>
            </div>
        );
    }

    return (
        <div className="map-container">
            <MapContainer
                center={userLocation || defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Traffic Zones */}
                {trafficZones.map((zone) => (
                    <React.Fragment key={zone._id}>
                        <Marker
                            position={[zone.location.coordinates[1], zone.location.coordinates[0]]}
                            icon={getZoneIcon(zone.congestionLevel)}
                            eventHandlers={{
                                click: () => {
                                    if (onZoneSelect && isAdmin) {
                                        onZoneSelect(zone);
                                    }
                                }
                            }}
                        >
                            <Popup>
                                <div style={{ minWidth: '200px' }}>
                                    <h3 style={{ marginBottom: '8px' }}>{zone.zoneName}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <div
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: getZoneColor(zone.congestionLevel)
                                            }}
                                        />
                                        <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
                                            {zone.congestionLevel} Traffic
                                        </span>
                                    </div>
                                    <p style={{ marginBottom: '4px' }}>
                                        <FaCar style={{ marginRight: '8px' }} />
                                        Vehicles: {zone.vehiclesCount}
                                    </p>
                                    <p style={{ marginBottom: '4px' }}>
                                        <FaRoad style={{ marginRight: '8px' }} />
                                        Avg Speed: {zone.averageSpeed} km/h
                                    </p>
                                    {zone.description && (
                                        <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                                            {zone.description}
                                        </p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>

                        {/* Circle overlay for congestion visualization */}
                        <Circle
                            center={[zone.location.coordinates[1], zone.location.coordinates[0]]}
                            radius={getZoneRadius(zone.congestionLevel, zone.vehiclesCount)}
                            pathOptions={{
                                fillColor: getZoneColor(zone.congestionLevel),
                                color: getZoneColor(zone.congestionLevel),
                                fillOpacity: 0.2,
                                weight: 2
                            }}
                        />
                    </React.Fragment>
                ))}

                {/* User location marker */}
                {userLocation && (
                    <Marker position={userLocation}>
                        <Popup>Your Location</Popup>
                    </Marker>
                )}

                {/* Sample road lines (simplified) */}
                <Polyline
                    positions={[
                        [28.6139, 77.2090],
                        [28.6200, 77.2200],
                        [28.6300, 77.2300]
                    ]}
                    pathOptions={{ color: 'blue', weight: 3 }}
                />
            </MapContainer>

            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--box-shadow)',
                zIndex: 1000
            }}>
                <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Traffic Legend</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981'
                        }} />
                        <span style={{ fontSize: '12px' }}>Low Traffic</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#f59e0b'
                        }} />
                        <span style={{ fontSize: '12px' }}>Medium Traffic</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444'
                        }} />
                        <span style={{ fontSize: '12px' }}>Heavy Traffic</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapView;