import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaTachometerAlt,
    FaMap,
    FaUser,
    FaUsers,
    FaCar,
    FaChartBar,
    FaSignOutAlt,
    FaRoad,            // New icon for Incidents
    FaWrench,          // New icon for Maintenance
    FaExclamationTriangle,   // ⚠️ Warning / Danger
    FaTrafficLight
} from 'react-icons/fa';
import '../../styles/main.css';

const Sidebar = ({ isCollapsed }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    const menuItems = [
        {
            title: 'Dashboard',
            icon: <FaTachometerAlt />,
            path: isAdmin ? '/admin/dashboard' : '/dashboard',
            roles: ['user', 'admin']
        },
        {
            title: 'Map View',
            icon: <FaMap />,
            path: isAdmin ? '/admin/map' : '/map',
            roles: ['user', 'admin']
        },
        {
            title: 'Profile',
            icon: <FaUser />,
            path: '/profile',
            roles: ['user']
        },
        {
            title: 'Report Incidents',
            icon: <FaExclamationTriangle />,
            path: '/report',
            roles: ['user']
        },
        {
            title: 'Traffic Lights',
            icon: <FaTrafficLight />,
            path: '/trafficlightstatus',
            roles: ['user']
        },
        {
            title: 'Route Planner',
            icon: <FaRoad />,
            path: '/route-planner',
            roles: ['user']
        }
    ];

    const adminMenuItems = [
        {
            title: 'Profile',
            icon: <FaUser />,
            path: '/admin/profile',
            roles: ['admin']
        },
        {
            title: 'Users',
            icon: <FaUsers />,
            path: '/admin/users',
            roles: ['admin']
        },
        {
            title: 'Traffic Lights',
            icon: <FaTrafficLight />,
            path: '/admin/trafficlight',
            roles: ['admin']
        },
        {
            title: 'Vehicles',
            icon: <FaCar />,
            path: '/admin/vehicles',
            roles: ['admin']
        },
        {
            title: 'Traffic Incidents',
            icon: <FaRoad />,
            path: '/admin/incidents',
            roles: ['admin']
        },
        {
            title: 'Analytics',
            icon: <FaChartBar />,
            path: '/admin/analytics',
            roles: ['admin']
        },
        {
            title: 'System Maintenance',
            icon: <FaWrench />,
            path: '/admin/maintenance',
            roles: ['admin']
        }
    ];

    const allMenuItems = [...menuItems, ...adminMenuItems].filter(item =>
        item.roles.includes(user?.role)
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside style={{
            width: isCollapsed ? '80px' : '280px',
            backgroundColor: '#0f172a',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            height: '100vh',
            position: 'sticky',
            top: 0,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>

            {/* Header */}
            <div style={{
                padding: '24px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '12px'
            }}>
                {!isCollapsed ? (
                    <>
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
                        <h2 style={{
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '700',
                            margin: 0
                        }}>
                            Traffic Control
                        </h2>
                    </>
                ) : (
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
                )}
            </div>

            {/* Navigation Menu */}
            <nav style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                overflowY: 'auto'
            }}>
                {allMenuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: isCollapsed ? '12px' : '12px 16px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            color: isActive ? '#ffffff' : '#cbd5e1',
                            backgroundColor: isActive ? '#0066cc' : 'transparent',
                            border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                            justifyContent: isCollapsed ? 'center' : 'flex-start'
                        })}
                        onMouseEnter={(e) => {
                            const isActive = e.currentTarget.classList.contains('active');
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.color = '#ffffff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            const isActive = e.currentTarget.classList.contains('active');
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#cbd5e1';
                            }
                        }}
                        title={isCollapsed ? item.title : ''}
                    >
                        <div style={{ fontSize: '16px' }}>
                            {item.icon}
                        </div>
                        {!isCollapsed && (
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                {item.title}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer with Logout */}
            <div style={{
                padding: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: isCollapsed ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                gap: '12px'
            }}>
                {!isCollapsed && (
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        <div>v1.0.0</div>
                        <div style={{ fontSize: '11px', marginTop: '2px' }}>Active</div>
                    </div>
                )}

                <div
                    onClick={handleLogout}
                    style={{
                        width: isCollapsed ? '40px' : 'auto',
                        height: '40px',
                        padding: isCollapsed ? '0' : '0 16px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        if (!isCollapsed) {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    title={isCollapsed ? 'Logout' : ''}
                >
                    <FaSignOutAlt size={isCollapsed ? 16 : 14} />
                    {!isCollapsed && <span>Logout</span>}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;