// src/services/database.js
class TrafficDatabase {
    constructor() {
        this.dbName = 'TrafficManagementDB';
        this.dbVersion = 1;
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('incidents')) {
                    const incidentsStore = db.createObjectStore('incidents', { keyPath: 'id', autoIncrement: true });
                    incidentsStore.createIndex('status', 'status', { unique: false });
                    incidentsStore.createIndex('severity', 'severity', { unique: false });
                    incidentsStore.createIndex('source', 'source', { unique: false });
                    incidentsStore.createIndex('reportedAt', 'reportedAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('userReports')) {
                    const userReportsStore = db.createObjectStore('userReports', { keyPath: 'id', autoIncrement: true });
                    userReportsStore.createIndex('status', 'status', { unique: false });
                    userReportsStore.createIndex('severity', 'severity', { unique: false });
                    userReportsStore.createIndex('submittedAt', 'submittedAt', { unique: false });
                }
            };
        });
    }

    // Add incident (Admin)
    async addIncident(incident) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['incidents'], 'readwrite');
            const store = transaction.objectStore('incidents');
            const request = store.add({
                ...incident,
                createdAt: new Date().toISOString()
            });

            request.onsuccess = () => {
                console.log('Incident added successfully');
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('Error adding incident:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Get all incidents (Admin)
    async getAllIncidents() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['incidents'], 'readonly');
            const store = transaction.objectStore('incidents');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = (event) => {
                console.error('Error getting incidents:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Update incident (Admin)
    async updateIncident(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['incidents'], 'readwrite');
            const store = transaction.objectStore('incidents');

            // First get the incident
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const incident = getRequest.result;
                if (!incident) {
                    reject(new Error('Incident not found'));
                    return;
                }

                const updatedIncident = {
                    ...incident,
                    ...updates,
                    updatedAt: new Date().toISOString()
                };

                const putRequest = store.put(updatedIncident);

                putRequest.onsuccess = () => {
                    console.log('Incident updated successfully');
                    resolve(updatedIncident);
                };

                putRequest.onerror = (event) => {
                    console.error('Error updating incident:', event.target.error);
                    reject(event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                console.error('Error getting incident:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Delete incident (Admin)
    async deleteIncident(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['incidents'], 'readwrite');
            const store = transaction.objectStore('incidents');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('Incident deleted successfully');
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('Error deleting incident:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Add user report
    async addUserReport(report) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userReports'], 'readwrite');
            const store = transaction.objectStore('userReports');
            const request = store.add({
                ...report,
                submittedAt: new Date().toISOString(),
                status: 'pending',
                reportId: `USR-${Date.now().toString().slice(-6)}`
            });

            request.onsuccess = () => {
                console.log('User report added successfully');
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('Error adding user report:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Get user reports (for specific user or all for admin)
    async getUserReports(userId = null) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userReports'], 'readonly');
            const store = transaction.objectStore('userReports');
            const request = store.getAll();

            request.onsuccess = () => {
                let reports = request.result || [];

                // Filter by user if userId provided
                if (userId) {
                    reports = reports.filter(report => report.userId === userId);
                }

                resolve(reports);
            };

            request.onerror = (event) => {
                console.error('Error getting user reports:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Update user report status (Admin)
    async updateUserReportStatus(id, status) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userReports'], 'readwrite');
            const store = transaction.objectStore('userReports');

            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const report = getRequest.result;
                if (!report) {
                    reject(new Error('Report not found'));
                    return;
                }

                const updatedReport = {
                    ...report,
                    status,
                    updatedAt: new Date().toISOString()
                };

                const putRequest = store.put(updatedReport);

                putRequest.onsuccess = () => {
                    console.log('User report updated successfully');
                    resolve(updatedReport);
                };

                putRequest.onerror = (event) => {
                    console.error('Error updating user report:', event.target.error);
                    reject(event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                console.error('Error getting user report:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Sync user reports to incidents (Admin function)
    async syncReportToIncident(reportId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Get the user report
                const transaction = this.db.transaction(['userReports'], 'readonly');
                const userStore = transaction.objectStore('userReports');
                const getRequest = userStore.get(reportId);

                getRequest.onsuccess = async () => {
                    const report = getRequest.result;
                    if (!report) {
                        reject(new Error('Report not found'));
                        return;
                    }

                    // Create incident from report
                    const incident = {
                        type: report.type,
                        location: report.location,
                        severity: report.severity,
                        description: report.description,
                        vehiclesInvolved: report.vehiclesInvolved || 0,
                        status: 'active',
                        reportedAt: report.submittedAt,
                        reportedBy: report.reportedBy,
                        contactNumber: report.contactNumber,
                        source: 'user',
                        evidence: report.evidenceType === 'none' ? 'No evidence' : `${report.evidenceType}: ${report.evidenceDescription}`,
                        emergencyServices: report.emergencyServices || [],
                        district: 'Jalandhar',
                        state: 'Punjab',
                        unitsAssigned: 1,
                        respondedBy: 'Pending'
                    };

                    // Add to incidents
                    const incidentId = await this.addIncident(incident);

                    // Update report status
                    await this.updateUserReportStatus(reportId, 'approved');

                    resolve({ incidentId, reportId });
                };

                getRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Clear all data (for testing)
    async clearDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.dbName);

            request.onsuccess = () => {
                console.log('Database cleared successfully');
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('Error clearing database:', event.target.error);
                reject(event.target.error);
            };
        });
    }
}

// Create singleton instance
const trafficDB = new TrafficDatabase();
export default trafficDB;