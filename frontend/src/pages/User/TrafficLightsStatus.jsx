// src/pages/Public/TrafficLightsStatus.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    FaTrafficLight,
    FaMapMarkerAlt,
    FaClock,
    FaExclamationTriangle,
    FaCar,
    FaWalking,
    FaInfoCircle,
    FaArrowLeft,
    FaSync,
    FaMap,
    FaDatabase,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import trafficLightsDB from '../../services/trafficDB';
import Loader from '../../components/common/Loader';

const TrafficLightsStatus = () => {
    const navigate = useNavigate();
    const [trafficLights, setTrafficLights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedArea, setSelectedArea] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [dbConnected, setDbConnected] = useState(false);
    const [countdowns, setCountdowns] = useState({});
    const [signalStartTimes, setSignalStartTimes] = useState({});

    // Jalandhar areas for filtering
    const jalandharAreas = [
        { value: 'all', label: 'All Areas' },
        { value: 'model-town', label: 'Model Town Area' },
        { value: 'gt-road', label: 'GT Road Corridor' },
        { value: 'civil-lines', label: 'Civil Lines' },
        { value: 'nakodar-road', label: 'Nakodar Road' },
        { value: 'ladowali', label: 'Ladowali Road' },
        { value: 'phagwara', label: 'Phagwara Highway' }
    ];

    // Initialize and load data
    useEffect(() => {
        let isMounted = true;
        let refreshInterval;
        let countdownInterval;

        const initializeDB = async () => {
            try {
                await trafficLightsDB.init();
                setDbConnected(true);
                await loadTrafficLights();

                // Add cycle listener for real-time updates
                trafficLightsDB.addCycleListener(handleCycleUpdates);
            } catch (error) {
                console.error('Failed to load traffic lights:', error);
                if (isMounted) {
                    setDbConnected(false);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initializeDB();

        // Set up auto-refresh interval
        if (autoRefresh) {
            refreshInterval = setInterval(() => {
                loadTrafficLights();
            }, 30000); // Refresh every 30 seconds
        }

        // Set up countdown update interval (every second)
        countdownInterval = setInterval(() => {
            updateCountdowns();
        }, 1000);

        return () => {
            isMounted = false;
            clearInterval(refreshInterval);
            clearInterval(countdownInterval);
            trafficLightsDB.removeCycleListener(handleCycleUpdates);
        };
    }, [autoRefresh]);

    // Handle real-time cycle updates from database
    const handleCycleUpdates = (updates) => {
        console.log('Auto-cycle updates received:', updates);
        loadTrafficLights();
    };

    // Calculate countdowns for each light - ROBUST FIXED VERSION
    const updateCountdowns = useCallback(() => {
        if (!trafficLights.length) return;

        const newCountdowns = {};
        const now = Date.now();

        trafficLights.forEach(light => {
            if (light.status === 'operational' && !light.emergencyMode) {
                // Try to use lastSignalChange from database
                if (light.lastSignalChange) {
                    const lastChange = new Date(light.lastSignalChange).getTime();
                    const elapsedSeconds = Math.floor((now - lastChange) / 1000);

                    let totalDuration;

                    // Get the duration for current signal
                    switch (light.currentSignal) {
                        case 'green':
                            totalDuration = light.greenTime || 45;
                            break;
                        case 'yellow':
                            totalDuration = light.yellowTime || 5;
                            break;
                        case 'red':
                            totalDuration = light.redTime || 60;
                            break;
                        default:
                            totalDuration = 45;
                    }

                    let timeRemaining = Math.max(0, totalDuration - elapsedSeconds);

                    // Handle case where elapsed time exceeds duration
                    if (elapsedSeconds >= totalDuration) {
                        // Signal should have changed by now - calculate based on cycle
                        const cycleTime = light.cycleTime || 110;
                        const positionInCycle = elapsedSeconds % cycleTime;

                        // Determine current signal based on position in cycle
                        let currentInCycle = 'green';
                        let accumulated = 0;

                        if (positionInCycle < (light.greenTime || 45)) {
                            currentInCycle = 'green';
                            timeRemaining = (light.greenTime || 45) - positionInCycle;
                        } else if (positionInCycle < (light.greenTime || 45) + (light.yellowTime || 5)) {
                            currentInCycle = 'yellow';
                            timeRemaining = (light.greenTime || 45) + (light.yellowTime || 5) - positionInCycle;
                        } else {
                            currentInCycle = 'red';
                            timeRemaining = cycleTime - positionInCycle;
                        }
                    }

                    newCountdowns[light.id] = Math.max(0, timeRemaining);
                } else {
                    // If no lastSignalChange, simulate based on light ID and current time
                    // This creates a staggered start pattern for different lights
                    const lightIdNum = parseInt(light.id.replace('TL', '')) || 1;
                    const cycleTime = light.cycleTime || 110;

                    // Start each light at a different point in the cycle based on its ID
                    const startOffset = (lightIdNum * 17) % cycleTime; // Use prime number for better distribution
                    const nowInSeconds = Math.floor(now / 1000);
                    const positionInCycle = (nowInSeconds + startOffset) % cycleTime;

                    let timeRemaining;
                    if (positionInCycle < (light.greenTime || 45)) {
                        timeRemaining = (light.greenTime || 45) - positionInCycle;
                    } else if (positionInCycle < (light.greenTime || 45) + (light.yellowTime || 5)) {
                        timeRemaining = (light.greenTime || 45) + (light.yellowTime || 5) - positionInCycle;
                    } else {
                        timeRemaining = cycleTime - positionInCycle;
                    }

                    newCountdowns[light.id] = Math.max(0, timeRemaining);
                }
            } else {
                // For emergency or non-operational lights
                newCountdowns[light.id] = null;
            }
        });

        setCountdowns(newCountdowns);
    }, [trafficLights]);

    const loadTrafficLights = async () => {
        try {
            const lights = await trafficLightsDB.getAllTrafficLights();
            setTrafficLights(lights);
            setLastUpdated(new Date().toISOString());
            updateCountdowns(); // Update countdowns immediately after loading
        } catch (error) {
            console.error('Error loading traffic lights:', error);
        }
    };

    const getSignalColor = (signal) => {
        switch (signal) {
            case 'red': return '#ef4444';
            case 'yellow': return '#f59e0b';
            case 'green': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getSignalText = (signal) => {
        switch (signal) {
            case 'red': return 'STOP';
            case 'yellow': return 'PREPARE';
            case 'green': return 'GO';
            default: return 'UNKNOWN';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'operational': return <FaCheckCircle style={{ color: '#10b981' }} />;
            case 'maintenance': return <FaExclamationTriangle style={{ color: '#f59e0b' }} />;
            case 'faulty': return <FaTimesCircle style={{ color: '#ef4444' }} />;
            default: return <FaTrafficLight style={{ color: '#6b7280' }} />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'operational': return 'Operational';
            case 'maintenance': return 'Under Maintenance';
            case 'faulty': return 'Faulty - Repair Needed';
            case 'offline': return 'Offline';
            default: return 'Unknown Status';
        }
    };

    // Get time remaining - FIXED
    const getTimeRemaining = (lightId) => {
        return countdowns[lightId] !== undefined && countdowns[lightId] !== null ? countdowns[lightId] : null;
    };

    const getAreaForLight = (location) => {
        if (location.includes('Model Town')) return 'model-town';
        if (location.includes('GT Road') || location.includes('PAP')) return 'gt-road';
        if (location.includes('Civil Lines')) return 'civil-lines';
        if (location.includes('Nakodar')) return 'nakodar-road';
        if (location.includes('Ladowali')) return 'ladowali';
        if (location.includes('Phagwara')) return 'phagwara';
        return 'other';
    };

    // Get next signal
    const getNextSignal = (currentSignal) => {
        switch (currentSignal) {
            case 'red': return 'GREEN';
            case 'green': return 'YELLOW';
            case 'yellow': return 'RED';
            default: return '--';
        }
    };

    // Get next signal time
    const getNextSignalTime = (light) => {
        const timeRemaining = getTimeRemaining(light.id);
        if (timeRemaining === null) return '--';

        const now = new Date();
        const nextTime = new Date(now.getTime() + timeRemaining * 1000);
        return nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    // Format time for display
    const formatTimeRemaining = (time) => {
        if (time === null) return '--';

        if (time < 60) {
            return `${Math.floor(time)}s`;
        }

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}m ${seconds}s`;
    };

    // Get current signal based on timing (for simulation)
    const getSimulatedCurrentSignal = (light, elapsedTime) => {
        const greenTime = light.greenTime || 45;
        const yellowTime = light.yellowTime || 5;
        const redTime = light.redTime || 60;
        const cycleTime = greenTime + yellowTime + redTime;

        const positionInCycle = elapsedTime % cycleTime;

        if (positionInCycle < greenTime) {
            return 'green';
        } else if (positionInCycle < greenTime + yellowTime) {
            return 'yellow';
        } else {
            return 'red';
        }
    };

    const filteredLights = trafficLights.filter(light => {
        if (activeFilter === 'emergency' && !light.emergencyMode) return false;
        if (activeFilter === 'maintenance' && light.status !== 'maintenance') return false;
        if (selectedArea !== 'all' && getAreaForLight(light.location) !== selectedArea) return false;
        return true;
    });

    const operationalCount = trafficLights.filter(l => l.status === 'operational').length;
    const emergencyCount = trafficLights.filter(l => l.emergencyMode).length;
    const maintenanceCount = trafficLights.filter(l => l.status === 'maintenance').length;

    const handleManualRefresh = async () => {
        await loadTrafficLights();
    };

    // Calculate system-wide auto-cycle status
    const autoCycleEnabled = trafficLights.some(light =>
        light.status === 'operational' && !light.emergencyMode
    );

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
                <Loader type="spinner" text="Loading Traffic Lights Status..." />
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
                            <FaTrafficLight style={{ color: '#10b981' }} />
                            Jalandhar Traffic Lights Live Status
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '16px' }}>
                            Real-time automatic updates of all traffic signals across Jalandhar
                        </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleManualRefresh}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#3b82f6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FaSync />
                                Refresh Now
                            </button>
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: autoRefresh ? '#ef4444' : '#10b981',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    minWidth: '140px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {autoRefresh ? 'Stop Auto-Refresh' : 'Start Auto-Refresh'}
                            </button>
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Loading...'}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        borderLeft: '4px solid #10b981',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Operational Signals</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{operationalCount}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>of {trafficLights.length} total</div>
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite'
                        }}></div>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        borderLeft: '4px solid #ef4444',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Emergency Mode</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{emergencyCount}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>lights in emergency</div>
                        {emergencyCount > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#ef4444',
                                borderRadius: '50%',
                                animation: 'pulse 1s infinite'
                            }}></div>
                        )}
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        borderLeft: '4px solid #f59e0b',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>Under Maintenance</div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{maintenanceCount}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>undergoing repairs</div>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        borderLeft: '4px solid #8b5cf6',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '5px' }}>System Status</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {dbConnected ? (
                                <>
                                    <FaDatabase style={{ color: '#10b981' }} />
                                    Live Data Connected
                                </>
                            ) : (
                                <>
                                    <FaSync style={{ color: '#f59e0b' }} />
                                    Reconnecting...
                                </>
                            )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
                            Updates: {autoRefresh ? 'Every 30s' : 'Manual'}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaMap style={{ color: '#64748b' }} />
                            <select
                                value={selectedArea}
                                onChange={(e) => setSelectedArea(e.target.value)}
                                style={{
                                    padding: '10px 15px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    minWidth: '180px',
                                    backgroundColor: '#f8fafc'
                                }}
                            >
                                {jalandharAreas.map(area => (
                                    <option key={area.value} value={area.value}>
                                        {area.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setActiveFilter('all')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: activeFilter === 'all' ? '#10b981' : '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: activeFilter === 'all' ? 'white' : '#475569',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                All Signals
                            </button>
                            <button
                                onClick={() => setActiveFilter('emergency')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: activeFilter === 'emergency' ? '#ef4444' : '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: activeFilter === 'emergency' ? 'white' : '#475569',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Emergency Mode
                            </button>
                            <button
                                onClick={() => setActiveFilter('maintenance')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: activeFilter === 'maintenance' ? '#f59e0b' : '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: activeFilter === 'maintenance' ? 'white' : '#475569',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Maintenance
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Traffic Lights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {filteredLights.map((light) => {
                    const timeRemaining = getTimeRemaining(light.id);
                    const showCountdown = timeRemaining !== null && light.status === 'operational' && !light.emergencyMode;

                    return (
                        <div
                            key={light.id}
                            style={{
                                padding: '25px',
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: light.emergencyMode ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {light.emergencyMode && (
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    padding: '5px 15px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    borderBottomLeftRadius: '8px',
                                    animation: 'pulse 1s infinite'
                                }}>
                                    EMERGENCY
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '18px' }}>
                                        {light.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '5px' }}>
                                        <FaMapMarkerAlt size={12} />
                                        {light.location}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                                        {getStatusIcon(light.status)}
                                        {getStatusText(light.status)}
                                    </div>
                                </div>

                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    backgroundColor: getSignalColor(light.currentSignal),
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    textTransform: 'uppercase',
                                    boxShadow: `0 0 25px ${getSignalColor(light.currentSignal)}80`,
                                    animation: showCountdown && timeRemaining <= 5 ? 'pulse 0.5s ease-in-out infinite' : 'none'
                                }}>
                                    <div style={{ fontSize: '12px', opacity: 0.9 }}>SIGNAL</div>
                                    <div style={{ fontSize: '18px', margin: '5px 0' }}>{light.currentSignal}</div>
                                    <div style={{ fontSize: '11px', opacity: 0.9 }}>{getSignalText(light.currentSignal)}</div>
                                </div>
                            </div>

                            {/* Timing Information - FIXED COUNTDOWN */}
                            <div style={{
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '15px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '14px' }}>
                                        <FaClock />
                                        Automatic Timing Cycle
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        Total: {light.cycleTime || 110}s
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: light.currentSignal === 'red' ? '#fee2e2' : '#fef2f2',
                                        borderRadius: '6px',
                                        border: light.currentSignal === 'red' ? '2px solid #ef4444' : '1px solid #fecaca',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#dc2626' }}>Red</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{light.redTime || 60}s</div>
                                        {light.currentSignal === 'red' && showCountdown && (
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#ef4444',
                                                marginTop: '5px',
                                                fontWeight: '600',
                                                animation: timeRemaining <= 10 ? 'pulse 0.5s ease-in-out infinite' : 'none'
                                            }}>
                                                {Math.floor(timeRemaining)}s left
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: light.currentSignal === 'yellow' ? '#fef3c7' : '#fef3c7',
                                        borderRadius: '6px',
                                        border: light.currentSignal === 'yellow' ? '2px solid #f59e0b' : '1px solid #fde68a',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#92400e' }}>Yellow</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{light.yellowTime || 5}s</div>
                                        {light.currentSignal === 'yellow' && showCountdown && (
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#f59e0b',
                                                marginTop: '5px',
                                                fontWeight: '600',
                                                animation: 'pulse 0.5s ease-in-out infinite'
                                            }}>
                                                {Math.floor(timeRemaining)}s left
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: light.currentSignal === 'green' ? '#dcfce7' : '#dcfce7',
                                        borderRadius: '6px',
                                        border: light.currentSignal === 'green' ? '2px solid #10b981' : '1px solid #bbf7d0',
                                        transition: 'all 0.3s'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#166534' }}>Green</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{light.greenTime || 45}s</div>
                                        {light.currentSignal === 'green' && showCountdown && (
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#10b981',
                                                marginTop: '5px',
                                                fontWeight: '600',
                                                animation: timeRemaining <= 10 ? 'pulse 0.5s ease-in-out infinite' : 'none'
                                            }}>
                                                {Math.floor(timeRemaining)}s left
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Countdown Timer - WORKING NOW */}
                                <div style={{ textAlign: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                                        {light.emergencyMode ? 'Emergency Mode Active' :
                                            light.status !== 'operational' ? 'Light Not Operational' :
                                                'Time remaining for current signal:'}
                                    </div>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: '700',
                                        color: showCountdown ? getSignalColor(light.currentSignal) : '#94a3b8',
                                        animation: showCountdown && timeRemaining <= 5 ? 'pulse 1s ease-in-out infinite' : 'none',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {showCountdown ? (
                                            <span>
                                                {Math.floor(timeRemaining)} seconds
                                            </span>
                                        ) : '--'}
                                    </div>
                                    {showCountdown && (
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '5px' }}>
                                            Next signal: {getNextSignal(light.currentSignal)} at {getNextSignalTime(light)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Advice */}
                            <div style={{
                                backgroundColor: light.currentSignal === 'red' ? '#fef2f2' :
                                    light.currentSignal === 'yellow' ? '#fef3c7' : '#dcfce7',
                                borderRadius: '8px',
                                padding: '15px',
                                borderLeft: `4px solid ${getSignalColor(light.currentSignal)}`,
                                transition: 'all 0.3s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    {light.currentSignal === 'red' ? <FaCar style={{ color: '#dc2626' }} /> :
                                        light.currentSignal === 'yellow' ? <FaExclamationTriangle style={{ color: '#92400e' }} /> :
                                            <FaWalking style={{ color: '#166534' }} />}
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                        {light.currentSignal === 'red' ? 'Drivers: STOP' :
                                            light.currentSignal === 'yellow' ? 'Drivers: PREPARE TO STOP' :
                                                'Drivers: PROCEED WITH CAUTION'}
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#475569' }}>
                                    {light.currentSignal === 'red' ?
                                        showCountdown ?
                                            `Please stop at the line. Green signal in ${Math.floor(timeRemaining)} seconds.` :
                                            'Please stop at the line. Wait for green signal.' :
                                        light.currentSignal === 'yellow' ?
                                            showCountdown ?
                                                `Signal will change to red in ${Math.floor(timeRemaining)} seconds. Slow down.` :
                                                'Signal will change to red soon. Slow down.' :
                                            showCountdown ?
                                                `You may proceed carefully for ${Math.floor(timeRemaining)} more seconds.` :
                                                'You may proceed through the intersection carefully.'}
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div style={{ marginTop: '15px', fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                                <div>Light ID: {light.id}</div>
                                <div style={{ textAlign: 'right' }}>
                                    <div>Updated: {light.lastUpdated ? new Date(light.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                                    {light.lastSignalChange && (
                                        <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                                            Last signal: {new Date(light.lastSignalChange).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredLights.length === 0 && (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '60px 20px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '2px dashed #e2e8f0'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <FaTrafficLight size={32} color="#94a3b8" />
                        </div>
                        <h3 style={{ color: '#64748b', marginBottom: '10px', fontSize: '20px' }}>
                            No Traffic Lights Found
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '500px', margin: '0 auto 20px' }}>
                            {selectedArea !== 'all' ?
                                `No traffic lights found in ${jalandharAreas.find(a => a.value === selectedArea)?.label}` :
                                'No traffic lights match the current filter'}
                        </p>
                        <button
                            onClick={() => {
                                setSelectedArea('all');
                                setActiveFilter('all');
                            }}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#3b82f6',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '16px'
                            }}
                        >
                            Show All Traffic Lights
                        </button>
                    </div>
                )}
            </div>

            {/* Legend and Information */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '25px',
                marginTop: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginBottom: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaInfoCircle />
                    Live Traffic Lights Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div>
                        <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '16px' }}>Real-time Features:</h4>
                        <ul style={{ color: '#475569', paddingLeft: '20px' }}>
                            <li>Automatic signal changes every second</li>
                            <li>Live countdown timers for each signal</li>
                            <li>Auto-refresh every 30 seconds</li>
                            <li>Database connection monitoring</li>
                            <li>Emergency mode detection</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '16px' }}>Signal Timings:</h4>
                        <ul style={{ color: '#475569', paddingLeft: '20px' }}>
                            <li>Red Signal: 60 seconds</li>
                            <li>Yellow Signal: 5 seconds</li>
                            <li>Green Signal: 45 seconds</li>
                            <li>Total Cycle: 110 seconds</li>
                            <li>Countdowns update every second</li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '10px', color: '#475569', fontSize: '16px' }}>System Status:</h4>
                        <ul style={{ color: '#475569', paddingLeft: '20px' }}>
                            <li>Auto-cycle: {autoCycleEnabled ? 'ACTIVE' : 'PAUSED'}</li>
                            <li>Database: {dbConnected ? 'CONNECTED' : 'DISCONNECTED'}</li>
                            <li>Auto-refresh: {autoRefresh ? 'ENABLED (30s)' : 'DISABLED'}</li>
                            <li>Total lights monitored: {trafficLights.length}</li>
                            <li>Last update: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}</li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    marginTop: '25px',
                    padding: '15px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    borderLeft: '4px solid #0ea5e9'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <FaExclamationTriangle style={{ color: '#0ea5e9' }} />
                        <strong style={{ color: '#1e293b' }}>Automatic System Notice:</strong>
                    </div>
                    <p style={{ color: '#475569', margin: 0, fontSize: '14px' }}>
                        This system provides real-time, automatic updates of all traffic signals in Jalandhar.
                        Signals change automatically based on configured timing cycles (Red: 60s, Yellow: 5s, Green: 45s).
                        Emergency mode overrides automatic cycles and forces red signals.
                        Always follow on-ground traffic police instructions as they take precedence over automated signals.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '30px',
                textAlign: 'center',
                padding: '20px',
                color: '#94a3b8',
                fontSize: '14px',
                borderTop: '1px solid #e2e8f0'
            }}>
                <p>Jalandhar Smart Traffic Management System • December 2025</p>
                <p style={{ fontSize: '12px', marginTop: '5px' }}>
                    Data Source: Jalandhar Traffic Control Center • Updates: {autoRefresh ? 'Auto (30s)' : 'Manual'} • Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
                </p>
            </div>

            {/* CSS Animations */}
            <style>
                {`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                `}
            </style>
        </div >
    );
};

export default TrafficLightsStatus;