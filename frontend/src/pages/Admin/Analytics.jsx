import React, { useState, useEffect } from 'react';
import { trafficAPI, userAPI, vehicleAPI } from '../../services/api';
import {
    FaChartBar,
    FaChartLine,
    FaChartPie,
    FaUsers,
    FaCar,
    FaTrafficLight,
    FaDownload,
    FaCalendar,
    FaFilter
} from 'react-icons/fa';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
    LineChart, Line
} from 'recharts';
import Loader from '../../components/common/Loader';
import '../../styles/main.css';

const Analytics = () => {
    const [trafficAnalytics, setTrafficAnalytics] = useState(null);
    const [userAnalytics, setUserAnalytics] = useState(null);
    const [vehicleAnalytics, setVehicleAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('today');

    useEffect(() => {
        fetchAllAnalytics();
    }, [timeRange]);

    const fetchAllAnalytics = async () => {
        try {
            setLoading(true);

            const [trafficRes, userRes, vehicleRes] = await Promise.all([
                trafficAPI.getAnalytics(),
                userAPI.getUserStats(),
                vehicleAPI.getVehicleStats()
            ]);

            setTrafficAnalytics(trafficRes.data.data);
            setUserAnalytics(userRes.data.data);
            setVehicleAnalytics(vehicleRes.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            alert('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    const getTrafficChartData = () => {
        if (!trafficAnalytics) return [];

        return [
            { name: 'Low', value: trafficAnalytics.congestionDistribution.low, color: '#10b981' },
            { name: 'Medium', value: trafficAnalytics.congestionDistribution.medium, color: '#f59e0b' },
            { name: 'High', value: trafficAnalytics.congestionDistribution.high, color: '#ef4444' }
        ];
    };

    const getVehicleTypeData = () => {
        if (!vehicleAnalytics?.vehicleTypeStats) return [];

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

        return vehicleAnalytics.vehicleTypeStats.map((stat, index) => ({
            name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
            value: stat.count,
            color: colors[index] || '#6b7280'
        }));
    };

    const getMonthlyRegistrationData = () => {
        if (!userAnalytics?.monthlyStats) return [];

        return userAnalytics.monthlyStats.map(stat => ({
            name: `${stat._id.month}/${stat._id.year}`.slice(-5),
            users: stat.count
        })).reverse();
    };

    const getRecentActivityData = () => {
        // Mock data for recent activity
        return [
            { hour: '12 AM', traffic: 45, incidents: 2 },
            { hour: '2 AM', traffic: 30, incidents: 1 },
            { hour: '4 AM', traffic: 25, incidents: 0 },
            { hour: '6 AM', traffic: 65, incidents: 3 },
            { hour: '8 AM', traffic: 95, incidents: 8 },
            { hour: '10 AM', traffic: 85, incidents: 5 },
            { hour: '12 PM', traffic: 80, incidents: 4 },
            { hour: '2 PM', traffic: 75, incidents: 3 },
            { hour: '4 PM', traffic: 90, incidents: 7 },
            { hour: '6 PM', traffic: 100, incidents: 9 },
            { hour: '8 PM', traffic: 70, incidents: 4 },
            { hour: '10 PM', traffic: 50, incidents: 2 }
        ];
    };

    const exportAnalytics = () => {
        const data = {
            timestamp: new Date().toISOString(),
            timeRange,
            trafficAnalytics,
            userAnalytics,
            vehicleAnalytics
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader type="spinner" text="Loading analytics..." />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>System Analytics</h1>
                        <p style={{ color: 'var(--gray-color)' }}>Comprehensive overview of system performance and usage</p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCalendar style={{ color: 'var(--gray-color)' }} />
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '14px',
                                    minWidth: '120px'
                                }}
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={fetchAllAnalytics}
                            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            Refresh
                        </button>

                        <button
                            className="btn btn-success"
                            onClick={exportAnalytics}
                            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaDownload />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="stats-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <div style={{
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            padding: '12px',
                            borderRadius: '50%',
                            color: 'var(--primary-color)'
                        }}>
                            <FaChartBar size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Total Traffic Zones</div>
                            <div className="stat-value">{trafficAnalytics?.totalZones || 0}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                        Monitored areas in system
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <div style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            padding: '12px',
                            borderRadius: '50%',
                            color: 'var(--success-color)'
                        }}>
                            <FaUsers size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Total Users</div>
                            <div className="stat-value">{userAnalytics?.totalUsers || 0}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                        Registered users
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <div style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            padding: '12px',
                            borderRadius: '50%',
                            color: 'var(--warning-color)'
                        }}>
                            <FaCar size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Total Vehicles</div>
                            <div className="stat-value">{vehicleAnalytics?.totalVehicles || 0}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                        Registered vehicles
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <div style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            padding: '12px',
                            borderRadius: '50%',
                            color: 'var(--danger-color)'
                        }}>
                            <FaTrafficLight size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Heavy Traffic Zones</div>
                            <div className="stat-value">{trafficAnalytics?.congestionDistribution?.high || 0}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                        Requiring attention
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* Traffic Distribution Pie Chart */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <FaChartPie style={{ color: 'var(--primary-color)' }} />
                        <h3>Traffic Congestion Distribution</h3>
                    </div>

                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getTrafficChartData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {getTrafficChartData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} zones`, 'Count']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginTop: '20px',
                        fontSize: '14px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '600', color: '#10b981' }}>Low Traffic</div>
                            <div>{trafficAnalytics?.congestionDistribution?.low || 0} zones</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '600', color: '#f59e0b' }}>Medium Traffic</div>
                            <div>{trafficAnalytics?.congestionDistribution?.medium || 0} zones</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '600', color: '#ef4444' }}>Heavy Traffic</div>
                            <div>{trafficAnalytics?.congestionDistribution?.high || 0} zones</div>
                        </div>
                    </div>
                </div>

                {/* Vehicle Type Distribution */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <FaChartBar style={{ color: 'var(--primary-color)' }} />
                        <h3>Vehicle Type Distribution</h3>
                    </div>

                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getVehicleTypeData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} vehicles`, 'Count']} />
                                <Legend />
                                <Bar dataKey="value" name="Vehicle Count">
                                    {getVehicleTypeData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Registration Trend */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <FaChartLine style={{ color: 'var(--primary-color)' }} />
                        <h3>User Registration Trend</h3>
                    </div>

                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getMonthlyRegistrationData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                                <Legend />
                                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Activity Over Time */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <FaChartLine style={{ color: 'var(--primary-color)' }} />
                        <h3>Traffic Activity (24 Hours)</h3>
                    </div>

                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getRecentActivityData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="traffic" name="Traffic Level" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '15px' }}>Traffic Summary</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total Vehicles in System:</span>
                            <strong>{trafficAnalytics?.totalVehicles || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Average Speed:</span>
                            <strong>{trafficAnalytics?.averageSpeed || '0'} km/h</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Recent Updates (24h):</span>
                            <strong>{trafficAnalytics?.recentActivity || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Last Updated:</span>
                            <strong>{new Date().toLocaleTimeString()}</strong>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '15px' }}>User Statistics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Admins:</span>
                            <strong>{userAnalytics?.roleDistribution?.admin || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Regular Users:</span>
                            <strong>{userAnalytics?.roleDistribution?.user || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>New Users (30d):</span>
                            <strong>{userAnalytics?.recentUsers || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Growth Rate:</span>
                            <strong style={{ color: '#10b981' }}>+12.5%</strong>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '15px' }}>Vehicle Statistics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Most Common Type:</span>
                            <strong style={{ textTransform: 'capitalize' }}>
                                {vehicleAnalytics?.vehicleTypeStats?.[0]?._id || 'N/A'}
                            </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>New Registrations (30d):</span>
                            <strong>+{vehicleAnalytics?.monthlyStats?.[0]?.count || 0}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Avg Vehicles per User:</span>
                            <strong>1.2</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Active Today:</span>
                            <strong>85%</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Insights and Recommendations */}
            <div className="card">
                <h3 style={{ marginBottom: '15px' }}>System Insights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    <div style={{
                        backgroundColor: '#f0f9ff',
                        padding: '15px',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #e0f2fe'
                    }}>
                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '8px' }}>Peak Traffic Hours</h4>
                        <p style={{ fontSize: '14px', color: 'var(--gray-color)' }}>
                            8-10 AM and 5-7 PM show highest congestion. Consider implementing dynamic traffic signals.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#f0fdf4',
                        padding: '15px',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #dcfce7'
                    }}>
                        <h4 style={{ color: 'var(--success-color)', marginBottom: '8px' }}>User Growth</h4>
                        <p style={{ fontSize: '14px', color: 'var(--gray-color)' }}>
                            User registrations increased by 12.5% this month. Consider expanding server capacity.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#fef3c7',
                        padding: '15px',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #fde68a'
                    }}>
                        <h4 style={{ color: 'var(--warning-color)', marginBottom: '8px' }}>Vehicle Distribution</h4>
                        <p style={{ fontSize: '14px', color: 'var(--gray-color)' }}>
                            Cars dominate vehicle types (65%). Consider specialized lanes for different vehicle types.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#fef2f2',
                        padding: '15px',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid #fee2e2'
                    }}>
                        <h4 style={{ color: 'var(--danger-color)', marginBottom: '8px' }}>Heavy Traffic Areas</h4>
                        <p style={{ fontSize: '14px', color: 'var(--gray-color)' }}>
                            3 zones consistently show heavy traffic. Recommend deploying additional traffic management.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;