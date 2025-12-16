// pages/UserReport.js
import React, { useState, useEffect } from 'react';
import {
    FaExclamationTriangle,
    FaMapPin,
    FaCarCrash,
    FaFileAlt,
    FaUser,
    FaPhone,
    FaCamera,
    FaAmbulance,
    FaUserMd,
    FaCalendar,
    FaCheckCircle,
    FaArrowLeft,
    FaDatabase,
    FaSync
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import trafficDB from '../../services/database';

const UserReport = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'Accident',
        location: '',
        severity: 'Medium',
        description: '',
        vehiclesInvolved: 1,
        reportedBy: '',
        contactNumber: '',
        evidenceType: 'photo',
        evidenceDescription: '',
        emergencyServices: []
    });

    const [submittedReports, setSubmittedReports] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [latestReportId, setLatestReportId] = useState(null);
    const [dbInitialized, setDbInitialized] = useState(false);
    const [loading, setLoading] = useState(true);

    // Jalandhar specific locations
    const jalandharLocations = [
        'Model Town, Jalandhar',
        'Nakodar Road, Jalandhar',
        'GT Road, Jalandhar',
        'Guru Gobind Singh Marg, Jalandhar',
        'Civil Lines, Jalandhar',
        'Phagwara Highway, Jalandhar',
        'Ladowali Road, Jalandhar',
        'PAP Chowk, Jalandhar',
        'Lovely University, Jalandhar',
        'DC Office, Jalandhar',
        'Civil Hospital, Jalandhar',
        'Sports College, Jalandhar',
        'Basti Nau, Jalandhar',
        'Adarsh Nagar, Jalandhar',
        'Rama Mandi, Jalandhar'
    ];

    // Initialize database and load data
    useEffect(() => {
        const initializeDB = async () => {
            try {
                await trafficDB.init();
                setDbInitialized(true);

                // Load user's reports
                const reports = await trafficDB.getUserReports();
                setSubmittedReports(reports);
            } catch (error) {
                console.error('Failed to initialize database:', error);
                alert('Failed to initialize local database. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        initializeDB();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmergencyServiceToggle = (service) => {
        setFormData(prev => {
            const services = prev.emergencyServices.includes(service)
                ? prev.emergencyServices.filter(s => s !== service)
                : [...prev.emergencyServices, service];
            return { ...prev, emergencyServices: services };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!dbInitialized) {
            alert('Database not initialized. Please wait or refresh the page.');
            return;
        }

        // Validation
        if (!formData.location.trim()) {
            alert('Please enter the incident location');
            return;
        }

        if (!formData.description.trim()) {
            alert('Please provide a description of the incident');
            return;
        }

        if (!formData.reportedBy.trim()) {
            alert('Please enter your name');
            return;
        }

        // Simple phone validation
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = formData.contactNumber.replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        setIsSubmitting(true);

        try {
            // Save to IndexedDB
            const reportId = await trafficDB.addUserReport({
                ...formData,
                userId: 'user_' + Date.now(), // In real app, use actual user ID
                contactNumber: cleanPhone,
                vehiclesInvolved: parseInt(formData.vehiclesInvolved) || 0
            });

            // Generate readable report ID
            const readableReportId = `USR-${Date.now().toString().slice(-6)}`;

            // Update local state
            const newReport = {
                id: reportId,
                ...formData,
                reportId: readableReportId,
                submittedAt: new Date().toISOString(),
                status: 'pending'
            };

            setSubmittedReports(prev => [newReport, ...prev]);
            setLatestReportId(readableReportId);
            setShowSuccess(true);

            // Reset form
            setFormData({
                type: 'Accident',
                location: '',
                severity: 'Medium',
                description: '',
                vehiclesInvolved: 1,
                reportedBy: '',
                contactNumber: '',
                evidenceType: 'photo',
                evidenceDescription: '',
                emergencyServices: []
            });

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 5000);

            console.log('Report saved to database with ID:', reportId);

        } catch (error) {
            console.error('Error saving report:', error);
            alert('Failed to save report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSeverityColor = (severity) => {
        switch (severity.toLowerCase()) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'approved': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f8fafc'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}>
                    <FaDatabase size={24} color="#64748b" />
                </div>
                <h3 style={{ color: '#475569', marginBottom: '10px' }}>
                    Initializing Local Database...
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                    Please wait while we set up your local storage
                </p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Database Status */}

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                    padding: '8px 16px',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: '#475569',
                    fontWeight: '500'
                }}
            >
                <FaArrowLeft />
                Back
            </button>

            {/* Success Message */}
            {showSuccess && (
                <div style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <FaCheckCircle size={24} />
                    <div>
                        <div style={{ fontWeight: '600', fontSize: '16px' }}>
                            Report Saved Locally!
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>
                            Your report ID is: <strong>{latestReportId}</strong>
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                            Data is stored in your browser. Admins will review it.
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0'
            }}>
                <h1 style={{
                    fontSize: '24px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#1e293b'
                }}>
                    <FaExclamationTriangle style={{ color: '#ef4444' }} />
                    Report Traffic Incident
                </h1>
                <p style={{ color: '#64748b', marginBottom: '5px' }}>
                    Use this form to report traffic incidents in Jalandhar, Punjab
                </p>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #e0f2fe'
                }}>
                    <FaDatabase style={{ color: '#0ea5e9' }} />
                    <span style={{ fontSize: '13px', color: '#0369a1' }}>
                        Reports are saved locally in your browser. Total saved: {submittedReports.length}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Left Column - Report Form */}
                <div>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '25px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>
                            Incident Details
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {/* Incident Type */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                        <FaCarCrash style={{ marginRight: '8px', color: '#ef4444' }} />
                                        Incident Type *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: '#f8fafc'
                                        }}
                                        required
                                    >
                                        <option value="Accident">Accident</option>
                                        <option value="Road Block">Road Block</option>
                                        <option value="Vehicle Breakdown">Vehicle Breakdown</option>
                                        <option value="Traffic Signal Failure">Traffic Signal Failure</option>
                                        <option value="Protest March">Protest March</option>
                                        <option value="Fog Accident">Fog Accident</option>
                                        <option value="Water Logging">Water Logging</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Location */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                        <FaMapPin style={{ marginRight: '8px', color: '#ef4444' }} />
                                        Location in Jalandhar *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Model Town, Jalandhar"
                                        list="jalandhar-locations"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: '#f8fafc'
                                        }}
                                        required
                                    />
                                    <datalist id="jalandhar-locations">
                                        {jalandharLocations.map((loc, index) => (
                                            <option key={index} value={loc} />
                                        ))}
                                    </datalist>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                        Select or type a Jalandhar location
                                    </div>
                                </div>

                                {/* Severity */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#1e293b' }}>
                                        <FaExclamationTriangle style={{ marginRight: '8px', color: '#f59e0b' }} />
                                        Severity Level *
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {['High', 'Medium', 'Low'].map(level => (
                                            <label key={level} style={{ flex: 1 }}>
                                                <input
                                                    type="radio"
                                                    name="severity"
                                                    value={level}
                                                    checked={formData.severity === level}
                                                    onChange={handleInputChange}
                                                    style={{ display: 'none' }}
                                                />
                                                <div style={{
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    textAlign: 'center',
                                                    backgroundColor: formData.severity === level ? getSeverityColor(level) + '20' : '#f8fafc',
                                                    border: `2px solid ${formData.severity === level ? getSeverityColor(level) : '#e2e8f0'}`,
                                                    color: formData.severity === level ? getSeverityColor(level) : '#64748b',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    {level}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                        <FaFileAlt style={{ marginRight: '8px', color: '#3b82f6' }} />
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Please provide detailed description of the incident..."
                                        rows="4"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: '#f8fafc',
                                            resize: 'vertical'
                                        }}
                                        required
                                    />
                                </div>

                                {/* Vehicles Involved */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                        <FaCarCrash style={{ marginRight: '8px', color: '#8b5cf6' }} />
                                        Vehicles Involved
                                    </label>
                                    <input
                                        type="number"
                                        name="vehiclesInvolved"
                                        value={formData.vehiclesInvolved}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="20"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: '#f8fafc'
                                        }}
                                    />
                                </div>

                                {/* Reporter Information */}
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                    <h3 style={{ marginBottom: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaUser style={{ color: '#10b981' }} />
                                        Your Information
                                    </h3>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#475569' }}>
                                                Your Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="reportedBy"
                                                value={formData.reportedBy}
                                                onChange={handleInputChange}
                                                placeholder="Enter your name"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#f8fafc'
                                                }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#475569' }}>
                                                <FaPhone style={{ marginRight: '4px' }} />
                                                Contact Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="contactNumber"
                                                value={formData.contactNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter 10-digit mobile number"
                                                pattern="[0-9]{10}"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#f8fafc'
                                                }}
                                                required
                                            />
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                For emergency contact if needed
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Services */}
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#1e293b' }}>
                                        <FaAmbulance style={{ marginRight: '8px', color: '#ef4444' }} />
                                        Request Emergency Services
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {['Ambulance', 'Police', 'Fire Brigade', 'Tow Truck'].map(service => (
                                            <label key={service} style={{ cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.emergencyServices.includes(service)}
                                                    onChange={() => handleEmergencyServiceToggle(service)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                <span style={{
                                                    padding: '10px 15px',
                                                    borderRadius: '8px',
                                                    backgroundColor: formData.emergencyServices.includes(service) ? '#dcfce7' : '#f8fafc',
                                                    border: `2px solid ${formData.emergencyServices.includes(service) ? '#10b981' : '#e2e8f0'}`,
                                                    color: formData.emergencyServices.includes(service) ? '#166534' : '#64748b',
                                                    fontWeight: '500',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    width: '100%'
                                                }}>
                                                    {service === 'Ambulance' && <FaAmbulance />}
                                                    {service === 'Police' && <FaUserMd />}
                                                    {service === 'Fire Brigade' && <FaExclamationTriangle />}
                                                    {service === 'Tow Truck' && <FaCarCrash />}
                                                    {service}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !dbInitialized}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        backgroundColor: isSubmitting ? '#94a3b8' : (!dbInitialized ? '#cbd5e1' : '#ef4444'),
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: (isSubmitting || !dbInitialized) ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        marginTop: '10px',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>Saving to Local Database...</>
                                    ) : !dbInitialized ? (
                                        <>Database Not Ready</>
                                    ) : (
                                        <>
                                            <FaExclamationTriangle />
                                            Submit Incident Report
                                        </>
                                    )}
                                </button>

                                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '10px' }}>
                                    * Required fields. Data is stored locally in your browser.
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column - Submitted Reports */}
                <div>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '25px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0',
                        height: 'fit-content'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaCalendar />
                                Your Reports ({submittedReports.length})
                            </h2>
                            <button
                                onClick={async () => {
                                    try {
                                        const reports = await trafficDB.getUserReports();
                                        setSubmittedReports(reports);
                                        alert('Reports refreshed from local database');
                                    } catch (error) {
                                        console.error('Error refreshing reports:', error);
                                    }
                                }}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    color: '#475569'
                                }}
                            >
                                <FaSync size={12} />
                                Refresh
                            </button>
                        </div>

                        {submittedReports.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 15px'
                                }}>
                                    <FaFileAlt size={24} color="#94a3b8" />
                                </div>
                                <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No Reports Yet</h3>
                                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                    Submit your first incident report using the form
                                </p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {submittedReports.map((report, index) => (
                                    <div
                                        key={report.id}
                                        style={{
                                            padding: '15px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            marginBottom: '12px',
                                            backgroundColor: index === 0 ? '#f0f9ff' : 'white',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                    <FaCarCrash style={{ color: getSeverityColor(report.severity) }} />
                                                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                                                        {report.type}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                    {report.location}
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: '4px 10px',
                                                backgroundColor: getStatusColor(report.status) + '20',
                                                color: getStatusColor(report.status),
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                {report.status?.toUpperCase() || 'PENDING'}
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                            <div>Report ID: {report.reportId || `LOCAL-${report.id}`}</div>
                                            <div>Submitted: {formatDate(report.submittedAt || report.createdAt)}</div>
                                            {report.emergencyServices && report.emergencyServices.length > 0 && (
                                                <div style={{ marginTop: '5px' }}>
                                                    Services: {report.emergencyServices.join(', ')}
                                                </div>
                                            )}
                                        </div>

                                        {/* Local Storage Indicator */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            fontSize: '10px',
                                            color: '#94a3b8',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <FaDatabase size={8} />
                                            Local
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h4 style={{ marginBottom: '8px', color: '#1e293b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaDatabase style={{ color: '#0ea5e9' }} />
                                About Local Storage
                            </h4>
                            <ul style={{ fontSize: '13px', color: '#64748b', paddingLeft: '20px', margin: 0 }}>
                                <li>Reports are saved in your browser's IndexedDB</li>
                                <li>Data persists even if you close the browser</li>
                                <li>You can view your reports anytime</li>
                                <li>Admins can access these reports separately</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#64748b',
                textAlign: 'center'
            }}>
                <p>
                    <strong>Emergency Contact:</strong> 108 (Ambulance) | 100 (Police) | 101 (Fire)
                </p>
                <p style={{ marginTop: '5px', fontSize: '12px' }}>
                    Jalandhar Traffic Control Center | December 2025 | Local Browser Storage
                </p>
            </div>
        </div>
    );
};

export default UserReport;