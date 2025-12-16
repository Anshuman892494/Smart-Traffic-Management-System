import React, { useState, useEffect } from 'react';
import {
    FaTrafficLight,
    FaEdit,
    FaSave,
    FaTrash,
    FaPlay,
    FaPause,
    FaClock,
    FaMapMarkerAlt,
    FaCog,
    FaHistory,
    FaDownload,
    FaUpload,
    FaSync,
    FaPowerOff,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaRedo,
    FaCalendar,
    FaChartLine,
    FaDatabase,
    FaStop,
    FaCar,
    FaWalking,
    FaInfoCircle,
    FaArrowLeft,
    FaArrowRight
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import trafficLightsDB from '../../services/trafficDB';
import Loader from '../../components/common/Loader';
import '../../styles/main.css';

const TrafficLights = () => {
    const { user } = useAuth();
    const [trafficLights, setTrafficLights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dbInitialized, setDbInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState('lights');
    const [selectedLight, setSelectedLight] = useState(null);
    const [editingLight, setEditingLight] = useState(null);
    const [showAddPattern, setShowAddPattern] = useState(false);
    const [trafficPatterns, setTrafficPatterns] = useState([]);
    const [trafficLogs, setTrafficLogs] = useState([]);
    const [newPattern, setNewPattern] = useState({
        name: '',
        description: '',
        schedule: [],
        isActive: false
    });

    // Countdown timers and auto-cycle state
    const [countdowns, setCountdowns] = useState({});
    const [autoCycleEnabled, setAutoCycleEnabled] = useState(true);
    const [lastCycleUpdate, setLastCycleUpdate] = useState(null);

    // Jalandhar locations for reference
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
        'Bus Stand Junction, Jalandhar'
    ];

    // Initialize database and load data
    useEffect(() => {
        const initializeDB = async () => {
            try {
                await trafficLightsDB.init();
                setDbInitialized(true);
                await trafficLightsDB.initializeDefaultLights();
                await loadAllData();

                // Add cycle listener for real-time updates
                trafficLightsDB.addCycleListener(handleCycleUpdates);
            } catch (error) {
                console.error('Failed to initialize database:', error);
                alert('Failed to initialize traffic lights database. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        initializeDB();

        // Set up countdown timer interval
        const countdownInterval = setInterval(() => {
            updateCountdowns();
        }, 1000);

        return () => {
            clearInterval(countdownInterval);
            trafficLightsDB.removeCycleListener(handleCycleUpdates);
        };
    }, []);

    // Handle cycle updates from database
    const handleCycleUpdates = (updates) => {
        console.log('Auto-cycle updates:', updates);
        setLastCycleUpdate(new Date().toISOString());
        loadTrafficLights();
    };

    // Update countdown timers
    const updateCountdowns = () => {
        const newCountdowns = {};

        trafficLights.forEach(light => {
            if (light.status === 'operational' && !light.emergencyMode && autoCycleEnabled) {
                const lastChange = light.lastSignalChange ? new Date(light.lastSignalChange).getTime() : Date.now();
                const elapsedSeconds = Math.floor((Date.now() - lastChange) / 1000);

                let timeRemaining;
                switch (light.currentSignal) {
                    case 'green':
                        timeRemaining = Math.max(0, (light.greenTime || 45) - elapsedSeconds);
                        break;
                    case 'yellow':
                        timeRemaining = Math.max(0, (light.yellowTime || 5) - elapsedSeconds);
                        break;
                    case 'red':
                        timeRemaining = Math.max(0, (light.redTime || 60) - elapsedSeconds);
                        break;
                    default:
                        timeRemaining = 0;
                }

                newCountdowns[light.id] = timeRemaining;
            } else {
                newCountdowns[light.id] = null;
            }
        });

        setCountdowns(newCountdowns);
    };

    const loadAllData = async () => {
        await loadTrafficLights();
        await loadTrafficPatterns();
        await loadTrafficLogs();
    };

    const loadTrafficLights = async () => {
        try {
            const lights = await trafficLightsDB.getAllTrafficLights();
            setTrafficLights(lights);
            updateCountdowns(); // Update countdowns after loading
        } catch (error) {
            console.error('Error loading traffic lights:', error);
        }
    };

    const loadTrafficPatterns = async () => {
        try {
            const patterns = await trafficLightsDB.getAllTrafficPatterns();
            setTrafficPatterns(patterns);
        } catch (error) {
            console.error('Error loading traffic patterns:', error);
        }
    };

    const loadTrafficLogs = async () => {
        try {
            const logs = await trafficLightsDB.getTrafficLogs(50);
            setTrafficLogs(logs);
        } catch (error) {
            console.error('Error loading traffic logs:', error);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'operational': return '#10b981';
            case 'maintenance': return '#f59e0b';
            case 'faulty': return '#ef4444';
            case 'offline': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getNextSignal = (currentSignal) => {
        switch (currentSignal) {
            case 'green': return 'yellow';
            case 'yellow': return 'red';
            case 'red': return 'green';
            default: return 'green';
        }
    };

    const handleChangeSignal = async (lightId, signal) => {
        try {
            await trafficLightsDB.updateTrafficLight(lightId, {
                currentSignal: signal,
                lastSignalChange: new Date().toISOString()
            });
            await loadTrafficLights();
            alert(`Signal changed to ${signal.toUpperCase()} for light ${lightId}`);
        } catch (error) {
            console.error('Error changing signal:', error);
            alert('Failed to change signal. Please try again.');
        }
    };

    const handleAdvanceSignal = async (lightId) => {
        const light = trafficLights.find(l => l.id === lightId);
        if (!light) return;

        const nextSignal = getNextSignal(light.currentSignal);
        await handleChangeSignal(lightId, nextSignal);
    };

    const handleToggleEmergency = async (lightId) => {
        const light = trafficLights.find(l => l.id === lightId);
        if (!light) return;

        try {
            await trafficLightsDB.updateTrafficLight(lightId, {
                emergencyMode: !light.emergencyMode,
                currentSignal: !light.emergencyMode ? 'red' : light.currentSignal
            });
            await loadTrafficLights();
            alert(`Emergency mode ${!light.emergencyMode ? 'activated' : 'deactivated'} for light ${lightId}`);
        } catch (error) {
            console.error('Error toggling emergency mode:', error);
            alert('Failed to toggle emergency mode. Please try again.');
        }
    };

    const handleEditLight = (light) => {
        setEditingLight({ ...light });
        setSelectedLight(light.id);
    };

    const handleSaveLight = async () => {
        if (!editingLight) return;

        try {
            await trafficLightsDB.updateTrafficLight(editingLight.id, {
                redTime: parseInt(editingLight.redTime) || 60,
                yellowTime: parseInt(editingLight.yellowTime) || 5,
                greenTime: parseInt(editingLight.greenTime) || 45,
                cycleTime: (parseInt(editingLight.redTime) || 60) +
                    (parseInt(editingLight.yellowTime) || 5) +
                    (parseInt(editingLight.greenTime) || 45),
                status: editingLight.status,
                nextMaintenance: editingLight.nextMaintenance
            });

            setEditingLight(null);
            setSelectedLight(null);
            await loadTrafficLights();
            alert('Traffic light settings updated successfully');
        } catch (error) {
            console.error('Error saving light:', error);
            alert('Failed to save changes. Please try again.');
        }
    };

    const handleAddPattern = async () => {
        if (!newPattern.name.trim()) {
            alert('Please enter a pattern name');
            return;
        }

        try {
            await trafficLightsDB.addTrafficPattern(newPattern);
            setNewPattern({
                name: '',
                description: '',
                schedule: [],
                isActive: false
            });
            setShowAddPattern(false);
            await loadTrafficPatterns();
            alert('Traffic pattern added successfully');
        } catch (error) {
            console.error('Error adding pattern:', error);
            alert('Failed to add pattern. Please try again.');
        }
    };

    const handleApplyPattern = async (patternId) => {
        try {
            // Apply pattern to all lights
            const updates = trafficLights.map(light => ({
                ...light,
                patternId: patternId,
                lastUpdated: new Date().toISOString()
            }));

            for (const light of updates) {
                await trafficLightsDB.updateTrafficLight(light.id, { patternId: patternId });
            }

            await loadTrafficLights();
            alert('Pattern applied to all traffic lights');
        } catch (error) {
            console.error('Error applying pattern:', error);
            alert('Failed to apply pattern. Please try again.');
        }
    };

    const handleManualOverride = async (lightId, timeConfig) => {
        try {
            await trafficLightsDB.updateTrafficLight(lightId, {
                ...timeConfig,
                patternId: null, // Remove pattern when manually overriding
                lastUpdated: new Date().toISOString(),
                lastSignalChange: new Date().toISOString() // Reset the cycle
            });
            await loadTrafficLights();
            alert('Manual override applied successfully');
        } catch (error) {
            console.error('Error applying manual override:', error);
            alert('Failed to apply manual override. Please try again.');
        }
    };

    const handleToggleAutoCycle = async () => {
        if (!autoCycleEnabled) {
            // When enabling auto-cycle, reset all signals to start fresh cycle
            if (window.confirm('Enable auto-cycling? This will reset all signal timers.')) {
                try {
                    for (const light of trafficLights) {
                        if (light.status === 'operational' && !light.emergencyMode) {
                            await trafficLightsDB.updateTrafficLight(light.id, {
                                lastSignalChange: new Date().toISOString()
                            });
                        }
                    }
                    setAutoCycleEnabled(true);
                    await loadTrafficLights();
                    alert('Auto-cycling enabled. All timers reset.');
                } catch (error) {
                    console.error('Error enabling auto-cycle:', error);
                    alert('Failed to enable auto-cycle. Please try again.');
                }
            }
        } else {
            if (window.confirm('Disable auto-cycling? Signals will stop changing automatically.')) {
                setAutoCycleEnabled(false);
                alert('Auto-cycling disabled.');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTimeSince = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const exportData = () => {
        const data = {
            trafficLights,
            trafficPatterns,
            trafficLogs,
            exportedAt: new Date().toISOString(),
            exportedBy: user?.fullName || 'Admin',
            autoCycleEnabled,
            settings: {
                defaultRedTime: 60,
                defaultYellowTime: 5,
                defaultGreenTime: 45,
                cycleCheckInterval: 1000
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `traffic-lights-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Data exported successfully!');
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
                <Loader type="spinner" text="Loading Traffic Lights System..." />
            </div>
        );
    }

    return (
        <div>

            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaTrafficLight style={{ color: '#10b981' }} />
                            Jalandhar Traffic Lights Control
                        </h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Control and monitor all traffic signals in Jalandhar, Punjab
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginTop: '10px',
                            fontSize: '14px',
                            color: '#64748b'
                        }}>
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: autoCycleEnabled ? '#dcfce7' : '#fef2f2',
                                color: autoCycleEnabled ? '#166534' : '#dc2626',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: autoCycleEnabled ? '#bbf7d0' : '#fecaca',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                {autoCycleEnabled ? <FaPlay size={12} /> : <FaPause size={12} />}
                                Auto-Cycle: {autoCycleEnabled ? 'ON' : 'OFF'}
                            </span>
                            {lastCycleUpdate && (
                                <span>
                                    Last auto-change: {formatTimeSince(lastCycleUpdate)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={exportData}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaDownload />
                            Export Data
                        </button>
                        <button
                            className="btn"
                            onClick={loadAllData}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaSync />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: '#10b981'
                            }}>
                                <FaTrafficLight size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Total Lights</div>
                                <div className="stat-value">{trafficLights.length}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                            {trafficLights.filter(l => l.status === 'operational').length} operational
                        </div>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: '#ef4444'
                            }}>
                                <FaExclamationTriangle size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Active Emergencies</div>
                                <div className="stat-value">
                                    {trafficLights.filter(l => l.emergencyMode).length}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                            Emergency mode active
                        </div>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: '#f59e0b'
                            }}>
                                <FaClock size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Auto-Cycle Status</div>
                                <div className="stat-value" style={{ color: autoCycleEnabled ? '#10b981' : '#ef4444' }}>
                                    {autoCycleEnabled ? 'ACTIVE' : 'PAUSED'}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                            Signals change automatically
                        </div>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: '#8b5cf6'
                            }}>
                                <FaChartLine size={24} />
                            </div>
                            <div>
                                <div className="stat-label">System Health</div>
                                <div className="stat-value">
                                    {trafficLights.length > 0
                                        ? Math.round((trafficLights.filter(l => l.status === 'operational').length / trafficLights.length) * 100)
                                        : 100}%
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                            Operational rate
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-Cycle Control Bar */}
            <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f0f9ff', borderColor: '#0ea5e9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaSync style={{ color: '#0ea5e9' }} />
                        <div>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>Automatic Signal Cycling</h3>
                            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                                Signals automatically change based on configured timings
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleToggleAutoCycle}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: autoCycleEnabled ? '#ef4444' : '#10b981',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                minWidth: '140px'
                            }}
                        >
                            {autoCycleEnabled ? (
                                <>
                                    <FaPause />
                                    Pause Auto-Cycle
                                </>
                            ) : (
                                <>
                                    <FaPlay />
                                    Start Auto-Cycle
                                </>
                            )}
                        </button>

                        <button
                            onClick={async () => {
                                if (window.confirm('Force immediate signal change for all operational lights?')) {
                                    try {
                                        for (const light of trafficLights) {
                                            if (light.status === 'operational' && !light.emergencyMode) {
                                                const nextSignal = getNextSignal(light.currentSignal);
                                                await trafficLightsDB.updateTrafficLight(light.id, {
                                                    currentSignal: nextSignal,
                                                    lastSignalChange: new Date().toISOString()
                                                });
                                            }
                                        }
                                        await loadTrafficLights();
                                        alert('All signals advanced to next phase');
                                    } catch (error) {
                                        console.error('Error advancing signals:', error);
                                        alert('Failed to advance signals');
                                    }
                                }
                            }}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#8b5cf6',
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
                            <FaArrowRight />
                            Advance All Signals
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--gray-200)',
                marginBottom: '20px',
                gap: '5px'
            }}>
                <button
                    onClick={() => setActiveTab('lights')}
                    style={{
                        padding: '12px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: `3px solid ${activeTab === 'lights' ? '#10b981' : 'transparent'}`,
                        color: activeTab === 'lights' ? '#10b981' : 'var(--gray-600)',
                        fontWeight: activeTab === 'lights' ? '600' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FaTrafficLight />
                    Traffic Lights
                </button>
                <button
                    onClick={() => setActiveTab('patterns')}
                    style={{
                        padding: '12px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: `3px solid ${activeTab === 'patterns' ? '#10b981' : 'transparent'}`,
                        color: activeTab === 'patterns' ? '#10b981' : 'var(--gray-600)',
                        fontWeight: activeTab === 'patterns' ? '600' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FaCog />
                    Patterns
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    style={{
                        padding: '12px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: `3px solid ${activeTab === 'logs' ? '#10b981' : 'transparent'}`,
                        color: activeTab === 'logs' ? '#10b981' : 'var(--gray-600)',
                        fontWeight: activeTab === 'logs' ? '600' : '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FaHistory />
                    Change Logs
                </button>
            </div>

            {/* Traffic Lights Tab */}
            {activeTab === 'lights' && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaTrafficLight />
                            Jalandhar Traffic Lights Control Panel
                        </h3>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                            Last updated: {trafficLights[0]?.lastUpdated ? formatDate(trafficLights[0].lastUpdated) : 'N/A'}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {trafficLights.map((light) => (
                            <div
                                key={light.id}
                                style={{
                                    padding: '20px',
                                    border: `2px solid ${selectedLight === light.id ? '#10b981' : '#e2e8f0'}`,
                                    borderRadius: '12px',
                                    backgroundColor: light.emergencyMode ? '#fef2f2' : 'white',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s',
                                    opacity: light.status !== 'operational' ? 0.7 : 1
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                            <h4 style={{ margin: 0, color: '#1e293b' }}>{light.name}</h4>
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: getStatusColor(light.status) + '20',
                                                color: getStatusColor(light.status),
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                {light.status?.toUpperCase()}
                                            </span>
                                            {light.emergencyMode && (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#fee2e2',
                                                    color: '#dc2626',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '600'
                                                }}>
                                                    EMERGENCY
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '14px' }}>
                                            <FaMapMarkerAlt size={12} />
                                            {light.location}
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            backgroundColor: getSignalColor(light.currentSignal),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            textTransform: 'uppercase',
                                            boxShadow: `0 0 20px ${getSignalColor(light.currentSignal)}80`,
                                            animation: countdowns[light.id] <= 5 ? 'pulse 0.5s ease-in-out infinite' : 'none'
                                        }}>
                                            {light.currentSignal}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            ID: {light.id}
                                        </div>
                                    </div>
                                </div>

                                {/* Signal Controls */}
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '14px', color: '#475569', marginBottom: '10px', fontWeight: '500' }}>
                                        Manual Signal Control:
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => handleChangeSignal(light.id, 'red')}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: light.currentSignal === 'red' ? '#ef4444' : '#fef2f2',
                                                border: '1px solid #fecaca',
                                                borderRadius: '6px',
                                                color: light.currentSignal === 'red' ? 'white' : '#dc2626',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            RED
                                        </button>
                                        <button
                                            onClick={() => handleChangeSignal(light.id, 'yellow')}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: light.currentSignal === 'yellow' ? '#f59e0b' : '#fef3c7',
                                                border: '1px solid #fde68a',
                                                borderRadius: '6px',
                                                color: light.currentSignal === 'yellow' ? 'white' : '#92400e',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            YELLOW
                                        </button>
                                        <button
                                            onClick={() => handleChangeSignal(light.id, 'green')}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                backgroundColor: light.currentSignal === 'green' ? '#10b981' : '#dcfce7',
                                                border: '1px solid #bbf7d0',
                                                borderRadius: '6px',
                                                color: light.currentSignal === 'green' ? 'white' : '#166534',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            GREEN
                                        </button>
                                    </div>
                                </div>

                                {/* Timing Information with Countdown */}
                                {selectedLight === light.id && editingLight ? (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '14px', color: '#475569', marginBottom: '10px', fontWeight: '500' }}>
                                            Edit Timing Settings:
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                                                    Red Time (s)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editingLight.redTime}
                                                    onChange={(e) => setEditingLight({ ...editingLight, redTime: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px'
                                                    }}
                                                    min="10"
                                                    max="120"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                                                    Yellow Time (s)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editingLight.yellowTime}
                                                    onChange={(e) => setEditingLight({ ...editingLight, yellowTime: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px'
                                                    }}
                                                    min="3"
                                                    max="10"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                                                    Green Time (s)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={editingLight.greenTime}
                                                    onChange={(e) => setEditingLight({ ...editingLight, greenTime: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '6px',
                                                        fontSize: '14px'
                                                    }}
                                                    min="10"
                                                    max="120"
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={handleSaveLight}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    backgroundColor: '#10b981',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <FaSave />
                                                Save Changes
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingLight(null);
                                                    setSelectedLight(null);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    backgroundColor: '#f1f5f9',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    color: '#475569',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '14px', color: '#475569', marginBottom: '10px', fontWeight: '500' }}>
                                            Current Timing (Auto-Cycle: {autoCycleEnabled ? 'ON' : 'OFF'}):
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                                            <div style={{
                                                padding: '10px',
                                                backgroundColor: light.currentSignal === 'red' ? '#fee2e2' : '#fef2f2',
                                                borderRadius: '6px',
                                                border: light.currentSignal === 'red' ? '2px solid #ef4444' : '1px solid #fecaca'
                                            }}>
                                                <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '5px' }}>Red</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{light.redTime || 60}s</div>
                                                {light.currentSignal === 'red' && autoCycleEnabled && countdowns[light.id] !== null && (
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: '#ef4444',
                                                        marginTop: '5px',
                                                        fontWeight: '600',
                                                        animation: countdowns[light.id] <= 10 ? 'pulse 0.5s ease-in-out infinite' : 'none'
                                                    }}>
                                                        {countdowns[light.id]}s left
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{
                                                padding: '10px',
                                                backgroundColor: light.currentSignal === 'yellow' ? '#fef3c7' : '#fef3c7',
                                                borderRadius: '6px',
                                                border: light.currentSignal === 'yellow' ? '2px solid #f59e0b' : '1px solid #fde68a'
                                            }}>
                                                <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '5px' }}>Yellow</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{light.yellowTime || 5}s</div>
                                                {light.currentSignal === 'yellow' && autoCycleEnabled && countdowns[light.id] !== null && (
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: '#f59e0b',
                                                        marginTop: '5px',
                                                        fontWeight: '600',
                                                        animation: 'pulse 0.5s ease-in-out infinite'
                                                    }}>
                                                        {countdowns[light.id]}s left
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{
                                                padding: '10px',
                                                backgroundColor: light.currentSignal === 'green' ? '#dcfce7' : '#dcfce7',
                                                borderRadius: '6px',
                                                border: light.currentSignal === 'green' ? '2px solid #10b981' : '1px solid #bbf7d0'
                                            }}>
                                                <div style={{ fontSize: '12px', color: '#166534', marginBottom: '5px' }}>Green</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{light.greenTime || 45}s</div>
                                                {light.currentSignal === 'green' && autoCycleEnabled && countdowns[light.id] !== null && (
                                                    <div style={{
                                                        fontSize: '11px',
                                                        color: '#10b981',
                                                        marginTop: '5px',
                                                        fontWeight: '600',
                                                        animation: countdowns[light.id] <= 10 ? 'pulse 0.5s ease-in-out infinite' : 'none'
                                                    }}>
                                                        {countdowns[light.id]}s left
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                                            Total Cycle: {light.cycleTime || 110}s • Last change: {light.lastSignalChange ? formatTimeSince(light.lastSignalChange) : 'N/A'}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => handleEditLight(light)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <FaEdit />
                                        Edit Timing
                                    </button>
                                    <button
                                        onClick={() => handleAdvanceSignal(light.id)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#8b5cf6',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                        disabled={!autoCycleEnabled && light.emergencyMode}
                                    >
                                        <FaArrowRight />
                                        Advance Signal
                                    </button>
                                    <button
                                        onClick={() => handleToggleEmergency(light.id)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: light.emergencyMode ? '#10b981' : '#ef4444',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <FaExclamationTriangle />
                                        {light.emergencyMode ? 'Normal' : 'Emergency'}
                                    </button>
                                </div>

                                {/* Manual Override Section */}
                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                                    <button
                                        onClick={() => {
                                            const redTime = prompt('Enter red time (seconds):', light.redTime || 60);
                                            const yellowTime = prompt('Enter yellow time (seconds):', light.yellowTime || 5);
                                            const greenTime = prompt('Enter green time (seconds):', light.greenTime || 45);

                                            if (redTime && yellowTime && greenTime) {
                                                handleManualOverride(light.id, {
                                                    redTime: parseInt(redTime),
                                                    yellowTime: parseInt(yellowTime),
                                                    greenTime: parseInt(greenTime),
                                                    cycleTime: parseInt(redTime) + parseInt(yellowTime) + parseInt(greenTime)
                                                });
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: '#f59e0b',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <FaClock />
                                        Manual Timing Override
                                    </button>
                                </div>

                                {/* Maintenance Info */}
                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Last Maintenance:</span>
                                            <span style={{ fontWeight: '500' }}>{light.lastMaintenance || '2025-12-01'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                            <span>Next Maintenance:</span>
                                            <span style={{ fontWeight: '500' }}>{light.nextMaintenance || '2026-01-01'}</span>
                                        </div>
                                        {light.patternId && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                                <span>Active Pattern:</span>
                                                <span style={{ fontWeight: '500' }}>{light.patternId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Patterns Tab */}
            {activeTab === 'patterns' && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaCog />
                            Traffic Patterns & Schedules
                        </h3>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddPattern(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaCog />
                            Add New Pattern
                        </button>
                    </div>

                    {/* Add Pattern Modal */}
                    {showAddPattern && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                width: '100%',
                                maxWidth: '500px',
                                padding: '20px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                            }}>
                                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaCog />
                                    Add Traffic Pattern
                                </h3>

                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                            Pattern Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={newPattern.name}
                                            onChange={(e) => setNewPattern({ ...newPattern, name: e.target.value })}
                                            placeholder="e.g., Peak Hours, Night Mode, Weekend"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                            Description
                                        </label>
                                        <textarea
                                            value={newPattern.description}
                                            onChange={(e) => setNewPattern({ ...newPattern, description: e.target.value })}
                                            placeholder="Describe this pattern..."
                                            rows="3"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                            <input
                                                type="checkbox"
                                                checked={newPattern.isActive}
                                                onChange={(e) => setNewPattern({ ...newPattern, isActive: e.target.checked })}
                                                style={{ marginRight: '8px' }}
                                            />
                                            Set as Active Pattern
                                        </label>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button
                                            onClick={handleAddPattern}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                backgroundColor: '#10b981',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Save Pattern
                                        </button>
                                        <button
                                            onClick={() => setShowAddPattern(false)}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                backgroundColor: '#f1f5f9',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                color: '#475569',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {trafficPatterns.map((pattern) => (
                            <div
                                key={pattern.id}
                                style={{
                                    padding: '20px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    backgroundColor: pattern.isActive ? '#f0f9ff' : 'white'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#1e293b' }}>{pattern.name}</h4>
                                        {pattern.isActive && (
                                            <span style={{
                                                padding: '2px 8px',
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                borderRadius: '12px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                marginLeft: '10px'
                                            }}>
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleApplyPattern(pattern.id)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>

                                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>
                                    {pattern.description || 'No description provided'}
                                </p>

                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    <div>Created: {formatDate(pattern.createdAt)}</div>
                                    {pattern.updatedAt && <div>Updated: {formatDate(pattern.updatedAt)}</div>}
                                </div>
                            </div>
                        ))}

                        {trafficPatterns.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', gridColumn: '1 / -1' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 15px'
                                }}>
                                    <FaCog size={24} color="#94a3b8" />
                                </div>
                                <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No Patterns Created</h3>
                                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                    Create traffic patterns to automate signal timing
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div className="card">
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaHistory />
                        Traffic Light Change Logs
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ fontSize: '14px' }}>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Traffic Light</th>
                                    <th>Changes</th>
                                    <th>Changed By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trafficLogs.map((log, index) => {
                                    const light = trafficLights.find(l => l.id === log.lightId);
                                    return (
                                        <tr key={log.id}>
                                            <td>{formatDate(log.timestamp)}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FaTrafficLight style={{ color: '#10b981' }} />
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{light?.name || 'Unknown'}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {log.lightId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                    {Object.entries(log.changes || {}).map(([key, value]) => (
                                                        <span
                                                            key={key}
                                                            style={{
                                                                padding: '2px 6px',
                                                                backgroundColor: '#f1f5f9',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                color: '#475569'
                                                            }}
                                                        >
                                                            {key}: {JSON.stringify(value)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '2px 6px',
                                                    backgroundColor: log.changedBy === 'system' ? '#dcfce7' : '#dbeafe',
                                                    color: log.changedBy === 'system' ? '#166534' : '#1e40af',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    {log.changedBy === 'system' ? 'Auto-Cycle' : log.changedBy || 'admin'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {trafficLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 15px'
                                            }}>
                                                <FaHistory size={24} color="#94a3b8" />
                                            </div>
                                            <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No Change Logs</h3>
                                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                                Changes to traffic lights will appear here
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCog />
                    System Control
                </h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-danger"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={async () => {
                            if (window.confirm('Activate emergency mode for ALL traffic lights?')) {
                                try {
                                    for (const light of trafficLights) {
                                        await trafficLightsDB.updateTrafficLight(light.id, {
                                            emergencyMode: true,
                                            currentSignal: 'red',
                                            lastSignalChange: new Date().toISOString()
                                        });
                                    }
                                    await loadTrafficLights();
                                    alert('Emergency mode activated for all lights');
                                } catch (error) {
                                    console.error('Error activating emergency mode:', error);
                                    alert('Failed to activate emergency mode');
                                }
                            }
                        }}
                    >
                        <FaExclamationTriangle />
                        All Emergency Mode
                    </button>

                    <button
                        className="btn btn-success"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={async () => {
                            if (window.confirm('Reset all lights to normal operation?')) {
                                try {
                                    for (const light of trafficLights) {
                                        await trafficLightsDB.updateTrafficLight(light.id, {
                                            emergencyMode: false,
                                            lastSignalChange: new Date().toISOString()
                                        });
                                    }
                                    await loadTrafficLights();
                                    alert('All lights reset to normal operation');
                                } catch (error) {
                                    console.error('Error resetting lights:', error);
                                    alert('Failed to reset lights');
                                }
                            }
                        }}
                    >
                        <FaRedo />
                        Reset All to Normal
                    </button>

                    <button
                        className="btn btn-warning"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => {
                            const pattern = {
                                name: 'Peak Hours Pattern',
                                description: 'Extended green time for main roads during peak hours (8-10 AM, 5-7 PM)',
                                schedule: [
                                    { start: '08:00', end: '10:00', greenTime: 60, redTime: 40 },
                                    { start: '17:00', end: '19:00', greenTime: 60, redTime: 40 }
                                ],
                                isActive: false
                            };

                            setNewPattern(pattern);
                            setShowAddPattern(true);
                        }}
                    >
                        <FaClock />
                        Add Peak Hours Pattern
                    </button>

                    <button
                        className="btn btn-primary"
                        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={exportData}
                    >
                        <FaDownload />
                        Export All Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrafficLights;