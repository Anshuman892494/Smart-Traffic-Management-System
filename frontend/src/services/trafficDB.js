// src/services/trafficDB.js
class TrafficDatabase {
    constructor() {
        this.dbName = 'TrafficLightsDB';
        this.dbVersion = 2; // Increment version
        this.db = null;
        this.autoCycleInterval = null;
        this.cycleListeners = [];
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
                console.log('Traffic Lights Database initialized successfully');

                // Start auto-cycling
                this.startAutoCycling();

                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create traffic lights store
                if (!db.objectStoreNames.contains('trafficLights')) {
                    const trafficLightsStore = db.createObjectStore('trafficLights', { keyPath: 'id' });
                    trafficLightsStore.createIndex('location', 'location', { unique: false });
                    trafficLightsStore.createIndex('status', 'status', { unique: false });
                    trafficLightsStore.createIndex('currentSignal', 'currentSignal', { unique: false });
                    trafficLightsStore.createIndex('lastSignalChange', 'lastSignalChange', { unique: false });
                }

                // Create traffic patterns store
                if (!db.objectStoreNames.contains('trafficPatterns')) {
                    const patternsStore = db.createObjectStore('trafficPatterns', { keyPath: 'id', autoIncrement: true });
                    patternsStore.createIndex('name', 'name', { unique: true });
                    patternsStore.createIndex('isActive', 'isActive', { unique: false });
                }

                // Create traffic logs store
                if (!db.objectStoreNames.contains('trafficLogs')) {
                    const logsStore = db.createObjectStore('trafficLogs', { keyPath: 'id', autoIncrement: true });
                    logsStore.createIndex('lightId', 'lightId', { unique: false });
                    logsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // Start automatic cycling of traffic lights
    startAutoCycling() {
        if (this.autoCycleInterval) {
            clearInterval(this.autoCycleInterval);
        }

        // Check and update signals every second
        this.autoCycleInterval = setInterval(async () => {
            try {
                await this.autoCycleSignals();
            } catch (error) {
                console.error('Error in auto cycling:', error);
            }
        }, 1000);
    }

    // Stop automatic cycling
    stopAutoCycling() {
        if (this.autoCycleInterval) {
            clearInterval(this.autoCycleInterval);
            this.autoCycleInterval = null;
        }
    }

    // Automatic signal cycling logic
    async autoCycleSignals() {
        const lights = await this.getAllTrafficLights();
        const now = Date.now();
        const updates = [];

        for (const light of lights) {
            // Skip if emergency mode or not operational
            if (light.emergencyMode || light.status !== 'operational') {
                continue;
            }

            const lastChange = light.lastSignalChange ? new Date(light.lastSignalChange).getTime() : now;
            const elapsedSeconds = Math.floor((now - lastChange) / 1000);

            let shouldChange = false;
            let newSignal = light.currentSignal;

            // Determine if signal should change based on timing
            switch (light.currentSignal) {
                case 'green':
                    if (elapsedSeconds >= (light.greenTime || 45)) {
                        newSignal = 'yellow';
                        shouldChange = true;
                    }
                    break;

                case 'yellow':
                    if (elapsedSeconds >= (light.yellowTime || 5)) {
                        newSignal = 'red';
                        shouldChange = true;
                    }
                    break;

                case 'red':
                    if (elapsedSeconds >= (light.redTime || 60)) {
                        newSignal = 'green';
                        shouldChange = true;
                    }
                    break;
            }

            if (shouldChange) {
                updates.push({
                    id: light.id,
                    updates: {
                        currentSignal: newSignal,
                        lastSignalChange: new Date().toISOString()
                    }
                });
            }
        }

        // Apply updates
        for (const update of updates) {
            await this.updateTrafficLight(update.id, update.updates);
        }

        // Notify listeners if there were updates
        if (updates.length > 0 && this.cycleListeners.length > 0) {
            this.cycleListeners.forEach(listener => listener(updates));
        }
    }

    // Add cycle listener
    addCycleListener(listener) {
        this.cycleListeners.push(listener);
    }

    // Remove cycle listener
    removeCycleListener(listener) {
        this.cycleListeners = this.cycleListeners.filter(l => l !== listener);
    }

    // Get all traffic lights
    async getAllTrafficLights() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trafficLights'], 'readonly');
            const store = transaction.objectStore('trafficLights');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = (event) => {
                console.error('Error getting traffic lights:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Get traffic light by ID
    async getTrafficLight(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trafficLights'], 'readonly');
            const store = transaction.objectStore('trafficLights');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = (event) => {
                console.error('Error getting traffic light:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Update traffic light
    async updateTrafficLight(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trafficLights'], 'readwrite');
            const store = transaction.objectStore('trafficLights');

            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const light = getRequest.result;
                if (!light) {
                    reject(new Error('Traffic light not found'));
                    return;
                }

                const updatedLight = {
                    ...light,
                    ...updates,
                    lastUpdated: new Date().toISOString(),
                    // Set lastSignalChange if signal is being changed
                    lastSignalChange: updates.currentSignal && updates.currentSignal !== light.currentSignal
                        ? new Date().toISOString()
                        : light.lastSignalChange || new Date().toISOString()
                };

                const putRequest = store.put(updatedLight);

                putRequest.onsuccess = () => {
                    console.log('Traffic light updated successfully');

                    // Log the change
                    if (updates.currentSignal && updates.currentSignal !== light.currentSignal) {
                        this.logTrafficChange(id, {
                            signalChange: {
                                from: light.currentSignal,
                                to: updates.currentSignal
                            },
                            ...updates
                        }).catch(console.error);
                    }

                    resolve(updatedLight);
                };

                putRequest.onerror = (event) => {
                    console.error('Error updating traffic light:', event.target.error);
                    reject(event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                console.error('Error getting traffic light:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Add traffic pattern
    async addTrafficPattern(pattern) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trafficPatterns'], 'readwrite');
            const store = transaction.objectStore('trafficPatterns');
            const request = store.add({
                ...pattern,
                createdAt: new Date().toISOString()
            });

            request.onsuccess = () => {
                console.log('Traffic pattern added successfully');
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('Error adding traffic pattern:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Get all traffic patterns
    async getAllTrafficPatterns() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trafficPatterns'], 'readonly');
            const store = transaction.objectStore('trafficPatterns');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = (event) => {
                console.error('Error getting traffic patterns:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Update traffic pattern
    async updateTrafficPattern(id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trafficPatterns'], 'readwrite');
            const store = transaction.objectStore('trafficPatterns');

            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const pattern = getRequest.result;
                if (!pattern) {
                    reject(new Error('Traffic pattern not found'));
                    return;
                }

                const updatedPattern = {
                    ...pattern,
                    ...updates,
                    updatedAt: new Date().toISOString()
                };

                const putRequest = store.put(updatedPattern);

                putRequest.onsuccess = () => {
                    console.log('Traffic pattern updated successfully');
                    resolve(updatedPattern);
                };

                putRequest.onerror = (event) => {
                    console.error('Error updating traffic pattern:', event.target.error);
                    reject(event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                console.error('Error getting traffic pattern:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Log traffic change
    async logTrafficChange(lightId, changes) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trafficLogs'], 'readwrite');
            const store = transaction.objectStore('trafficLogs');
            const request = store.add({
                lightId,
                changes,
                timestamp: new Date().toISOString(),
                changedBy: 'system'
            });

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error('Error logging traffic change:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Get traffic logs
    async getTrafficLogs(limit = 100) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trafficLogs'], 'readonly');
            const store = transaction.objectStore('trafficLogs');
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev');

            const logs = [];
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && count < limit) {
                    logs.push(cursor.value);
                    count++;
                    cursor.continue();
                } else {
                    resolve(logs);
                }
            };

            request.onerror = (event) => {
                console.error('Error getting traffic logs:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // Initialize default traffic lights for Jalandhar
    async initializeDefaultLights() {
        const defaultLights = [
            {
                id: 'TL001',
                name: 'Model Town Chowk',
                location: 'Model Town, Jalandhar',
                latitude: 31.3260,
                longitude: 75.5762,
                currentSignal: 'green',
                status: 'operational',
                redTime: 60,
                yellowTime: 5,
                greenTime: 45,
                cycleTime: 110,
                lastMaintenance: '2025-12-01',
                nextMaintenance: '2026-01-01',
                emergencyMode: false,
                patternId: null,
                lastUpdated: new Date().toISOString(),
                lastSignalChange: new Date().toISOString()
            },
            {
                id: 'TL002',
                name: 'PAP Chowk',
                location: 'GT Road, Jalandhar',
                latitude: 31.3258,
                longitude: 75.5780,
                currentSignal: 'red',
                status: 'operational',
                redTime: 60,
                yellowTime: 5,
                greenTime: 45,
                cycleTime: 110,
                lastMaintenance: '2025-12-01',
                nextMaintenance: '2026-01-01',
                emergencyMode: false,
                patternId: null,
                lastUpdated: new Date().toISOString(),
                lastSignalChange: new Date(Date.now() - 30000).toISOString() // Changed 30 seconds ago
            },
            {
                id: 'TL003',
                name: 'Nakodar Road Intersection',
                location: 'Nakodar Road, Jalandhar',
                latitude: 31.3220,
                longitude: 75.5725,
                currentSignal: 'yellow',
                status: 'operational',
                redTime: 60,
                yellowTime: 5,
                greenTime: 45,
                cycleTime: 110,
                lastMaintenance: '2025-12-01',
                nextMaintenance: '2026-01-01',
                emergencyMode: false,
                patternId: null,
                lastUpdated: new Date().toISOString(),
                lastSignalChange: new Date(Date.now() - 2000).toISOString() // Changed 2 seconds ago
            },
            {
                id: 'TL004',
                name: 'Civil Lines Crossing',
                location: 'Civil Lines, Jalandhar',
                latitude: 31.3275,
                longitude: 75.5748,
                currentSignal: 'green',
                status: 'operational',
                redTime: 60,
                yellowTime: 5,
                greenTime: 45,
                cycleTime: 110,
                lastMaintenance: '2025-12-01',
                nextMaintenance: '2026-01-01',
                emergencyMode: false,
                patternId: null,
                lastUpdated: new Date().toISOString(),
                lastSignalChange: new Date(Date.now() - 10000).toISOString() // Changed 10 seconds ago
            },
            {
                id: 'TL005',
                name: 'Ladowali Road Junction',
                location: 'Ladowali Road, Jalandhar',
                latitude: 31.3200,
                longitude: 75.5800,
                currentSignal: 'red',
                status: 'operational',
                redTime: 60,
                yellowTime: 5,
                greenTime: 45,
                cycleTime: 110,
                lastMaintenance: '2025-12-01',
                nextMaintenance: '2026-01-01',
                emergencyMode: false,
                patternId: null,
                lastUpdated: new Date().toISOString(),
                lastSignalChange: new Date(Date.now() - 45000).toISOString() // Changed 45 seconds ago
            },
            {
                id: 'TL006',
                name: 'Guru Gobind Singh Marg',
                location: 'Guru Gobind Singh Marg, Jalandhar',
                latitude: 31.3290,
                longitude: 75.5700,
                currentSignal: 'green',
                status: 'operational',
                redTime: 60,
                yellowTime: 5,
                greenTime: 45,
                cycleTime: 110,
                lastMaintenance: '2025-12-01',
                nextMaintenance: '2026-01-01',
                emergencyMode: false,
                patternId: null,
                lastUpdated: new Date().toISOString(),
                lastSignalChange: new Date(Date.now() - 20000).toISOString() // Changed 20 seconds ago
            },
            {
                id: 'TL007',
                name: 'Phagwara Highway Entry',
                location: 'Phagwara Highway, Jalandhar',
                latitude: 31.3350,
                longitude: 75.5650,
                currentSignal: 'red',
                status: 'operational',
                redTime: 60,
                yellowTime: 5,
                greenTime: 45,
                cycleTime: 110,
                lastMaintenance: '2025-12-01',
                nextMaintenance: '2026-01-01',
                emergencyMode: false,
                patternId: null,
                lastUpdated: new Date().toISOString(),
                lastSignalChange: new Date(Date.now() - 55000).toISOString() // Changed 55 seconds ago
            },
            {
                id: 'TL008',
                name: 'DC Office Crossing',
                location: 'DC Office, Jalandhar',
                latitude: 31.3300,
                longitude: 75.5750,
                currentSignal: 'yellow',
                status: 'operational',
                redTime: 60,
                yellowTime: 5,
                greenTime: 45,
                cycleTime: 110,
                lastMaintenance: '2025-12-01',
                nextMaintenance: '2026-01-01',
                emergencyMode: false,
                patternId: null,
                lastUpdated: new Date().toISOString(),
                lastSignalChange: new Date(Date.now() - 3000).toISOString() // Changed 3 seconds ago
            }
        ];

        try {
            const existingLights = await this.getAllTrafficLights();
            if (existingLights.length === 0) {
                const transaction = this.db.transaction(['trafficLights'], 'readwrite');
                const store = transaction.objectStore('trafficLights');

                defaultLights.forEach(light => {
                    store.add(light);
                });

                console.log('Default traffic lights initialized');
            }
        } catch (error) {
            console.error('Error initializing default lights:', error);
        }
    }

    // Clear all data (for testing)
    async clearDatabase() {
        this.stopAutoCycling();
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
const trafficLightsDB = new TrafficDatabase();
export default trafficLightsDB;