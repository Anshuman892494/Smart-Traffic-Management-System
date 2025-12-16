import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
    FaUsers,
    FaCar,
    FaMapMarkerAlt,
    FaTrafficLight,
    FaChartLine,
    FaSync
} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import MapView from './MapView';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVehicles: 0,
        trafficZones: 0,
        activeIncidents: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [trafficData, setTrafficData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [usersRes, vehiclesRes, trafficRes] = await Promise.all([
                axios.get('/api/users/all'),
                axios.get('/api/vehicles'),
                axios.get('/api/traffic/analytics')
            ]);

            setStats({
                totalUsers: usersRes.data.count || 0,
                totalVehicles: vehiclesRes.data.count || 0,
                trafficZones: trafficRes.data.data.totalZones || 0,
                activeIncidents: trafficRes.data.data.congestionDistribution.high || 0
            });

            setRecentUsers(usersRes.data.data.slice(0, 5));
            setTrafficData(trafficRes.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const simulateTrafficUpdate = async () => {
        try {
            await axios.post('/api/traffic/simulate');
            fetchDashboardData();
            alert('Traffic simulation completed!');
        } catch (error) {
            console.error('Error simulating traffic:', error);
            alert('Failed to simulate traffic update');
        }
    };

    const chartData = {
        labels: ['Low', 'Medium', 'High'],
        datasets: [
            {
                label: 'Traffic Zones',
                data: [
                    trafficData.congestionDistribution?.low || 0,
                    trafficData.congestionDistribution?.medium || 0,
                    trafficData.congestionDistribution?.high || 0
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)'
                ],
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Traffic Congestion Distribution'
            }
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div>Loading dashboard data...</div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--gray-color)' }}>
                    Welcome back, {user?.fullName}! Here's what's happening with your traffic system.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">

                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                        <div style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            padding: '12px',
                            borderRadius: '50%',
                            color: 'var(--success-color)'
                        }}>
                            <FaCar size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Total Vehicles</div>
                            <div className="stat-value">{trafficData.totalVehicles}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                        Registered vehicles
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
                            <FaMapMarkerAlt size={24} />
                        </div>
                        <div>
                            <div className="stat-label">Traffic Zones</div>
                            <div className="stat-value">{stats.trafficZones}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                        Monitored areas
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
                            <div className="stat-value">{stats.activeIncidents}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                        Requiring attention
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
                <button
                    className="btn btn-primary"
                    onClick={simulateTrafficUpdate}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FaSync />
                    Simulate Traffic Update
                </button>
            </div>

            {/* Map and Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <h3 style={{ marginBottom: '15px' }}>Traffic Map Overview</h3>
                    <MapView isAdmin={true} />
                </div>

                <div>
                    <h3 style={{ marginBottom: '15px' }}>Traffic Analytics</h3>
                    <div className="card">
                        <Bar data={chartData} options={chartOptions} />
                    </div>

                    <div className="card" style={{ marginTop: '20px' }}>
                        <h4 style={{ marginBottom: '15px' }}>System Summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Total Vehicles in System:</span>
                                <strong>{trafficData.totalVehicles || 0}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Average Speed:</span>
                                <strong>{trafficData.averageSpeed || '0'} km/h</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Last Updated:</span>
                                <strong>Just now</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Recent Registered Users</h3>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`traffic-status traffic-${user.role === 'admin' ? 'high' : 'low'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;