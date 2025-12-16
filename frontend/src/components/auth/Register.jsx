import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaCar,
    FaUserPlus,
    FaEye,
    FaEyeSlash,
    FaCheck,
    FaArrowRight,
    FaArrowLeft
} from 'react-icons/fa';
import '../../styles/main.css';

const Register = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        vehicleNumber: '',
        vehicleType: 'car'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const vehicleTypes = [
        { value: 'car', label: 'Car' },
        { value: 'bike', label: 'Bike' },
        { value: 'bus', label: 'Bus' },
        { value: 'truck', label: 'Truck' }
    ];

    // Password validation rules
    const passwordValidation = {
        minLength: formData.password.length >= 6,
        hasUpperCase: /[A-Z]/.test(formData.password),
        hasLowerCase: /[a-z]/.test(formData.password),
        hasNumber: /\d/.test(formData.password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
        passwordsMatch: formData.password === formData.confirmPassword
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
        setSuccess('');
        setLoading(true);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const result = await register(formData);

            if (result.success) {
                setSuccess('Registration successful! Redirecting to dashboard...');
                setTimeout(() => {
                    navigate(result.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
                }, 2000);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        let stepValid = true;

        switch (currentStep) {
            case 1:
                if (!formData.fullName || !formData.email) {
                    setError('Please fill in all required fields');
                    stepValid = false;
                } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    setError('Please enter a valid email address');
                    stepValid = false;
                }
                break;
            case 2:
                if (!formData.vehicleNumber) {
                    setError('Vehicle number is required');
                    stepValid = false;
                }
                break;
            case 3:
                if (!passwordValidation.passwordsMatch) {
                    setError('Passwords do not match');
                    stepValid = false;
                } else if (!formData.password || formData.password.length < 6) {
                    setError('Password must be at least 6 characters long');
                    stepValid = false;
                }
                break;
        }

        if (stepValid) {
            setError('');
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
        setError('');
    };

    const steps = [
        { number: 1, title: 'Personal Info' },
        { number: 2, title: 'Vehicle Info' },
        { number: 3, title: 'Security' }
    ];

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
                maxWidth: '1200px',
                minHeight: '700px',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                zIndex: 2
            }}>
                {/* Left Side - Registration Form (White) */}
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
                                <FaUserPlus style={{ color: 'white', fontSize: '20px' }} />
                            </div>
                            <h1 style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                color: '#1e293b',
                                margin: 0
                            }}>
                                Create Account
                            </h1>
                        </div>
                        <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            lineHeight: '1.6',
                            margin: 0
                        }}>
                            Register for Smart Traffic Management System
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '40px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '0',
                            right: '0',
                            height: '2px',
                            backgroundColor: '#e2e8f0',
                            transform: 'translateY(-50%)',
                            zIndex: 1
                        }}></div>

                        {steps.map((step, index) => (
                            <div key={step.number} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                zIndex: 2
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: currentStep >= step.number ? '#0066cc' : '#e2e8f0',
                                    color: currentStep >= step.number ? 'white' : '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    marginBottom: '8px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {currentStep > step.number ? <FaCheck /> : step.number}
                                </div>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: currentStep >= step.number ? '#0066cc' : '#94a3b8'
                                }}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
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

                    {success && (
                        <div style={{
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            fontSize: '14px',
                            border: '1px solid #a7f3d0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <FaCheck />
                            {success}
                        </div>
                    )}

                    <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()} style={{ width: '100%' }}>
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    marginBottom: '24px'
                                }}>
                                    Personal Information
                                </h3>

                                {/* Full Name Field */}
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
                                        Full Name
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
                                            type="text"
                                            name="fullName"
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
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your full name"
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

                                {/* Email Field */}
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
                            </div>
                        )}

                        {/* Step 2: Vehicle Information */}
                        {currentStep === 2 && (
                            <div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    marginBottom: '24px'
                                }}>
                                    Vehicle Information
                                </h3>

                                {/* Vehicle Number Field */}
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
                                        Vehicle Number
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
                                            <FaCar />
                                        </div>
                                        <input
                                            type="text"
                                            name="vehicleNumber"
                                            style={{
                                                width: '100%',
                                                padding: '16px 16px 16px 48px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                fontSize: '15px',
                                                color: '#1e293b',
                                                backgroundColor: '#f8fafc',
                                                transition: 'all 0.2s ease',
                                                textTransform: 'uppercase'
                                            }}
                                            value={formData.vehicleNumber}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter vehicle number (e.g., DL01AB1234)"
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

                                {/* Vehicle Type Field */}
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
                                        Vehicle Type
                                    </label>
                                    <div style={{
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: '16px',
                                            color: '#94a3b8',
                                            zIndex: 2
                                        }}>
                                            <FaCar />
                                        </div>
                                        <select
                                            name="vehicleType"
                                            style={{
                                                width: '100%',
                                                padding: '16px 16px 16px 48px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                fontSize: '15px',
                                                color: '#1e293b',
                                                backgroundColor: '#f8fafc',
                                                transition: 'all 0.2s ease',
                                                appearance: 'none',
                                                cursor: 'pointer'
                                            }}
                                            value={formData.vehicleType}
                                            onChange={handleChange}
                                            required
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
                                        >
                                            {vehicleTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Password Security */}
                        {currentStep === 3 && (
                            <div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    marginBottom: '24px'
                                }}>
                                    Security Settings
                                </h3>

                                {/* Password Validation Rules */}
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <h4 style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        marginBottom: '12px'
                                    }}>
                                        Password Requirements:
                                    </h4>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: passwordValidation.minLength ? '#10b981' : '#e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {passwordValidation.minLength && <FaCheck style={{ color: 'white', fontSize: '10px' }} />}
                                            </div>
                                            <span style={{
                                                fontSize: '14px',
                                                color: passwordValidation.minLength ? '#10b981' : '#64748b'
                                            }}>
                                                At least 6 characters
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: passwordValidation.hasUpperCase ? '#10b981' : '#e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {passwordValidation.hasUpperCase && <FaCheck style={{ color: 'white', fontSize: '10px' }} />}
                                            </div>
                                            <span style={{
                                                fontSize: '14px',
                                                color: passwordValidation.hasUpperCase ? '#10b981' : '#64748b'
                                            }}>
                                                At least one uppercase letter
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: passwordValidation.hasLowerCase ? '#10b981' : '#e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {passwordValidation.hasLowerCase && <FaCheck style={{ color: 'white', fontSize: '10px' }} />}
                                            </div>
                                            <span style={{
                                                fontSize: '14px',
                                                color: passwordValidation.hasLowerCase ? '#10b981' : '#64748b'
                                            }}>
                                                At least one lowercase letter
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: passwordValidation.hasNumber ? '#10b981' : '#e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {passwordValidation.hasNumber && <FaCheck style={{ color: 'white', fontSize: '10px' }} />}
                                            </div>
                                            <span style={{
                                                fontSize: '14px',
                                                color: passwordValidation.hasNumber ? '#10b981' : '#64748b'
                                            }}>
                                                At least one number
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: passwordValidation.hasSpecialChar ? '#10b981' : '#e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {passwordValidation.hasSpecialChar && <FaCheck style={{ color: 'white', fontSize: '10px' }} />}
                                            </div>
                                            <span style={{
                                                fontSize: '14px',
                                                color: passwordValidation.hasSpecialChar ? '#10b981' : '#64748b'
                                            }}>
                                                At least one special character (!@#$%^&*)
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: passwordValidation.passwordsMatch && formData.confirmPassword ? '#10b981' : '#e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {passwordValidation.passwordsMatch && formData.confirmPassword && <FaCheck style={{ color: 'white', fontSize: '10px' }} />}
                                            </div>
                                            <span style={{
                                                fontSize: '14px',
                                                color: passwordValidation.passwordsMatch && formData.confirmPassword ? '#10b981' : '#64748b'
                                            }}>
                                                Passwords match
                                            </span>
                                        </div>
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

                                {/* Confirm Password Field */}
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
                                        Confirm Password
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
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
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
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="Confirm your password"
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
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '40px'
                        }}>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    style={{
                                        padding: '14px 28px',
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#e2e8f0';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#f1f5f9';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    <FaArrowLeft />
                                    Previous
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    style={{
                                        padding: '14px 28px',
                                        backgroundColor: '#0066cc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginLeft: currentStep === 1 ? 'auto' : '0'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#0052a3';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 10px 20px rgba(0, 102, 204, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#0066cc';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    Next
                                    <FaArrowRight />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    style={{
                                        padding: '14px 28px',
                                        backgroundColor: '#0066cc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginLeft: 'auto'
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
                                        'Creating account...'
                                    ) : (
                                        <>
                                            <FaUserPlus />
                                            Create Account
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Login Link */}
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
                            Already have an account?{' '}
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
                    </div>
                </div>

                {/* Right Side - Dashboard Preview (Same as login) */}
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
                            Join Our Smart Traffic <br />Mangement Community
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
                            Register today to access real-time traffic updates, route optimization, and smart parking solutions. Be part of the future of urban mobility.
                        </p>
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

export default Register;