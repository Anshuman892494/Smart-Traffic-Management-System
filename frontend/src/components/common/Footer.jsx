import React from 'react';
import { FaHeart, FaGithub, FaLinkedin, FaEnvelope, FaTrafficLight, FaShieldAlt } from 'react-icons/fa';
import '../../styles/main.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            backgroundColor: '#0f172a',
            color: 'white',
            padding: '40px 20px',
            marginTop: 'auto',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
            }}>
                {/* Header with Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '10px'
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
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#ffffff',
                        margin: 0
                    }}>
                        Smart Traffic Management
                    </h3>
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '40px',
                    flexWrap: 'wrap',
                    marginBottom: '20px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                        }}>
                            Version
                        </div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#ffffff'
                        }}>
                            1.0.0
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                        }}>
                            Status
                        </div>
                        <div style={{
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                backgroundColor: '#10b981',
                                borderRadius: '50%',
                                animation: 'pulse 2s infinite'
                            }} />
                            Operational
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                        }}>
                            Security
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#ffffff'
                        }}>
                            <FaShieldAlt style={{ color: '#0066cc' }} />
                            Active
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div style={{
                    display: 'flex',
                    gap: '24px',
                    marginTop: '10px'
                }}>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: '#cbd5e1',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 102, 204, 0.2)';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#0066cc';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#cbd5e1';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <FaGithub style={{ fontSize: '18px' }} />
                        <span>GitHub</span>
                    </a>

                    <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: '#cbd5e1',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 102, 204, 0.2)';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#0066cc';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 102, 204, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.color = '#cbd5e1';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <FaLinkedin style={{ fontSize: '18px' }} />
                        <span>LinkedIn</span>
                    </a>
                </div>

                {/* Divider */}
                <div style={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    margin: '20px 0'
                }}></div>

                {/* Copyright */}
                <div style={{
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                }}>
                    <span>© {currentYear} Smart Traffic Management System. All rights reserved.</span>
                </div>

                {/* Disclaimer */}
                <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    textAlign: 'center',
                    maxWidth: '800px',
                    lineHeight: '1.6',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    marginTop: '10px'
                }}>
                    This system is designed for urban traffic monitoring and management.
                </div>

                {/* Traffic Signal Indicator */}

            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.4;
                    }
                    50% {
                        opacity: 1;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;