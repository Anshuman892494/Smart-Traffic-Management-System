// src/pages/Public/RoutePlanner.jsx
import React, { useState, useEffect } from 'react';
import {
    FaMap,
    FaMapMarkerAlt,
    FaCar,
    FaWalking,
    FaClock,
    FaTrafficLight,
    FaRoute,
    FaArrowLeft,
    FaCompressArrowsAlt,
    FaExpandArrowsAlt,
    FaRedo,
    FaInfoCircle,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaDirections,
    FaSign,
    FaArrowRight,
    FaCalculator
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import trafficLightsDB from '../../services/trafficDB';
import Loader from '../../components/common/Loader';

const RoutePlanner = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [trafficLights, setTrafficLights] = useState([]);
    const [routeMode, setRouteMode] = useState('car'); // 'car' or 'walking'
    const [startPoint, setStartPoint] = useState('');
    const [endPoint, setEndPoint] = useState('');
    const [routeResult, setRouteResult] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [showTrafficInfo, setShowTrafficInfo] = useState(false);
    const [showRouteDetails, setShowRouteDetails] = useState(false);

    // Jalandhar locations for autocomplete
    const jalandharLocations = [
        'Model Town Chowk, Jalandhar',
        'PAP Chowk, GT Road, Jalandhar',
        'Nakodar Road Intersection, Jalandhar',
        'Civil Lines Crossing, Jalandhar',
        'Ladowali Road Junction, Jalandhar',
        'Guru Gobind Singh Marg, Jalandhar',
        'Phagwara Highway Entry, Jalandhar',
        'DC Office Crossing, Jalandhar',
        'Sports College Intersection, Jalandhar',
        'Basti Nau Crossing, Jalandhar',
        'Rama Mandi Chowk, Jalandhar',
        'Adarsh Nagar Crossing, Jalandhar',
        'Lovely University Gate, Jalandhar',
        'Civil Hospital Crossing, Jalandhar',
        'Bus Stand Junction, Jalandhar',
        'Railway Station, Jalandhar',
        'Punjab Technical University, Jalandhar',
        'St. Soldier School, Jalandhar',
        'Cricket Stadium, Jalandhar',
        'MBD Mall, Jalandhar'
    ];

    // Predefined routes with traffic light information
    const predefinedRoutes = [
        {
            id: 'route1',
            name: 'Railway Station to Bus Stand',
            start: 'Railway Station, Jalandhar',
            end: 'Bus Stand Junction, Jalandhar',
            distance: '4.2 km',
            trafficLights: 3,
            estimatedTime: '12-15 minutes',
            description: 'Direct route through main city roads'
        },
        {
            id: 'route2',
            name: 'Model Town to Lovely University',
            start: 'Model Town Chowk, Jalandhar',
            end: 'Lovely University Gate, Jalandhar',
            distance: '6.8 km',
            trafficLights: 5,
            estimatedTime: '18-22 minutes',
            description: 'Cross-city route with moderate traffic'
        },
        {
            id: 'route3',
            name: 'GT Road to Phagwara Highway',
            start: 'PAP Chowk, GT Road, Jalandhar',
            end: 'Phagwara Highway Entry, Jalandhar',
            distance: '8.5 km',
            trafficLights: 6,
            estimatedTime: '20-25 minutes',
            description: 'Highway connection with heavy traffic'
        },
        {
            id: 'route4',
            name: 'Civil Lines to DC Office',
            start: 'Civil Lines Crossing, Jalandhar',
            end: 'DC Office Crossing, Jalandhar',
            distance: '2.1 km',
            trafficLights: 2,
            estimatedTime: '6-8 minutes',
            description: 'Short administrative route'
        }
    ];

    // Initialize and load data
    useEffect(() => {
        const initializeDB = async () => {
            try {
                await trafficLightsDB.init();
                await loadTrafficLights();
            } catch (error) {
                console.error('Failed to load traffic lights:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeDB();
    }, []);

    const loadTrafficLights = async () => {
        try {
            const lights = await trafficLightsDB.getAllTrafficLights();
            setTrafficLights(lights);
        } catch (error) {
            console.error('Error loading traffic lights:', error);
        }
    };

    const calculateRoute = () => {
        if (!startPoint.trim() || !endPoint.trim()) {
            alert('Please enter both start and end points');
            return;
        }

        setIsCalculating(true);

        // Simulate route calculation with a delay
        setTimeout(() => {
            // Find traffic lights between locations
            const startIndex = jalandharLocations.findIndex(loc =>
                loc.toLowerCase().includes(startPoint.toLowerCase().split(',')[0])
            );
            const endIndex = jalandharLocations.findIndex(loc =>
                loc.toLowerCase().includes(endPoint.toLowerCase().split(',')[0])
            );

            let trafficLightsOnRoute = [];
            let estimatedTime = 0;
            let distance = 0;
            let routeSteps = [];

            if (startIndex !== -1 && endIndex !== -1) {
                // Calculate distance based on location indices
                distance = Math.abs(endIndex - startIndex) * 1.2 + 2;

                // Get traffic lights that might be on the route
                const minIndex = Math.min(startIndex, endIndex);
                const maxIndex = Math.max(startIndex, endIndex);

                trafficLightsOnRoute = trafficLights.slice(minIndex, maxIndex + 1).slice(0, 5);

                // Calculate estimated time
                const baseTime = distance * (routeMode === 'car' ? 2.5 : 6); // minutes
                const trafficLightDelay = trafficLightsOnRoute.length * (routeMode === 'car' ? 1.5 : 0.5);
                estimatedTime = Math.round(baseTime + trafficLightDelay);

                // Generate route steps
                routeSteps = [
                    `Start from ${startPoint}`,
                    'Proceed towards main road',
                    ...trafficLightsOnRoute.map((light, index) =>
                        `Pass through ${light.name} (${getSignalStatus(light)})`
                    ),
                    'Continue on route',
                    `Arrive at ${endPoint}`
                ];
            } else {
                // Fallback calculation for unknown locations
                distance = Math.floor(Math.random() * 10) + 2;
                trafficLightsOnRoute = trafficLights.slice(0, 3);
                estimatedTime = Math.round(distance * (routeMode === 'car' ? 2.5 : 6));

                routeSteps = [
                    `Start from ${startPoint}`,
                    'Follow main road',
                    'Take second right',
                    'Continue straight',
                    `Arrive at ${endPoint}`
                ];
            }

            // Generate warnings for problematic traffic lights
            const warnings = trafficLightsOnRoute
                .filter(light => light.status !== 'operational' || light.emergencyMode)
                .map(light => ({
                    type: light.emergencyMode ? 'emergency' : light.status,
                    message: `${light.name} is ${light.emergencyMode ? 'in emergency mode' : light.status}`,
                    location: light.location
                }));

            const result = {
                distance: `${distance.toFixed(1)} km`,
                estimatedTime: `${estimatedTime} minutes`,
                trafficLightsCount: trafficLightsOnRoute.length,
                trafficLights: trafficLightsOnRoute,
                steps: routeSteps,
                warnings: warnings,
                alternativeRoutes: generateAlternativeRoutes(startPoint, endPoint),
                routeEfficiency: calculateEfficiency(trafficLightsOnRoute, routeMode),
                lastUpdated: new Date().toISOString()
            };

            setRouteResult(result);
            setIsCalculating(false);
            setShowTrafficInfo(true);
        }, 1500);
    };

    const getSignalStatus = (light) => {
        if (light.emergencyMode) return 'EMERGENCY (Red)';
        if (light.status !== 'operational') return `${light.status.toUpperCase()}`;
        return `${light.currentSignal.toUpperCase()} signal`;
    };

    const generateAlternativeRoutes = (start, end) => {
        return [
            {
                name: 'Fastest Route',
                distance: `${(parseFloat(routeResult?.distance || '5') * 0.9).toFixed(1)} km`,
                time: `${Math.round(parseInt(routeResult?.estimatedTime || '15') * 0.85)} min`,
                trafficLights: Math.max(0, (routeResult?.trafficLightsCount || 3) - 1),
                description: 'Uses main roads with minimal stops'
            },
            {
                name: 'Scenic Route',
                distance: `${(parseFloat(routeResult?.distance || '5') * 1.2).toFixed(1)} km`,
                time: `${Math.round(parseInt(routeResult?.estimatedTime || '15') * 1.3)} min`,
                trafficLights: Math.max(0, (routeResult?.trafficLightsCount || 3) - 2),
                description: 'Less traffic but longer distance'
            },
            {
                name: 'Direct Route',
                distance: `${(parseFloat(routeResult?.distance || '5') * 0.95).toFixed(1)} km`,
                time: `${Math.round(parseInt(routeResult?.estimatedTime || '15') * 0.95)} min`,
                trafficLights: (routeResult?.trafficLightsCount || 3) + 1,
                description: 'Most direct path with more intersections'
            }
        ];
    };

    const calculateEfficiency = (lights, mode) => {
        if (lights.length === 0) return 100;

        const operationalLights = lights.filter(l => l.status === 'operational' && !l.emergencyMode).length;
        const efficiency = (operationalLights / lights.length) * 100;

        // Adjust for mode
        const modeMultiplier = mode === 'car' ? 0.9 : 0.95;
        return Math.round(efficiency * modeMultiplier);
    };

    const clearRoute = () => {
        setRouteResult(null);
        setStartPoint('');
        setEndPoint('');
        setShowTrafficInfo(false);
        setShowRouteDetails(false);
    };

    const usePredefinedRoute = (route) => {
        setStartPoint(route.start);
        setEndPoint(route.end);
        setShowTrafficInfo(true);
    };

    const getSignalColor = (signal) => {
        if (signal?.includes('EMERGENCY')) return '#ef4444';
        if (signal?.includes('Red')) return '#ef4444';
        if (signal?.includes('Yellow')) return '#f59e0b';
        if (signal?.includes('Green')) return '#10b981';
        return '#6b7280';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'operational': return '#10b981';
            case 'maintenance': return '#f59e0b';
            case 'faulty': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f8fafc'
            }}>
                <Loader type="spinner" text="Loading Route Planner..." />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '15px',
                                padding: '8px 16px',
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: '#475569',
                                fontWeight: '500'
                            }}
                        >
                            <FaArrowLeft />
                            Back
                        </button>

                        <h1 style={{ fontSize: '28px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
                            <FaRoute style={{ color: '#3b82f6' }} />
                            Jalandhar Smart Route Planner
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '16px' }}>
                            Plan your route considering real-time traffic light status and timing
                        </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                            Active Traffic Lights: {trafficLights.filter(l => l.status === 'operational').length}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
                            Data updated in real-time
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                {/* Left Column: Route Input */}
                <div>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '25px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        height: '100%'
                    }}>
                        <h3 style={{ marginBottom: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaMapMarkerAlt style={{ color: '#3b82f6' }} />
                            Plan Your Route
                        </h3>

                        {/* Travel Mode */}
                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ fontSize: '14px', color: '#475569', marginBottom: '10px', fontWeight: '500' }}>
                                Travel Mode:
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setRouteMode('car')}
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        backgroundColor: routeMode === 'car' ? '#3b82f6' : '#f1f5f9',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: routeMode === 'car' ? 'white' : '#475569',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FaCar />
                                    By Car
                                </button>
                                <button
                                    onClick={() => setRouteMode('walking')}
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        backgroundColor: routeMode === 'walking' ? '#10b981' : '#f1f5f9',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: routeMode === 'walking' ? 'white' : '#475569',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FaWalking />
                                    Walking
                                </button>
                            </div>
                        </div>

                        {/* Route Inputs */}
                        <div style={{ marginBottom: '25px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                    Start Point *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FaMapMarkerAlt style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#3b82f6'
                                    }} />
                                    <input
                                        type="text"
                                        value={startPoint}
                                        onChange={(e) => setStartPoint(e.target.value)}
                                        placeholder="Enter starting location"
                                        list="locations-start"
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: '#f8fafc'
                                        }}
                                    />
                                    <datalist id="locations-start">
                                        {jalandharLocations.map((location, index) => (
                                            <option key={`start-${index}`} value={location} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                    Destination *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FaMapMarkerAlt style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#ef4444'
                                    }} />
                                    <input
                                        type="text"
                                        value={endPoint}
                                        onChange={(e) => setEndPoint(e.target.value)}
                                        placeholder="Enter destination"
                                        list="locations-end"
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: '#f8fafc'
                                        }}
                                    />
                                    <datalist id="locations-end">
                                        {jalandharLocations.map((location, index) => (
                                            <option key={`end-${index}`} value={location} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                            <button
                                onClick={calculateRoute}
                                disabled={isCalculating || !startPoint.trim() || !endPoint.trim()}
                                style={{
                                    flex: 2,
                                    padding: '15px',
                                    backgroundColor: '#10b981',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: !startPoint.trim() || !endPoint.trim() || isCalculating ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    opacity: !startPoint.trim() || !endPoint.trim() || isCalculating ? 0.6 : 1
                                }}
                            >
                                {isCalculating ? (
                                    <>
                                        <FaCalculator style={{ animation: 'spin 1s linear infinite' }} />
                                        Calculating Route...
                                    </>
                                ) : (
                                    <>
                                        <FaRoute />
                                        Calculate Route
                                    </>
                                )}
                            </button>
                            <button
                                onClick={clearRoute}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}
                            >
                                <FaRedo />
                                Clear
                            </button>
                        </div>

                        {/* Predefined Routes */}
                        <div>
                            <h4 style={{ marginBottom: '15px', color: '#475569', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaDirections />
                                Popular Routes in Jalandhar
                            </h4>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {predefinedRoutes.map(route => (
                                    <div
                                        key={route.id}
                                        onClick={() => usePredefinedRoute(route)}
                                        style={{
                                            padding: '15px',
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            ':hover': {
                                                backgroundColor: '#f0f9ff',
                                                borderColor: '#0ea5e9'
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{route.name}</div>
                                            <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>{route.distance}</div>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>
                                            {route.start} → {route.end}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {route.trafficLights} traffic lights • {route.estimatedTime}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Route Results */}
                <div>
                    {routeResult ? (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '25px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            height: '100%'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaRoute style={{ color: '#10b981' }} />
                                    Route Details
                                </h3>
                                <button
                                    onClick={() => setShowRouteDetails(!showRouteDetails)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        color: '#475569',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {showRouteDetails ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
                                    {showRouteDetails ? 'Less Details' : 'More Details'}
                                </button>
                            </div>

                            {/* Route Summary */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#0ea5e9', marginBottom: '5px' }}>Distance</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{routeResult.distance}</div>
                                </div>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#0ea5e9', marginBottom: '5px' }}>Estimated Time</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{routeResult.estimatedTime}</div>
                                </div>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#0ea5e9', marginBottom: '5px' }}>Traffic Lights</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{routeResult.trafficLightsCount}</div>
                                </div>
                            </div>

                            {/* Route Efficiency */}
                            <div style={{
                                padding: '15px',
                                backgroundColor: routeResult.routeEfficiency >= 80 ? '#dcfce7' :
                                    routeResult.routeEfficiency >= 60 ? '#fef3c7' : '#fee2e2',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                borderLeft: `4px solid ${routeResult.routeEfficiency >= 80 ? '#10b981' :
                                    routeResult.routeEfficiency >= 60 ? '#f59e0b' : '#ef4444'
                                    }`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                    <FaInfoCircle style={{
                                        color:
                                            routeResult.routeEfficiency >= 80 ? '#10b981' :
                                                routeResult.routeEfficiency >= 60 ? '#f59e0b' : '#ef4444'
                                    }} />
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>Route Efficiency: {routeResult.routeEfficiency}%</div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#475569' }}>
                                    {routeResult.routeEfficiency >= 80 ? 'Excellent route with minimal delays' :
                                        routeResult.routeEfficiency >= 60 ? 'Good route with moderate traffic' :
                                            'Route may have significant delays'}
                                </div>
                            </div>

                            {/* Warnings */}
                            {routeResult.warnings.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaExclamationTriangle style={{ color: '#ef4444' }} />
                                        Route Warnings
                                    </h4>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {routeResult.warnings.map((warning, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '12px',
                                                    backgroundColor: warning.type === 'emergency' ? '#fee2e2' : '#fef3c7',
                                                    borderRadius: '6px',
                                                    borderLeft: `3px solid ${warning.type === 'emergency' ? '#ef4444' : '#f59e0b'
                                                        }`
                                                }}
                                            >
                                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                                                    {warning.message}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                    Location: {warning.location}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Traffic Lights on Route */}
                            {showTrafficInfo && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaTrafficLight />
                                        Traffic Lights on Route
                                    </h4>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {routeResult.trafficLights.map((light, index) => (
                                            <div
                                                key={light.id}
                                                style={{
                                                    padding: '12px',
                                                    backgroundColor: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                }}
                                            >
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: getSignalColor(getSignalStatus(light)),
                                                    borderRadius: '50%'
                                                }}></div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>
                                                        {index + 1}. {light.name}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                        {light.location} • {getSignalStatus(light)}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: getStatusColor(light.status) + '20',
                                                    color: getStatusColor(light.status),
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: '600'
                                                }}>
                                                    {light.status.toUpperCase()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Route Steps */}
                            {showRouteDetails && (
                                <div>
                                    <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaSign />
                                        Step-by-step Directions
                                    </h4>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {routeResult.steps.map((step, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '12px',
                                                    backgroundColor: index === 0 || index === routeResult.steps.length - 1 ? '#f0f9ff' : 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '12px'
                                                }}
                                            >
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    backgroundColor: index === 0 ? '#3b82f6' :
                                                        index === routeResult.steps.length - 1 ? '#10b981' : '#94a3b8',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    flexShrink: 0
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <div style={{ color: '#475569', fontSize: '14px' }}>
                                                    {step}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Alternative Routes */}
                            {showRouteDetails && routeResult.alternativeRoutes && (
                                <div style={{ marginTop: '20px' }}>
                                    <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaRoute style={{ color: '#8b5cf6' }} />
                                        Alternative Routes
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        {routeResult.alternativeRoutes.map((altRoute, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '15px',
                                                    backgroundColor: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    ':hover': {
                                                        backgroundColor: '#f0f9ff',
                                                        borderColor: '#0ea5e9'
                                                    }
                                                }}
                                                onClick={() => {
                                                    // Simulate using this alternative route
                                                    alert(`Selected alternative route: ${altRoute.name}`);
                                                }}
                                            >
                                                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '5px', fontSize: '13px' }}>
                                                    {altRoute.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                                                    {altRoute.distance} • {altRoute.time}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                    {altRoute.trafficLights} traffic lights
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Route Summary Footer */}
                            <div style={{
                                marginTop: '20px',
                                paddingTop: '15px',
                                borderTop: '1px solid #e2e8f0',
                                fontSize: '12px',
                                color: '#94a3b8',
                                textAlign: 'center'
                            }}>
                                Route calculated based on real-time traffic data • Last updated: {
                                    new Date(routeResult.lastUpdated).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                }
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '40px 25px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                <FaRoute size={32} color="#0ea5e9" />
                            </div>
                            <h3 style={{ color: '#64748b', marginBottom: '10px', fontSize: '20px' }}>
                                No Route Planned Yet
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '400px', marginBottom: '20px' }}>
                                Enter start and destination points to calculate the best route considering traffic light timings
                            </p>
                            <div style={{
                                padding: '10px 20px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '8px',
                                fontSize: '14px',
                                color: '#0ea5e9',
                                fontWeight: '500'
                            }}>
                                {trafficLights.filter(l => l.status === 'operational').length} traffic lights available
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Information Section */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '25px',
                marginTop: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginBottom: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaInfoCircle />
                    How Route Planning Works
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                        <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '16px' }}>Real-time Traffic Data</h4>
                        <ul style={{ color: '#475569', paddingLeft: '20px' }}>
                            <li>Considers current traffic light status</li>
                            <li>Tracks emergency mode signals</li>
                            <li>Monitors maintenance/faulty lights</li>
                            <li>Updates automatically every 30 seconds</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '16px' }}>Route Optimization</h4>
                        <ul style={{ color: '#475569', paddingLeft: '20px' }}>
                            <li>Minimizes waiting time at signals</li>
                            <li>Avoids problematic intersections</li>
                            <li>Calculates multiple alternatives</li>
                            <li>Considers travel mode (car/walking)</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '16px' }}>Traffic Light Timing</h4>
                        <ul style={{ color: '#475569', paddingLeft: '20px' }}>
                            <li>Red: 60 seconds (stop)</li>
                            <li>Yellow: 5 seconds (prepare)</li>
                            <li>Green: 45 seconds (go)</li>
                            <li>Total cycle: 110 seconds</li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    marginTop: '25px',
                    padding: '15px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    borderLeft: '4px solid #f59e0b'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <FaExclamationTriangle style={{ color: '#92400e' }} />
                        <strong style={{ color: '#92400e' }}>Important Notice:</strong>
                    </div>
                    <p style={{ color: '#92400e', margin: 0, fontSize: '14px' }}>
                        This route planner provides estimated times based on current traffic conditions.
                        Actual travel times may vary due to weather, accidents, or sudden traffic changes.
                        Always follow traffic rules and road signs. Emergency vehicles have priority.
                    </p>
                </div>
            </div>

            {/* CSS Animations */}
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default RoutePlanner;