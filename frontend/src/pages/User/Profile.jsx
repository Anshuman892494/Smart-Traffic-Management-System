import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import {
    FaUser,
    FaEnvelope,
    FaCar,
    FaKey,
    FaSave,
    FaEdit,
    FaTimes,
    FaShieldAlt,
    FaCalendarAlt
} from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import '../../styles/main.css';

const Profile = ({ isAdmin = false }) => {
    const { user, updateProfile, changePassword } = useAuth();
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        vehicleNumber: '',
        vehicleType: 'car'
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [userStats, setUserStats] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getProfile();
            const { user: userData, vehicle } = response.data.data;

            setProfileData({
                fullName: userData.fullName || '',
                email: userData.email || '',
                vehicleNumber: vehicle?.vehicleNumber || '',
                vehicleType: vehicle?.vehicleType || 'car'
            });

            // Fetch additional stats if admin viewing their own profile
            if (isAdmin) {
                fetchUserStats();
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await userAPI.getUserStats();
            setUserStats(response.data.data);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await updateProfile(profileData);

            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setEditing(false);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setSaving(false);
            return;
        }

        // Validate password strength
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
            setSaving(false);
            return;
        }

        try {
            const result = await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (result.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setChangingPassword(false);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password' });
        } finally {
            setSaving(false);
        }
    };

    const vehicleTypes = [
        { value: 'car', label: 'Car' },
        { value: 'bike', label: 'Bike' },
        { value: 'bus', label: 'Bus' },
        { value: 'truck', label: 'Truck' }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader type="spinner" text="Loading profile..." />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>My Profile</h1>
                <p style={{ color: 'var(--gray-color)' }}>
                    Manage your personal information and account settings
                </p>
            </div>

            {/* Message Display */}
            {message.text && (
                <div style={{
                    padding: '15px',
                    borderRadius: 'var(--border-radius)',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{message.text}</span>
                    <button
                        onClick={() => setMessage({ type: '', text: '' })}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'inherit'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
                {/* Profile Form */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaUser />
                            Personal Information
                        </h3>

                        {!editing ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => setEditing(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FaEdit />
                                Edit Profile
                            </button>
                        ) : (
                            <button
                                className="btn"
                                onClick={() => {
                                    setEditing(false);
                                    fetchUserProfile(); // Reset to original data
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FaTimes />
                                Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                <FaUser style={{ marginRight: '8px' }} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                className="form-input"
                                value={profileData.fullName}
                                onChange={handleProfileChange}
                                disabled={!editing}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <FaEnvelope style={{ marginRight: '8px' }} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={profileData.email}
                                disabled
                                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                            />
                            <small style={{ color: 'var(--gray-color)', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                                Email cannot be changed for security reasons
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <FaCar style={{ marginRight: '8px' }} />
                                Vehicle Number
                            </label>
                            <input
                                type="text"
                                name="vehicleNumber"
                                className="form-input"
                                value={profileData.vehicleNumber}
                                onChange={handleProfileChange}
                                disabled={!editing}
                                required
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <FaCar style={{ marginRight: '8px' }} />
                                Vehicle Type
                            </label>
                            <select
                                name="vehicleType"
                                className="form-input"
                                value={profileData.vehicleType}
                                onChange={handleProfileChange}
                                disabled={!editing}
                                required
                            >
                                {vehicleTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {editing && (
                            <div style={{ marginTop: '20px' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <FaSave />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Sidebar - Password Change & Info */}
                <div>
                    {/* Password Change Card */}
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaKey />
                                Security
                            </h3>

                            {!changingPassword ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setChangingPassword(true)}
                                    style={{ fontSize: '14px', padding: '8px 16px' }}
                                >
                                    Change Password
                                </button>
                            ) : (
                                <button
                                    className="btn"
                                    onClick={() => {
                                        setChangingPassword(false);
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
                                    style={{ fontSize: '14px', padding: '8px 16px' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {changingPassword ? (
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        className="form-input"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="form-input"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    <small style={{ color: 'var(--gray-color)', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                                        Must be at least 6 characters long
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-input"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                    style={{ width: '100%' }}
                                >
                                    {saving ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ color: 'var(--gray-color)', fontSize: '14px' }}>
                                <p>Last password change: 2 weeks ago</p>
                                <p style={{ marginTop: '10px' }}>For security, we recommend changing your password every 3 months.</p>
                            </div>
                        )}
                    </div>

                    {/* Account Information Card */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <FaShieldAlt />
                            Account Information
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '5px' }}>
                                    Account Type
                                </div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    backgroundColor: user?.role === 'admin' ? '#fee2e2' : '#d1fae5',
                                    color: user?.role === 'admin' ? '#991b1b' : '#065f46'
                                }}>
                                    {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '5px' }}>
                                    Member Since
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaCalendarAlt style={{ color: 'var(--gray-color)' }} />
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '5px' }}>
                                    Account Status
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#10b981'
                                    }} />
                                    Active
                                </div>
                            </div>
                        </div>

                        {/* Admin Stats (if applicable) */}
                        {isAdmin && userStats && (
                            <div style={{
                                marginTop: '20px',
                                paddingTop: '20px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <h4 style={{ marginBottom: '15px' }}>System Stats</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '14px' }}>Total Users:</span>
                                        <strong>{userStats.totalUsers}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '14px' }}>Admins:</span>
                                        <strong>{userStats.roleDistribution?.admin || 0}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '14px' }}>New Users (30d):</span>
                                        <strong>{userStats.recentUsers || 0}</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;