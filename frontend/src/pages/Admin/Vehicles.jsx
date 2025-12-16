import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../../services/api';
import {
    FaSearch,
    FaFilter,
    FaCar,
    FaMotorcycle,
    FaBus,
    FaTruck,
    FaEye,
    FaEdit,
    FaTrash,
    FaDownload,
    FaChartBar
} from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import '../../styles/main.css';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        fetchVehicles();
        fetchVehicleStats();
    }, [currentPage, typeFilter]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
                vehicleType: typeFilter
            };

            const response = await vehicleAPI.getAllVehicles(params);
            setVehicles(response.data.data);
            setTotalPages(response.data.pagination.pages);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            alert('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleStats = async () => {
        try {
            const response = await vehicleAPI.getVehicleStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching vehicle stats:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchVehicles();
    };

    const handleDeleteVehicle = async (vehicleId) => {
        if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            await vehicleAPI.deleteVehicle(vehicleId);
            alert('Vehicle deleted successfully');
            fetchVehicles();
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Failed to delete vehicle');
        }
    };

    const getVehicleIcon = (type) => {
        switch (type) {
            case 'car': return <FaCar />;
            case 'bike': return <FaMotorcycle />;
            case 'bus': return <FaBus />;
            case 'truck': return <FaTruck />;
            default: return <FaCar />;
        }
    };

    const getVehicleColor = (type) => {
        switch (type) {
            case 'car': return '#3b82f6';
            case 'bike': return '#10b981';
            case 'bus': return '#f59e0b';
            case 'truck': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const exportToCSV = () => {
        // Simple CSV export
        const headers = ['Vehicle Number', 'Type', 'Owner', 'Registered Date'];
        const data = vehicles.map(v => [
            v.vehicleNumber,
            v.vehicleType,
            v.user?.fullName || 'Unknown',
            formatDate(v.registeredAt)
        ]);

        const csvContent = [
            headers.join(','),
            ...data.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vehicles-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading && !vehicles.length) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader type="spinner" text="Loading vehicles..." />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Vehicle Management</h1>
                <p style={{ color: 'var(--gray-color)' }}>Manage all registered vehicles in the system</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid" style={{ marginBottom: '30px' }}>
                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: 'var(--primary-color)'
                            }}>
                                <FaCar size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Total Vehicles</div>
                                <div className="stat-value">{stats.totalVehicles}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                            Registered in system
                        </div>
                    </div>

                    {stats.vehicleTypeStats?.map((stat, index) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                        const icons = [<FaCar />, <FaMotorcycle />, <FaBus />, <FaTruck />];

                        return (
                            <div key={stat._id} className="stat-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                    <div style={{
                                        backgroundColor: `${colors[index]}20`,
                                        padding: '12px',
                                        borderRadius: '50%',
                                        color: colors[index]
                                    }}>
                                        {icons[index]}
                                    </div>
                                    <div>
                                        <div className="stat-label" style={{ textTransform: 'capitalize' }}>
                                            {stat._id}s
                                        </div>
                                        <div className="stat-value">{stat.count}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                                    {((stat.count / stats.totalVehicles) * 100).toFixed(1)}% of total
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Filters and Search */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search vehicles by number or owner..."
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaFilter style={{ color: 'var(--gray-color)' }} />
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '14px',
                                minWidth: '120px'
                            }}
                        >
                            <option value="">All Types</option>
                            <option value="car">Cars</option>
                            <option value="bike">Bikes</option>
                            <option value="bus">Buses</option>
                            <option value="truck">Trucks</option>
                        </select>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={fetchVehicles}
                        style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        Refresh
                    </button>

                    <button
                        className="btn btn-success"
                        onClick={exportToCSV}
                        style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaDownload />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Vehicles Table */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Vehicle Number</th>
                                <th>Type</th>
                                <th>Owner</th>
                                <th>Email</th>
                                <th>Registered</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                backgroundColor: getVehicleColor(vehicle.vehicleType) + '20',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: getVehicleColor(vehicle.vehicleType)
                                            }}>
                                                {getVehicleIcon(vehicle.vehicleType)}
                                            </div>
                                            <div style={{ fontWeight: '500', letterSpacing: '1px' }}>
                                                {vehicle.vehicleNumber}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'capitalize',
                                            backgroundColor: getVehicleColor(vehicle.vehicleType) + '20',
                                            color: getVehicleColor(vehicle.vehicleType)
                                        }}>
                                            {vehicle.vehicleType}
                                        </span>
                                    </td>
                                    <td>
                                        {vehicle.user?.fullName || 'Unknown'}
                                    </td>
                                    <td>
                                        {vehicle.user?.email || 'N/A'}
                                    </td>
                                    <td>
                                        {formatDate(vehicle.registeredAt)}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn"
                                                onClick={() => setSelectedVehicle(vehicle)}
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>

                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDeleteVehicle(vehicle._id)}
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                title="Delete Vehicle"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {vehicles.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
                        No vehicles found
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <button
                            className="btn"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            style={{ padding: '8px 16px' }}
                        >
                            Previous
                        </button>

                        <span style={{ color: 'var(--gray-color)' }}>
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            className="btn"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            style={{ padding: '8px 16px' }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Vehicle Details Modal */}
            {selectedVehicle && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3>Vehicle Details</h3>
                            <button
                                onClick={() => setSelectedVehicle(null)}
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

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: getVehicleColor(selectedVehicle.vehicleType) + '20',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: getVehicleColor(selectedVehicle.vehicleType),
                                    fontSize: '24px'
                                }}>
                                    {getVehicleIcon(selectedVehicle.vehicleType)}
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '5px' }}>{selectedVehicle.vehicleNumber}</h4>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'capitalize',
                                        backgroundColor: getVehicleColor(selectedVehicle.vehicleType) + '20',
                                        color: getVehicleColor(selectedVehicle.vehicleType)
                                    }}>
                                        {selectedVehicle.vehicleType}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--gray-color)', fontSize: '14px' }}>
                                    Owner Information
                                </label>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: 'var(--border-radius)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}>
                                    <div>
                                        <strong>Name:</strong> {selectedVehicle.user?.fullName || 'Unknown'}
                                    </div>
                                    <div>
                                        <strong>Email:</strong> {selectedVehicle.user?.email || 'N/A'}
                                    </div>
                                    <div>
                                        <strong>Role:</strong> {selectedVehicle.user?.role || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--gray-color)', fontSize: '14px' }}>
                                    Registration Details
                                </label>
                                <div style={{
                                    padding: '15px',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: 'var(--border-radius)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}>
                                    <div>
                                        <strong>Registered On:</strong> {formatDate(selectedVehicle.registeredAt)}
                                    </div>
                                    <div>
                                        <strong>Last Updated:</strong> {formatDate(selectedVehicle.updatedAt)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        // Navigate to owner's profile or edit vehicle
                                        alert('Edit functionality would open here');
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    Edit Details
                                </button>

                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this vehicle?')) {
                                            handleDeleteVehicle(selectedVehicle._id);
                                            setSelectedVehicle(null);
                                        }
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    Delete Vehicle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;