import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/main.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/auth/forgot-password', { email });

            if (response.data.success) {
                setSuccess(true);
            } else {
                setError(response.data.message || 'Failed to send reset email');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
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
                {/* Left Side - Forgot Password Form (White) */}
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
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'none',
                                border: 'none',
                                color: '#0066cc',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                padding: '8px 0',
                                marginBottom: '20px',
                                transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#0052a3'}
                            onMouseLeave={(e) => e.target.style.color = '#0066cc'}
                        >
                            <FaArrowLeft />
                            Back to Login
                        </button>

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
                                <FaEnvelope style={{ color: 'white', fontSize: '20px' }} />
                            </div>
                            <h1 style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#1e293b',
                                margin: 0
                            }}>
                                Reset Password
                            </h1>
                        </div>
                        <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            lineHeight: '1.6',
                            margin: 0
                        }}>
                            Enter your email address and we'll send you instructions to reset your password.
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
                            <FaExclamationTriangle />
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div style={{
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            padding: '24px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            border: '1px solid #a7f3d0',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#10b981',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px auto'
                            }}>
                                <FaCheckCircle style={{ color: 'white', fontSize: '24px' }} />
                            </div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#065f46',
                                marginBottom: '12px'
                            }}>
                                Check Your Email
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#065f46',
                                lineHeight: '1.6',
                                marginBottom: '20px'
                            }}>
                                We've sent a password reset link to <strong style={{ color: '#047857' }}>{email}</strong>.
                                Please check your inbox and follow the instructions.
                            </p>
                            <button
                                onClick={() => setSuccess(false)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#059669';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#10b981';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                Send Again
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#475569',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Email Address
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
                                        <FaEnvelope />
                                    </div>
                                    <input
                                        type="email"
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="Enter your registered email address"
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
                                <small style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    color: '#64748b',
                                    marginTop: '8px',
                                    paddingLeft: '4px'
                                }}>
                                    Enter the email address associated with your account.
                                </small>
                            </div>

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
                                    'Sending Reset Link...'
                                ) : (
                                    <>
                                        Send Reset Link
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Additional Info */}
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
                            Remember your password?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: '#0066cc',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#0052a3'}
                                onMouseLeave={(e) => e.target.style.color = '#0066cc'}
                            >
                                Sign in
                            </Link>
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px'
                        }}>
                            <strong>Note:</strong> The password reset link will expire in 1 hour for security reasons.
                        </p>
                    </div>
                </div>

                {/* Right Side - Security Information */}
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
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                    </div>

                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h2 style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '20px'
                        }}>
                            Account Security<br />Tips
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
                            Keep your account secure with these best practices for password management and online safety.
                        </p>

                        {/* Security Tips */}
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            marginBottom: '30px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: 'rgba(0, 102, 204, 0.2)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#0066cc'
                                    }}>
                                        🔒
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                                        Security First
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        Your safety is our priority
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: '#10b981',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: '2px'
                                    }}>
                                        <FaCheckCircle style={{ color: 'white', fontSize: '10px' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500', marginBottom: '4px' }}>
                                            Strong Passwords
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                            Use a combination of letters, numbers, and special characters
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: '#10b981',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: '2px'
                                    }}>
                                        <FaCheckCircle style={{ color: 'white', fontSize: '10px' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500', marginBottom: '4px' }}>
                                            Regular Updates
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                            Change your password periodically for better security
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: '#10b981',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: '2px'
                                    }}>
                                        <FaCheckCircle style={{ color: 'white', fontSize: '10px' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500', marginBottom: '4px' }}>
                                            Secure Connection
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                                            Always ensure you're using a secure internet connection
                                        </div>
                                    </div>
                                </div>
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
                            🔐
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;