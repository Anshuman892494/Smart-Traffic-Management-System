import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaLock, FaSignInAlt, FaEye, FaEyeSlash, FaCheck, FaCalendar, FaClock } from 'react-icons/fa';
import '../../styles/main.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    const { login } = useAuth();
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                const redirectPath = result.user.role === 'admin'
                    ? '/admin/dashboard'
                    : '/dashboard';
                navigate(redirectPath);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            position: 'relative',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            {/* Dark overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.85)',
                zIndex: 1
            }}></div>

            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: '1000px',
                minHeight: '600px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                zIndex: 2
            }}>
                {/* Left Side - Login Form (White) */}
                <div style={{
                    flex: '1',
                    backgroundColor: '#ffffff',
                    padding: '60px 50px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px'
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
                                <FaSignInAlt style={{ color: 'white', fontSize: '20px' }} />
                            </div>
                            <h1 style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#1e293b',
                                margin: 0
                            }}>
                                Login
                            </h1>
                        </div>
                        <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            lineHeight: '1.6',
                            margin: 0
                        }}>
                            Access the traffic control dashboard with your credentials
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            fontSize: '14px',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                flexShrink: 0
                            }}>
                                !
                            </div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        {/* Username/Email Field */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Email
                            </label>
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '16px',
                                    color: '#94a3b8'
                                }}>
                                    <FaUser />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    style={{
                                        width: '100%',
                                        padding: '16px 16px 16px 48px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        color: '#1e293b',
                                        backgroundColor: '#f8fafc',
                                        transition: 'all 0.2s ease'
                                    }}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#0066cc';
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 102, 204, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Password
                            </label>
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '16px',
                                    color: '#94a3b8'
                                }}>
                                    <FaLock />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    style={{
                                        width: '100%',
                                        padding: '16px 48px 16px 48px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        color: '#1e293b',
                                        backgroundColor: '#f8fafc',
                                        transition: 'all 0.2s ease'
                                    }}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your password"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#0066cc';
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 102, 204, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.backgroundColor = '#f8fafc';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '16px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '32px'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#475569',
                                userSelect: 'none'
                            }}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '4px',
                                    backgroundColor: rememberMe ? '#0066cc' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}>
                                    {rememberMe && <FaCheck style={{ color: 'white', fontSize: '10px' }} />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{ display: 'none' }}
                                />
                                Remember me
                            </label>

                            <Link
                                to="/forgot-password"
                                style={{
                                    fontSize: '14px',
                                    color: '#0066cc',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#0052a3'}
                                onMouseLeave={(e) => e.target.style.color = '#0066cc'}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '18px',
                                backgroundColor: '#0066cc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                            disabled={loading}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.backgroundColor = '#0052a3';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 10px 20px rgba(0, 102, 204, 0.2)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.target.style.backgroundColor = '#0066cc';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }
                            }}
                        >
                            {loading ? (
                                'Signing in...'
                            ) : (
                                <>
                                    <FaSignInAlt />
                                    Login
                                </>
                            )}
                        </button>

                        {/* Sign Up Link */}
                        <div style={{
                            marginTop: '32px',
                            textAlign: 'center',
                            paddingTop: '24px',
                            borderTop: '1px solid #e2e8f0'
                        }}>
                            <p style={{
                                fontSize: '14px',
                                color: '#64748b',
                                margin: 0
                            }}>
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    style={{
                                        color: '#0066cc',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#0052a3'}
                                    onMouseLeave={(e) => e.target.style.color = '#0066cc'}
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Right Side - Traffic Dashboard Preview */}
                <div style={{
                    flex: '1',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    padding: '60px 50px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Traffic-themed decorative elements */}
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        right: '40px',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        }}></div>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '50%',
                            animation: 'pulse 1.5s ease-in-out infinite 0.5s'
                        }}></div>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            animation: 'pulse 1.5s ease-in-out infinite 1s'
                        }}></div>
                    </div>

                    {/* Date and Time Display */}
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {/* Date */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            color: '#94a3b8',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <FaCalendar size={12} style={{ color: '#60a5fa' }} />
                            <span>{formatDate(currentDateTime)}</span>
                        </div>

                        {/* Time */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '18px',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontFamily: "'Courier New', monospace",
                            backgroundColor: 'rgba(0, 102, 204, 0.2)',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 102, 204, 0.3)',
                            minWidth: '160px',
                            justifyContent: 'center'
                        }}>
                            <FaClock size={14} style={{ color: '#60a5fa' }} />
                            <span id="current-time">{formatTime(currentDateTime)}</span>
                        </div>
                    </div>

                    <div style={{ position: 'relative', zIndex: 2, marginTop: '60px' }}>
                        <h2 style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '20px'
                        }}>
                            Smart Traffic Management <br />System for <br /> Urban Congestion
                        </h2>

                        <div style={{
                            width: '80px',
                            height: '4px',
                            backgroundColor: '#0066cc',
                            marginBottom: '30px',
                            borderRadius: '2px'
                        }}></div>

                        <p style={{
                            fontSize: '16px',
                            color: '#cbd5e1',
                            lineHeight: '1.8',
                            marginBottom: '40px'
                        }}>
                            Monitor traffic flow, analyze congestion patterns, incident report, route planner and optimize signal timing in real-time with our intelligent traffic management system.
                        </p>

                        {/* System Status Indicator */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginTop: '30px',
                            padding: '12px 16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '4px'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#10b981',
                                    borderRadius: '50%',
                                    animation: 'pulse 2s ease-in-out infinite'
                                }}></div>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#10b981',
                                    borderRadius: '50%',
                                    animation: 'pulse 2s ease-in-out infinite 0.3s'
                                }}></div>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#10b981',
                                    borderRadius: '50%',
                                    animation: 'pulse 2s ease-in-out infinite 0.6s'
                                }}></div>
                            </div>
                            <div style={{
                                fontSize: '14px',
                                color: '#94a3b8'
                            }}>
                                System Status: <span style={{ color: '#10b981', fontWeight: '500' }}>Active & Secure</span>
                            </div>
                        </div>
                    </div>

                    {/* Subtle traffic pattern in background */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-50px',
                        right: '-50px',
                        opacity: 0.1
                    }}>
                        <div style={{
                            fontSize: '200px',
                            color: '#ffffff',
                            transform: 'rotate(45deg)'
                        }}>
                            🚦
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;