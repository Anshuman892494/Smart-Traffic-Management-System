import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaUserShield, FaUser } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import '../../styles/main.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchUserStats();
    }, [currentPage, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
                role: roleFilter
            };

            const response = await userAPI.getAllUsers(params);
            setUsers(response.data.data);
            setTotalPages(response.data.pagination.pages);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await userAPI.getUserStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers();
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Change user role to ${newRole}?`)) return;

        try {
            await userAPI.updateUserRole(userId, newRole);
            alert('User role updated successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userAPI.deleteUser(userId);
            alert('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && !users.length) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader type="spinner" text="Loading users..." />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>User Management</h1>
                <p style={{ color: 'var(--gray-color)' }}>Manage all registered users in the system</p>
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
                                <FaUser size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Total Users</div>
                                <div className="stat-value">{stats.totalUsers}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                            Registered in system
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
                                <FaUserShield size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Administrators</div>
                                <div className="stat-value">{stats.roleDistribution?.admin || 0}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                            System administrators
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
                                <FaUser size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Regular Users</div>
                                <div className="stat-value">{stats.roleDistribution?.user || 0}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                            Standard users
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
                                <FaUser size={24} />
                            </div>
                            <div>
                                <div className="stat-label">New Users (30d)</div>
                                <div className="stat-value">{stats.recentUsers || 0}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                            Recent registrations
                        </div>
                    </div>
                </div>
            )}

            {/* Filters and Search */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
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
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
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
                            <option value="">All Roles</option>
                            <option value="admin">Administrators</option>
                            <option value="user">Regular Users</option>
                        </select>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={fetchUsers}
                        style={{ padding: '10px 20px' }}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Vehicles</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                backgroundColor: user.role === 'admin' ? 'var(--primary-color)' : 'var(--success-color)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: '600'
                                            }}>
                                                {user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{user.fullName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`traffic-status ${user.role === 'admin' ? 'traffic-high' : 'traffic-low'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{user.vehicleCount || 0}</td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn"
                                                onClick={() => handleViewDetails(user)}
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>

                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                title="Change Role"
                                            >
                                                <FaUserShield />
                                            </button>

                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDeleteUser(user._id)}
                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                title="Delete User"
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

                {users.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
                        No users found
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

            {/* User Details Modal */}
            {selectedUser && (
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
                            <h3>User Details</h3>
                            <button
                                onClick={() => setSelectedUser(null)}
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
                                    backgroundColor: selectedUser.role === 'admin' ? 'var(--primary-color)' : 'var(--success-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: '600'
                                }}>
                                    {selectedUser.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '5px' }}>{selectedUser.fullName}</h4>
                                    <span className={`traffic-status ${selectedUser.role === 'admin' ? 'traffic-high' : 'traffic-low'}`}>
                                        {selectedUser.role}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--gray-color)', fontSize: '14px' }}>
                                    Email Address
                                </label>
                                <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: 'var(--border-radius)' }}>
                                    {selectedUser.email}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--gray-color)', fontSize: '14px' }}>
                                    Member Since
                                </label>
                                <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: 'var(--border-radius)' }}>
                                    {formatDate(selectedUser.createdAt)}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--gray-color)', fontSize: '14px' }}>
                                    Vehicle Count
                                </label>
                                <div style={{ padding: '10px', backgroundColor: '#f9fafb', borderRadius: 'var(--border-radius)' }}>
                                    {selectedUser.vehicleCount || 0} vehicles registered
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        handleRoleChange(selectedUser._id, selectedUser.role === 'admin' ? 'user' : 'admin');
                                        setSelectedUser(null);
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    {selectedUser.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                </button>

                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this user?')) {
                                            handleDeleteUser(selectedUser._id);
                                            setSelectedUser(null);
                                        }
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;