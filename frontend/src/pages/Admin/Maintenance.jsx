import React, { useState, useEffect } from 'react';
import {
    FaWrench,
    FaServer,
    FaDatabase,
    FaSync,
    FaCheckCircle,
    FaExclamationTriangle,
    FaClock,
    FaCalendarAlt,
    FaDownload,
    FaUpload,
    FaTrash,
    FaCogs,
    FaShieldAlt,
    FaNetworkWired,
    FaMemory,
    FaHdd,
    FaCpu,
    FaChartLine
} from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import '../../styles/main.css';

const Maintenance = () => {
    const [loading, setLoading] = useState(true);
    const [systemStatus, setSystemStatus] = useState({
        database: { status: 'healthy', lastBackup: '2 hours ago' },
        api: { status: 'healthy', responseTime: '120ms' },
        cache: { status: 'warning', size: '85%' },
        storage: { status: 'healthy', used: '65%' }
    });
    const [tasks, setTasks] = useState([]);
    const [backups, setBackups] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            // Mock system status data
            setSystemStatus({
                database: {
                    status: 'healthy',
                    lastBackup: '2 hours ago',
                    connections: 45,
                    size: '2.4 GB'
                },
                api: {
                    status: 'healthy',
                    responseTime: '120ms',
                    requests: '1.2M/day',
                    uptime: '99.8%'
                },
                cache: {
                    status: 'warning',
                    size: '85%',
                    hitRate: '92%',
                    memory: '512 MB'
                },
                storage: {
                    status: 'healthy',
                    used: '65%',
                    total: '50 GB',
                    files: '12,458'
                }
            });

            // Mock maintenance tasks - December 2025 only
            setTasks([
                {
                    id: 1,
                    name: 'Database Optimization',
                    description: 'Optimize database indexes and clean up old records',
                    schedule: 'Weekly',
                    lastRun: '2025-12-14T22:00:00',
                    nextRun: '2025-12-21T22:00:00',
                    status: 'scheduled',
                    duration: '45 minutes'
                },
                {
                    id: 2,
                    name: 'Cache Clear',
                    description: 'Clear expired cache entries',
                    schedule: 'Daily',
                    lastRun: '2025-12-15T04:00:00',
                    nextRun: '2025-12-16T04:00:00',
                    status: 'completed',
                    duration: '5 minutes'
                },
                {
                    id: 3,
                    name: 'Log Rotation',
                    description: 'Rotate and archive system logs',
                    schedule: 'Daily',
                    lastRun: '2025-12-15T03:00:00',
                    nextRun: '2025-12-16T03:00:00',
                    status: 'completed',
                    duration: '10 minutes'
                },
                {
                    id: 4,
                    name: 'System Backup',
                    description: 'Full system backup including database and files',
                    schedule: 'Daily',
                    lastRun: '2025-12-15T02:00:00',
                    nextRun: '2025-12-16T02:00:00',
                    status: 'completed',
                    duration: '30 minutes'
                },
                {
                    id: 5,
                    name: 'Security Update',
                    description: 'Apply latest security patches',
                    schedule: 'Monthly',
                    lastRun: '2025-12-01T01:00:00',
                    nextRun: '2026-01-01T01:00:00',
                    status: 'scheduled',
                    duration: '60 minutes'
                },
                {
                    id: 6,
                    name: 'Year-End Cleanup',
                    description: 'Annual system cleanup and optimization',
                    schedule: 'Yearly',
                    lastRun: '2024-12-31T23:00:00',
                    nextRun: '2025-12-31T23:00:00',
                    status: 'scheduled',
                    duration: '90 minutes'
                },
                {
                    id: 7,
                    name: 'Performance Review',
                    description: 'Monthly performance metrics analysis',
                    schedule: 'Monthly',
                    lastRun: '2025-11-30T23:00:00',
                    nextRun: '2025-12-31T23:00:00',
                    status: 'scheduled',
                    duration: '30 minutes'
                }
            ]);

            // Mock backup data - December 2025 only
            setBackups([
                {
                    id: 1,
                    name: 'Full Backup - Dec 15',
                    type: 'Full',
                    size: '2.1 GB',
                    date: '2025-12-15T02:00:00',
                    status: 'completed'
                },
                {
                    id: 2,
                    name: 'Incremental Backup - Dec 15',
                    type: 'Incremental',
                    size: '120 MB',
                    date: '2025-12-15T14:00:00',
                    status: 'completed'
                },
                {
                    id: 3,
                    name: 'Full Backup - Dec 14',
                    type: 'Full',
                    size: '2.0 GB',
                    date: '2025-12-14T02:00:00',
                    status: 'completed'
                },
                {
                    id: 4,
                    name: 'Database Export - Dec 13',
                    type: 'Export',
                    size: '1.8 GB',
                    date: '2025-12-13T03:00:00',
                    status: 'completed'
                },
                {
                    id: 5,
                    name: 'Monthly Archive - Dec 1',
                    type: 'Archive',
                    size: '4.2 GB',
                    date: '2025-12-01T04:00:00',
                    status: 'completed'
                },
                {
                    id: 6,
                    name: 'Year-End Backup - 2025 Preview',
                    type: 'Full',
                    size: '2.5 GB',
                    date: '2025-12-10T01:00:00',
                    status: 'completed'
                }
            ]);

            setLoading(false);
        }, 1500);
    }, []);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'healthy': return '#10b981';
            case 'warning': return '#f59e0b';
            case 'critical': return '#ef4444';
            case 'scheduled': return '#3b82f6';
            case 'running': return '#8b5cf6';
            case 'completed': return '#10b981';
            case 'failed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'healthy':
            case 'completed':
                return <FaCheckCircle style={{ color: '#10b981' }} />;
            case 'warning':
                return <FaExclamationTriangle style={{ color: '#f59e0b' }} />;
            case 'critical':
            case 'failed':
                return <FaExclamationTriangle style={{ color: '#ef4444' }} />;
            case 'scheduled':
                return <FaClock style={{ color: '#3b82f6' }} />;
            case 'running':
                return <FaSync style={{ color: '#8b5cf6' }} />;
            default:
                return <FaClock style={{ color: '#6b7280' }} />;
        }
    };

    const handleRunTask = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            alert(`Running task: ${task.name}\nThis will execute the maintenance task now.`);
            // In real implementation, call API to run task
        }
    };

    const handleCreateBackup = () => {
        alert('Creating new system backup...\nThis may take several minutes.');
        // In real implementation, call backup API
    };

    const handleRestoreBackup = (backupId) => {
        const backup = backups.find(b => b.id === backupId);
        if (backup) {
            if (window.confirm(`Restore from backup: ${backup.name}?\nThis will restore the system to this backup point.`)) {
                alert(`Starting restore from backup: ${backup.name}`);
                // In real implementation, call restore API
            }
        }
    };

    const handleClearCache = () => {
        if (window.confirm('Clear all system cache?\nThis will temporarily affect performance while cache rebuilds.')) {
            alert('Clearing system cache...');
            // In real implementation, call cache clear API
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFullDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader type="spinner" text="Loading system status..." />
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
                            <FaWrench style={{ color: '#3b82f6' }} />
                            System Maintenance - December 2025
                        </h1>
                        <p style={{ color: 'var(--gray-600)' }}>
                            Monitor system health and manage maintenance tasks for December 2025
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreateBackup}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaDownload />
                            Create Backup
                        </button>

                        <button
                            className="btn"
                            onClick={handleClearCache}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaSync />
                            Clear Cache
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--gray-200)',
                    marginBottom: '20px'
                }}>
                    {['overview', 'tasks', 'backups', 'system'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 20px',
                                background: 'none',
                                border: 'none',
                                borderBottom: `3px solid ${activeTab === tab ? '#3b82f6' : 'transparent'}`,
                                color: activeTab === tab ? '#3b82f6' : 'var(--gray-600)',
                                fontWeight: activeTab === tab ? '600' : '500',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab === 'overview' && 'Overview'}
                            {tab === 'tasks' && 'Maintenance Tasks'}
                            {tab === 'backups' && 'Backups'}
                            {tab === 'system' && 'System Info'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div>
                    {/* System Health Cards */}
                    <div className="stats-grid" style={{ marginBottom: '30px' }}>
                        <div className="stat-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                <div style={{
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    padding: '12px',
                                    borderRadius: '50%',
                                    color: '#10b981'
                                }}>
                                    <FaDatabase size={24} />
                                </div>
                                <div>
                                    <div className="stat-label">Database</div>
                                    <div className="stat-value" style={{ color: getStatusColor(systemStatus.database.status) }}>
                                        {systemStatus.database.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                                Last backup: {systemStatus.database.lastBackup}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '5px' }}>
                                {systemStatus.database.connections} connections • {systemStatus.database.size}
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
                                    <FaNetworkWired size={24} />
                                </div>
                                <div>
                                    <div className="stat-label">API Server</div>
                                    <div className="stat-value" style={{ color: getStatusColor(systemStatus.api.status) }}>
                                        {systemStatus.api.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                                Response: {systemStatus.api.responseTime}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '5px' }}>
                                {systemStatus.api.requests} • Uptime: {systemStatus.api.uptime}
                            </div>
                        </div>

                        <div className="stat-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                                <div style={{
                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                    padding: '12px',
                                    borderRadius: '50%',
                                    color: '#f59e0b'
                                }}>
                                    <FaMemory size={24} />
                                </div>
                                <div>
                                    <div className="stat-label">Cache</div>
                                    <div className="stat-value" style={{ color: getStatusColor(systemStatus.cache.status) }}>
                                        {systemStatus.cache.size}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                                Status: {systemStatus.cache.status}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '5px' }}>
                                Hit rate: {systemStatus.cache.hitRate} • {systemStatus.cache.memory}
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
                                    <FaHdd size={24} />
                                </div>
                                <div>
                                    <div className="stat-label">Storage</div>
                                    <div className="stat-value">{systemStatus.storage.used}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                                Status: {systemStatus.storage.status}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '5px' }}>
                                {systemStatus.storage.total} • {systemStatus.storage.files} files
                            </div>
                        </div>
                    </div>

                    {/* December 2025 Quick Actions */}
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaCalendarAlt />
                            December 2025 Actions
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <button
                                className="btn"
                                onClick={() => alert('Preparing year-end database optimization...')}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '20px',
                                    textAlign: 'center'
                                }}
                            >
                                <FaDatabase size={24} style={{ marginBottom: '10px', color: '#3b82f6' }} />
                                <span style={{ fontWeight: '600', marginBottom: '5px' }}>Year-End DB Cleanup</span>
                                <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Prepare database for year-end</span>
                            </button>

                            <button
                                className="btn"
                                onClick={() => alert('Creating December 2025 archive...')}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '20px',
                                    textAlign: 'center'
                                }}
                            >
                                <FaShieldAlt size={24} style={{ marginBottom: '10px', color: '#10b981' }} />
                                <span style={{ fontWeight: '600', marginBottom: '5px' }}>Monthly Archive</span>
                                <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Create December archive backup</span>
                            </button>

                            <button
                                className="btn"
                                onClick={() => alert('Generating December 2025 performance report...')}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '20px',
                                    textAlign: 'center'
                                }}
                            >
                                <FaChartLine size={24} style={{ marginBottom: '10px', color: '#8b5cf6' }} />
                                <span style={{ fontWeight: '600', marginBottom: '5px' }}>December Report</span>
                                <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Generate monthly performance report</span>
                            </button>

                            <button
                                className="btn"
                                onClick={() => alert('Running December maintenance checks...')}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '20px',
                                    textAlign: 'center'
                                }}
                            >
                                <FaServer size={24} style={{ marginBottom: '10px', color: '#f59e0b' }} />
                                <span style={{ fontWeight: '600', marginBottom: '5px' }}>December Maintenance</span>
                                <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Run December system checks</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Tasks Tab */}
            {activeTab === 'tasks' && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaCalendarAlt />
                            December 2025 Maintenance Tasks
                        </h3>
                        <button
                            className="btn btn-primary"
                            onClick={() => alert('Add new maintenance task')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FaWrench />
                            Add Task
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Schedule</th>
                                    <th>Last Run</th>
                                    <th>Next Run</th>
                                    <th>Status</th>
                                    <th>Duration</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{task.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{task.description}</div>
                                            </div>
                                        </td>
                                        <td>{task.schedule}</td>
                                        <td>{formatFullDate(task.lastRun)}</td>
                                        <td>{formatFullDate(task.nextRun)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {getStatusIcon(task.status)}
                                                <span style={{
                                                    color: getStatusColor(task.status),
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{task.duration}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleRunTask(task.id)}
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    disabled={task.status === 'running'}
                                                >
                                                    Run Now
                                                </button>
                                                <button
                                                    className="btn"
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    onClick={() => alert(`Edit task: ${task.name}`)}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Backups Tab */}
            {activeTab === 'backups' && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaCalendarAlt />
                            December 2025 Backups
                        </h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="btn"
                                onClick={() => alert('Configure backup settings')}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FaCogs />
                                Settings
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateBackup}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FaDownload />
                                New Backup
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Backup Name</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Date Created</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backups.map((backup) => (
                                    <tr key={backup.id}>
                                        <td style={{ fontWeight: '600' }}>{backup.name}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor: backup.type === 'Full' ? '#dbeafe' :
                                                    backup.type === 'Archive' ? '#fef3c7' : '#f0f9ff',
                                                color: backup.type === 'Full' ? '#1e40af' :
                                                    backup.type === 'Archive' ? '#92400e' : '#0369a1'
                                            }}>
                                                {backup.type}
                                            </span>
                                        </td>
                                        <td>{backup.size}</td>
                                        <td>{formatFullDate(backup.date)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {getStatusIcon(backup.status)}
                                                <span style={{
                                                    color: getStatusColor(backup.status),
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {backup.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleRestoreBackup(backup.id)}
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    className="btn"
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    onClick={() => alert(`Download backup: ${backup.name}`)}
                                                >
                                                    <FaDownload />
                                                </button>
                                                <button
                                                    className="btn"
                                                    style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444' }}
                                                    onClick={() => {
                                                        if (window.confirm(`Delete backup: ${backup.name}?`)) {
                                                            alert(`Deleting backup: ${backup.name}`);
                                                        }
                                                    }}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* System Info Tab */}
            {activeTab === 'system' && (
                <div>
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaServer />
                            System Information
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div>
                                <h4 style={{ marginBottom: '10px', color: 'var(--gray-700)' }}>Server Details</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Hostname:</span>
                                        <span style={{ fontWeight: '500' }}>traffic-server-01</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>IP Address:</span>
                                        <span style={{ fontWeight: '500' }}>192.168.1.100</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>OS:</span>
                                        <span style={{ fontWeight: '500' }}>Ubuntu 22.04 LTS</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Current Date:</span>
                                        <span style={{ fontWeight: '500' }}>December 2025</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '10px', color: 'var(--gray-700)' }}>Hardware</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>CPU:</span>
                                        <span style={{ fontWeight: '500' }}>Intel Xeon E5-2680 (8 cores)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Memory:</span>
                                        <span style={{ fontWeight: '500' }}>16 GB (62% used)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Storage:</span>
                                        <span style={{ fontWeight: '500' }}>500 GB SSD</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Uptime:</span>
                                        <span style={{ fontWeight: '500' }}>Since Dec 1, 2025</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '10px', color: 'var(--gray-700)' }}>Software</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Node.js:</span>
                                        <span style={{ fontWeight: '500' }}>v18.17.1</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>MongoDB:</span>
                                        <span style={{ fontWeight: '500' }}>6.0.8</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>React:</span>
                                        <span style={{ fontWeight: '500' }}>18.2.0</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>App Version:</span>
                                        <span style={{ fontWeight: '500' }}>2025.12.1</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaNetworkWired />
                            Network Information
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div>
                                <h4 style={{ marginBottom: '10px', color: 'var(--gray-700)' }}>Services</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>API Server:</span>
                                        <span style={{ color: '#10b981', fontWeight: '500' }}>Running (Port 5000)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Frontend:</span>
                                        <span style={{ color: '#10b981', fontWeight: '500' }}>Running (Port 3000)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>MongoDB:</span>
                                        <span style={{ color: '#10b981', fontWeight: '500' }}>Running (Port 27017)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Redis Cache:</span>
                                        <span style={{ color: '#10b981', fontWeight: '500' }}>Running (Port 6379)</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '10px', color: 'var(--gray-700)' }}>Network</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Public IP:</span>
                                        <span style={{ fontWeight: '500' }}>203.0.113.45</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Load Balancer:</span>
                                        <span style={{ color: '#10b981', fontWeight: '500' }}>Active</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>SSL Certificate:</span>
                                        <span style={{ color: '#10b981', fontWeight: '500' }}>Valid (Expires: 2026-12-31)</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--gray-600)' }}>Firewall:</span>
                                        <span style={{ color: '#10b981', fontWeight: '500' }}>Enabled</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* December 2025 Specific Actions */}
            <div className="card" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCalendarAlt />
                    December 2025 Year-End Actions
                </h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-warning"
                        onClick={() => {
                            if (window.confirm('Prepare system for year-end? This will create final backups and reports.')) {
                                alert('Preparing year-end system procedures...');
                            }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaCalendarAlt />
                        Year-End Preparation
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={() => {
                            if (window.confirm('Create final December 2025 archive? This will archive all December data.')) {
                                alert('Creating December 2025 archive...');
                            }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaDownload />
                        December Archive
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={() => {
                            if (window.confirm('Reset all logs for 2026? This will archive current logs and start fresh.')) {
                                alert('Resetting logs for 2026...');
                            }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaTrash />
                        Reset 2026 Logs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;