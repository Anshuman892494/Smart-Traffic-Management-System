// pages/Incidents.js (Admin version)
import React, { useState, useEffect } from 'react';
import {
    FaExclamationTriangle,
    FaSearch,
    FaFilter,
    FaEye,
    FaEdit,
    FaTrash,
    FaRoad,
    FaUsers,
    FaClock,
    FaMapMarkerAlt,
    FaMapMarkedAlt,
    FaCarCrash,
    FaUserMd,
    FaAmbulance,
    FaCheckCircle,
    FaTimesCircle,
    FaUserShield,
    FaDatabase,
    FaSync,
    FaUserCheck,
    FaBan,
    FaArrowUp
} from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import trafficDB from '../../services/database';
import '../../styles/main.css';

const Incidents = () => {
    const { user } = useAuth();
    const [incidents, setIncidents] = useState([]);
    const [userReports, setUserReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [unitsDeployed, setUnitsDeployed] = useState(0);
    const [activeIncidents, setActiveIncidents] = useState(0);
    const [dbInitialized, setDbInitialized] = useState(false);

    // Modal states
    const [showReportModal, setShowReportModal] = useState(false);
    const [showUserReportsModal, setShowUserReportsModal] = useState(false);
    const [newIncident, setNewIncident] = useState({
        type: 'Accident',
        location: '',
        severity: 'Medium',
        description: '',
        vehiclesInvolved: 1,
        reportedBy: 'Traffic Control Center',
        contactNumber: '',
        evidence: 'None',
        emergencyServices: []
    });

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
                await loadAllData();
            } catch (error) {
                console.error('Failed to initialize database:', error);
                alert('Failed to initialize local database. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        initializeDB();
    }, []);

    const loadAllData = async () => {
        try {
            // Load incidents
            const incidentsData = await trafficDB.getAllIncidents();
            setIncidents(incidentsData);

            // Load user reports
            const reportsData = await trafficDB.getUserReports();
            setUserReports(reportsData);

            // Calculate statistics
            const activeCount = incidentsData.filter(i => i.status === 'active').length;
            setActiveIncidents(activeCount);

            const totalUnits = incidentsData
                .filter(i => i.status === 'active')
                .reduce((sum, incident) => sum + (incident.unitsAssigned || 0), 0);
            setUnitsDeployed(totalUnits);

        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return '#ef4444';
            case 'resolved': return '#10b981';
            case 'pending': return '#f59e0b';
            case 'investigating': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const getSourceColor = (source) => {
        switch (source) {
            case 'user': return '#3b82f6';
            case 'admin': return '#8b5cf6';
            case 'system': return '#10b981';
            default: return '#6b7280';
        }
    };

    // Admin functions
    const handleOpenReportModal = () => {
        setShowReportModal(true);
    };

    const handleCloseReportModal = () => {
        setShowReportModal(false);
        setNewIncident({
            type: 'Accident',
            location: '',
            severity: 'Medium',
            description: '',
            vehiclesInvolved: 1,
            reportedBy: 'Traffic Control Center',
            contactNumber: '',
            evidence: 'None',
            emergencyServices: []
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewIncident(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitIncident = async (e) => {
        e.preventDefault();

        if (!newIncident.location.trim()) {
            alert('Please enter a location');
            return;
        }

        if (!newIncident.description.trim()) {
            alert('Please provide a description');
            return;
        }

        let unitsToAssign = 1;
        if (newIncident.severity === 'High') unitsToAssign = 3;
        if (newIncident.severity === 'Medium') unitsToAssign = 2;

        const newIncidentData = {
            type: newIncident.type,
            location: newIncident.location,
            severity: newIncident.severity,
            description: newIncident.description,
            vehiclesInvolved: parseInt(newIncident.vehiclesInvolved) || 1,
            status: 'active',
            reportedAt: new Date().toISOString(),
            reportedBy: newIncident.reportedBy,
            contactNumber: newIncident.contactNumber || '',
            source: 'admin',
            district: 'Jalandhar',
            state: 'Punjab',
            unitsAssigned: unitsToAssign,
            respondedBy: 'Pending',
            evidence: newIncident.evidence,
            emergencyServices: newIncident.emergencyServices || []
        };

        try {
            // Save to IndexedDB
            const incidentId = await trafficDB.addIncident(newIncidentData);

            // Update local state
            setIncidents(prev => [{ id: incidentId, ...newIncidentData }, ...prev]);
            setActiveIncidents(prev => prev + 1);
            setUnitsDeployed(prev => prev + unitsToAssign);
            handleCloseReportModal();

            alert(`Incident created successfully! Incident ID: ${incidentId}`);
        } catch (error) {
            console.error('Error creating incident:', error);
            alert('Failed to create incident. Please try again.');
        }
    };

    const handleViewDetails = (incident) => {
        const details = `
ADMIN VIEW - INCIDENT DETAILS
=============================
ID: ${incident.id}
Type: ${incident.type}
Location: ${incident.location}
Severity: ${incident.severity}
Status: ${incident.status}
Description: ${incident.description}
Vehicles Involved: ${incident.vehiclesInvolved}
Reported By: ${incident.reportedBy || 'Traffic Control'}
Contact: ${incident.contactNumber || 'Not provided'}
Reported At: ${formatDate(incident.reportedAt)}
Source: ${incident.source?.toUpperCase() || 'ADMIN'}
Responded By: ${incident.respondedBy}
Units Assigned: ${incident.unitsAssigned || 1}
District: ${incident.district}
State: ${incident.state}
Evidence: ${incident.evidence || 'None'}
Emergency Services: ${incident.emergencyServices?.join(', ') || 'None'}
${incident.resolvedAt ? `Resolved At: ${formatDate(incident.resolvedAt)}` : ''}
${incident.createdAt ? `Created: ${formatDate(incident.createdAt)}` : ''}
        `;
        alert(details);
    };

    const handleMarkResolved = async (incidentId) => {
        const incident = incidents.find(i => i.id === incidentId);
        if (!incident) return;

        if (window.confirm(`Mark incident #${incidentId} as resolved?\nThis will free up ${incident.unitsAssigned || 1} deployed units.`)) {
            try {
                await trafficDB.updateIncident(incidentId, {
                    status: 'resolved',
                    resolvedAt: new Date().toISOString()
                });

                await loadAllData();
                alert(`Incident #${incidentId} marked as resolved.`);
            } catch (error) {
                console.error('Error updating incident:', error);
                alert('Failed to update incident. Please try again.');
            }
        }
    };

    const handleEditIncident = async (incidentId) => {
        const incident = incidents.find(i => i.id === incidentId);
        if (incident) {
            const newSeverity = prompt(`Edit severity for incident at ${incident.location}:`, incident.severity);
            if (newSeverity && ['High', 'Medium', 'Low'].includes(newSeverity)) {
                try {
                    await trafficDB.updateIncident(incidentId, { severity: newSeverity });
                    await loadAllData();
                    alert(`Incident severity updated to ${newSeverity}`);
                } catch (error) {
                    console.error('Error updating incident:', error);
                    alert('Failed to update incident. Please try again.');
                }
            }
        }
    };

    const handleDeleteIncident = async (incidentId) => {
        const incident = incidents.find(i => i.id === incidentId);
        if (incident) {
            if (window.confirm(`Delete incident #${incidentId} at ${incident.location}?`)) {
                try {
                    await trafficDB.deleteIncident(incidentId);
                    await loadAllData();
                    alert(`Incident #${incidentId} deleted.`);
                } catch (error) {
                    console.error('Error deleting incident:', error);
                    alert('Failed to delete incident. Please try again.');
                }
            }
        }
    };

    const handleAssignUnits = async (incidentId) => {
        const incident = incidents.find(i => i.id === incidentId);
        if (incident) {
            const units = prompt(`Assign units to incident at ${incident.location}\nCurrent: ${incident.unitsAssigned || 1} units`, incident.unitsAssigned || 1);
            if (units && !isNaN(units) && parseInt(units) > 0) {
                try {
                    await trafficDB.updateIncident(incidentId, { unitsAssigned: parseInt(units) });
                    await loadAllData();
                    alert(`${units} units assigned to incident #${incidentId}`);
                } catch (error) {
                    console.error('Error updating units:', error);
                    alert('Failed to update units. Please try again.');
                }
            }
        }
    };

    const handleApproveUserReport = async (reportId) => {
        try {
            const result = await trafficDB.syncReportToIncident(reportId);
            await loadAllData();
            alert(`User report approved and converted to incident #${result.incidentId}`);
        } catch (error) {
            console.error('Error approving report:', error);
            alert('Failed to approve report. Please try again.');
        }
    };

    const handleRejectUserReport = async (reportId) => {
        if (window.confirm('Reject this user report?')) {
            try {
                await trafficDB.updateUserReportStatus(reportId, 'rejected');
                await loadAllData();
                alert('User report rejected.');
            } catch (error) {
                console.error('Error rejecting report:', error);
                alert('Failed to reject report. Please try again.');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredIncidents = incidents.filter(incident => {
        const matchesSearch = searchTerm === '' ||
            incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSeverity = severityFilter === '' ||
            incident.severity?.toLowerCase() === severityFilter.toLowerCase();

        const matchesSource = sourceFilter === '' || sourceFilter === 'all' ||
            incident.source === sourceFilter;

        return matchesSearch && matchesSeverity && matchesSource;
    });

    const pendingUserReports = userReports.filter(report => report.status === 'pending');
    const accidentsToday = incidents.filter(i => i.type === 'Accident').length;
    const userReportsCount = incidents.filter(i => i.source === 'user').length;

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
                    Loading Local Database...
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                    Loading incidents and user reports from browser storage
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaUserShield style={{ color: '#8b5cf6' }} />
                            Admin Dashboard - Local Database
                        </h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Manage incidents and user reports stored in browser's IndexedDB
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '10px',
                            fontSize: '13px',
                            color: '#64748b'
                        }}>
                            <span style={{
                                padding: '4px 8px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '4px',
                                border: '1px solid #e0f2fe'
                            }}>
                                Data stored in browser
                            </span>
                            <button
                                onClick={loadAllData}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px'
                                }}
                            >
                                <FaSync size={10} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleOpenReportModal}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaExclamationTriangle />
                            Create Incident
                        </button>

                        <button
                            className="btn btn-warning"
                            onClick={() => setShowUserReportsModal(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaUserCheck />
                            User Reports ({pendingUserReports.length})
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: '#ef4444'
                            }}>
                                <FaExclamationTriangle size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Active Incidents</div>
                                <div className="stat-value">{activeIncidents}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                            Stored in browser
                        </div>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: '#3b82f6'
                            }}>
                                <FaUserCheck size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Pending Reports</div>
                                <div className="stat-value">{pendingUserReports.length}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                            From public users
                        </div>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: '#10b981'
                            }}>
                                <FaUserMd size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Units Deployed</div>
                                <div className="stat-value">{unitsDeployed}/15</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                            {15 - unitsDeployed} units available
                        </div>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                            <div style={{
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                padding: '12px',
                                borderRadius: '50%',
                                color: '#8b5cf6'
                            }}>
                                <FaDatabase size={24} />
                            </div>
                            <div>
                                <div className="stat-label">Total Data</div>
                                <div className="stat-value">{incidents.length + userReports.length}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                            Items in local storage
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search incidents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 40px 10px 12px',
                                    border: '1px solid var(--gray-300)',
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
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaFilter style={{ color: 'var(--gray-color)' }} />
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '14px',
                                minWidth: '120px'
                            }}
                        >
                            <option value="">All Severity</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: 'var(--border-radius)',
                            fontSize: '14px',
                            minWidth: '120px'
                        }}
                    >
                        <option value="">All Sources</option>
                        <option value="user">User Reports</option>
                        <option value="admin">Admin Created</option>
                        <option value="system">System Generated</option>
                    </select>
                </div>
            </div>

            {/* Incidents Table */}
            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Location</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Units</th>
                                <th>Source</th>
                                <th>Reported</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncidents.map((incident) => (
                                <tr key={incident.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {incident.type === 'Accident' && <FaCarCrash style={{ color: '#ef4444' }} />}
                                            {incident.type === 'Road Block' && <FaRoad style={{ color: '#f59e0b' }} />}
                                            {incident.type === 'Vehicle Breakdown' && <FaCarCrash style={{ color: '#3b82f6' }} />}
                                            <div>
                                                <span style={{ fontWeight: '500' }}>{incident.type}</span>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                                    ID: {incident.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FaMapMarkerAlt style={{ color: '#ef4444', fontSize: '12px' }} />
                                            <div>
                                                <div>{incident.location}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                                                    {incident.description?.substring(0, 50)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: getSeverityColor(incident.severity) + '20',
                                            color: getSeverityColor(incident.severity)
                                        }}>
                                            {incident.severity}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: getStatusColor(incident.status) + '20',
                                            color: getStatusColor(incident.status),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {incident.status === 'resolved' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                            {incident.status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleAssignUnits(incident.id)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: '#f0f9ff',
                                                color: '#0369a1',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                fontSize: '14px',
                                                border: '1px solid #0369a1',
                                                cursor: 'pointer',
                                                minWidth: '40px'
                                            }}
                                            title="Click to change units"
                                        >
                                            {incident.unitsAssigned || 1}
                                        </button>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            backgroundColor: getSourceColor(incident.source) + '20',
                                            color: getSourceColor(incident.source),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            {incident.source === 'user' && <FaUserCheck size={10} />}
                                            {incident.source?.toUpperCase() || 'ADMIN'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '12px' }}>
                                            {formatDate(incident.reportedAt)}
                                        </div>
                                        {incident.resolvedAt && (
                                            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>
                                                Resolved: {formatDate(incident.resolvedAt)}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                className="btn"
                                                onClick={() => handleViewDetails(incident)}
                                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>

                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                                title="Edit"
                                                onClick={() => handleEditIncident(incident.id)}
                                            >
                                                <FaEdit />
                                            </button>

                                            {incident.status === 'active' ? (
                                                <button
                                                    className="btn btn-success"
                                                    style={{ padding: '6px 10px', fontSize: '12px' }}
                                                    title="Mark Resolved"
                                                    onClick={() => handleMarkResolved(incident.id)}
                                                >
                                                    <FaCheckCircle />
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn"
                                                    style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: '#10b981', color: 'white' }}
                                                    title="Already Resolved"
                                                    disabled
                                                >
                                                    ✓
                                                </button>
                                            )}

                                            <button
                                                className="btn btn-danger"
                                                style={{ padding: '6px 10px', fontSize: '12px' }}
                                                title="Delete"
                                                onClick={() => handleDeleteIncident(incident.id)}
                                            >
                                                <FaTimesCircle />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredIncidents.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            <FaExclamationTriangle />
                        </div>
                        <h3 className="empty-state-title">No Incidents Found</h3>
                        <p className="empty-state-description">
                            There are no incidents matching your criteria.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={handleOpenReportModal}
                            style={{ marginTop: '15px' }}
                        >
                            Create New Incident
                        </button>
                    </div>
                )}
            </div>

            {/* Database Management */}
            <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaDatabase style={{ color: '#8b5cf6' }} />
                    Database Management
                </h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <button
                        className="btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => {
                            const data = JSON.stringify({
                                incidents: incidents,
                                userReports: userReports,
                                exportedAt: new Date().toISOString()
                            });

                            const blob = new Blob([data], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `traffic-data-${new Date().toISOString().split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);

                            alert('Database exported successfully!');
                        }}
                    >
                        <FaArrowUp />
                        Export Database
                    </button>

                    <button
                        className="btn btn-warning"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={async () => {
                            if (window.confirm('Refresh all data from local database?')) {
                                await loadAllData();
                                alert('Data refreshed from local database');
                            }
                        }}
                    >
                        <FaSync />
                        Refresh All Data
                    </button>

                    <button
                        className="btn btn-danger"
                        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={async () => {
                            if (window.confirm('WARNING: This will clear ALL data from local storage. Are you sure?')) {
                                try {
                                    await trafficDB.clearDatabase();
                                    alert('Database cleared. Page will reload.');
                                    window.location.reload();
                                } catch (error) {
                                    console.error('Error clearing database:', error);
                                    alert('Failed to clear database.');
                                }
                            }
                        }}
                    >
                        <FaBan />
                        Clear Database
                    </button>
                </div>
            </div>

            {/* Create Incident Modal */}
            {showReportModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaUserShield style={{ color: '#8b5cf6' }} />
                                Create Incident (Local Storage)
                            </h2>
                            <button
                                onClick={handleCloseReportModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    padding: '5px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitIncident}>
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                            Incident Type *
                                        </label>
                                        <select
                                            name="type"
                                            value={newIncident.type}
                                            onChange={handleInputChange}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px'
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

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                            Location in Jalandhar *
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={newIncident.location}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Model Town, Jalandhar"
                                            list="jalandhar-locations"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px'
                                            }}
                                            required
                                        />
                                        <datalist id="jalandhar-locations">
                                            {jalandharLocations.map((loc, index) => (
                                                <option key={index} value={loc} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                            Severity Level *
                                        </label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {['High', 'Medium', 'Low'].map(level => (
                                                <label key={level} style={{ flex: 1 }}>
                                                    <input
                                                        type="radio"
                                                        name="severity"
                                                        value={level}
                                                        checked={newIncident.severity === level}
                                                        onChange={handleInputChange}
                                                        style={{ marginRight: '8px' }}
                                                    />
                                                    <span style={{
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        display: 'inline-block',
                                                        width: '100%',
                                                        textAlign: 'center',
                                                        backgroundColor: newIncident.severity === level ? getSeverityColor(level) + '20' : '#f8fafc',
                                                        border: `2px solid ${newIncident.severity === level ? getSeverityColor(level) : '#e2e8f0'}`,
                                                        color: newIncident.severity === level ? getSeverityColor(level) : '#64748b',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}>
                                                        {level}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            value={newIncident.description}
                                            onChange={handleInputChange}
                                            placeholder="Provide detailed description..."
                                            rows="3"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            backgroundColor: '#8b5cf6',
                                            border: 'none',
                                            borderRadius: '6px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '16px',
                                            marginTop: '10px'
                                        }}
                                    >
                                        Save to Local Database
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Reports Modal */}
            {showUserReportsModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '800px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaUserCheck style={{ color: '#3b82f6' }} />
                                User Reports ({pendingUserReports.length} Pending)
                            </h2>
                            <button
                                onClick={() => setShowUserReportsModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    padding: '5px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {pendingUserReports.length === 0 ? (
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
                                        <FaCheckCircle size={24} color="#10b981" />
                                    </div>
                                    <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No Pending Reports</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                        All user reports have been reviewed
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {pendingUserReports.map((report) => (
                                        <div
                                            key={report.id}
                                            style={{
                                                padding: '20px',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                backgroundColor: '#f8fafc'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                        <FaCarCrash style={{ color: getSeverityColor(report.severity) }} />
                                                        <h3 style={{ margin: 0, color: '#1e293b' }}>{report.type}</h3>
                                                        <span style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: getSeverityColor(report.severity) + '20',
                                                            color: getSeverityColor(report.severity),
                                                            borderRadius: '12px',
                                                            fontSize: '11px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {report.severity}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#475569', marginBottom: '5px' }}>
                                                        <FaMapMarkerAlt style={{ marginRight: '6px', color: '#ef4444' }} />
                                                        {report.location}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                        Reported by: {report.reportedBy} • {report.contactNumber}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#fef3c7',
                                                    color: '#92400e',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '600'
                                                }}>
                                                    PENDING
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <p style={{ color: '#475569', fontSize: '14px' }}>
                                                    {report.description}
                                                </p>
                                                {report.emergencyServices && report.emergencyServices.length > 0 && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                                                            Emergency Services Requested:
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                            {report.emergencyServices.map((service, index) => (
                                                                <span key={index} style={{
                                                                    padding: '4px 8px',
                                                                    backgroundColor: '#dcfce7',
                                                                    color: '#166534',
                                                                    borderRadius: '12px',
                                                                    fontSize: '11px'
                                                                }}>
                                                                    {service}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                gap: '10px',
                                                borderTop: '1px solid #e2e8f0',
                                                paddingTop: '15px'
                                            }}>
                                                <button
                                                    onClick={() => handleRejectUserReport(report.id)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: '#fef2f2',
                                                        border: '1px solid #fecaca',
                                                        borderRadius: '6px',
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <FaBan style={{ marginRight: '6px' }} />
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleApproveUserReport(report.id)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        backgroundColor: '#3b82f6',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <FaCheckCircle />
                                                    Approve & Create Incident
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Incidents;