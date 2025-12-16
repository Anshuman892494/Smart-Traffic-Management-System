import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaBell, FaCog, FaSignOutAlt, FaBars, FaChevronLeft, FaTrafficLight, FaIdCard, FaCalendar, FaClock } from 'react-icons/fa';
import '../../styles/main.css';

const Header = ({ toggleSidebar, isSidebarCollapsed }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Update date and time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        if (user?.role === 'admin') {
            navigate('/admin/profile');
        } else {
            navigate('/profile');
        }
    };

    // Generate USER ID from username (first 4 letters + 2025)
    const generateUserId = () => {
        const username = user?.username || user?.fullName || 'USER';
        const firstFour = username.slice(0, 4).toUpperCase().padEnd(4, 'X');
        return `${firstFour}2025`;
    };

    const userId = generateUserId();

    return (
        <header style={{
            backgroundColor: '#ffffff',
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            {/* Left Section */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'white',
                        color: '#1e293b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#0066cc';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 204, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {isSidebarCollapsed ? <FaBars size={16} /> : <FaChevronLeft size={16} />}
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#0066cc',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FaTrafficLight style={{ color: 'white', fontSize: '20px' }} />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1e293b',
                            margin: 0
                        }}>
                            Smart Traffic Management
                        </h1>
                        <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '2px'
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#10b981',
                                borderRadius: '50%'
                            }} />
                            <span>Real-time monitoring active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>
                {/* Date and Time Display */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '2px',
                    marginRight: '16px'
                }}>
                    {/* Date */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#475569',
                        fontWeight: '500'
                    }}>
                        <FaCalendar size={12} style={{ color: '#64748b' }} />
                        <span>{formatDate(currentDateTime)}</span>
                    </div>

                    {/* Time */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '16px',
                        color: '#1e293b',
                        fontWeight: '600',
                        fontFamily: "'Courier New', monospace",
                        backgroundColor: '#f8fafc',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        minWidth: '140px',
                        justifyContent: 'center'
                    }}>
                        <FaClock size={12} style={{ color: '#0066cc' }} />
                        <span id="current-time">{formatTime(currentDateTime)}</span>
                    </div>
                </div>

                {/* Traffic Signal Indicator */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    marginRight: '16px'
                }}>
                    <div style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        SIGNAL STATUS
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            animation: 'pulse 1.5s ease-in-out infinite',
                            boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)'
                        }}></div>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '50%',
                            animation: 'pulse 1.5s ease-in-out infinite 0.5s',
                            boxShadow: '0 0 5px rgba(245, 158, 11, 0.5)'
                        }}></div>
                        <div style={{
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            animation: 'pulse 1.5s ease-in-out infinite 1s',
                            boxShadow: '0 0 5px rgba(16, 185, 129, 0.5)'
                        }}></div>
                        <div style={{
                            marginLeft: '8px',
                            fontSize: '11px',
                            color: '#64748b',
                            fontWeight: '400'
                        }}>
                            All Systems Operational
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        backgroundColor: showDropdown ? '#f8fafc' : 'transparent',
                        border: showDropdown ? '1px solid #e2e8f0' : '1px solid transparent'
                    }}
                    onClick={() => setShowDropdown(!showDropdown)}
                    onMouseEnter={(e) => {
                        if (!showDropdown) {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.border = '1px solid #e2e8f0';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!showDropdown) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.border = '1px solid transparent';
                        }
                    }}
                >
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #e2e8f0'
                    }}>
                        <FaUserCircle size={24} color="#475569" />
                    </div>
                    <div>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1e293b',
                            lineHeight: '1.2'
                        }}>
                            {user?.fullName || user?.username || 'User Name'}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '2px'
                        }}>
                            <div style={{
                                padding: '2px 8px',
                                backgroundColor: user?.role === 'admin' ? '#dcfce7' : '#f0f9ff',
                                color: user?.role === 'admin' ? '#166534' : '#075985',
                                borderRadius: '12px',
                                fontWeight: '500',
                                fontSize: '11px'
                            }}>
                                {user?.role?.toUpperCase() || 'USER'}
                            </div>
                            <span>•</span>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <FaIdCard size={10} />
                                USER ID: {userId}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '70px',
                            right: '0',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            width: '280px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e2e8f0',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}
                    >
                        {/* User Info */}
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: '#64748b',
                                marginBottom: '4px'
                            }}>
                                Signed in as
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#1e293b'
                            }}>
                                {user?.fullName || user?.username}
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: '#475569',
                                marginTop: '4px'
                            }}>
                                {user?.email || 'user@example.com'}
                            </div>

                            {/* Current Time in Dropdown */}
                            <div style={{
                                marginTop: '12px',
                                padding: '10px 12px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f0f9ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FaClock size={14} color="#0066cc" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        CURRENT TIME
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        fontFamily: "'Courier New', monospace"
                                    }}>
                                        {formatTime(currentDateTime)}
                                    </div>
                                </div>
                            </div>

                            {/* USER ID Info in Dropdown */}
                            <div style={{
                                marginTop: '8px',
                                padding: '10px 12px',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f0f9ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FaIdCard size={14} color="#0066cc" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        USER ID
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                        {userId}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div style={{ padding: '8px' }}>
                            <div
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={handleProfileClick}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f0f9ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FaUserCircle size={16} color="#0066cc" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                                        Profile
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        View and edit your profile
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                height: '1px',
                                backgroundColor: '#e2e8f0',
                                margin: '8px 0'
                            }}></div>

                            <div
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    borderRadius: '8px',
                                    color: '#dc2626',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={handleLogout}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fee2e2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: '#fee2e2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FaSignOutAlt size={16} color="#dc2626" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                                        Logout
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#ef4444' }}>
                                        Sign out of your account
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '12px 16px',
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            fontSize: '11px',
                            color: '#94a3b8',
                            textAlign: 'center'
                        }}>
                            Session expires in 30 minutes • Current time: {formatTime(currentDateTime)}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;