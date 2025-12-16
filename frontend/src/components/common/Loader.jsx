import React from 'react';
import '../../styles/main.css';

const Loader = ({ size = 'medium', type = 'spinner', text = 'Loading...' }) => {
    const sizeMap = {
        small: { width: '24px', height: '24px' },
        medium: { width: '40px', height: '40px' },
        large: { width: '60px', height: '60px' }
    };

    if (type === 'spinner') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
            }}>
                <div
                    className="spinner"
                    style={{
                        ...sizeMap[size],
                        border: `4px solid #f3f4f6`,
                        borderTop: `4px solid var(--primary-color)`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}
                />
                {text && (
                    <span style={{
                        color: 'var(--gray-color)',
                        fontSize: '14px'
                    }}>
                        {text}
                    </span>
                )}

                <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (type === 'dots') {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
            }}>
                {[1, 2, 3].map((dot) => (
                    <div
                        key={dot}
                        style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: 'var(--primary-color)',
                            borderRadius: '50%',
                            animation: `bounce 1.4s infinite ease-in-out ${dot * 0.16}s`
                        }}
                    />
                ))}
                {text && (
                    <span style={{
                        marginLeft: '12px',
                        color: 'var(--gray-color)',
                        fontSize: '14px'
                    }}>
                        {text}
                    </span>
                )}

                <style jsx>{`
          @keyframes bounce {
            0%, 80%, 100% { 
              transform: scale(0);
            } 
            40% { 
              transform: scale(1.0);
            }
          }
        `}</style>
            </div>
        );
    }

    if (type === 'skeleton') {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#f3f4f6',
                borderRadius: 'var(--border-radius)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite'
                }} />

                <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
            </div>
        );
    }

    return null;
};

export default Loader;