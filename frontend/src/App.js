import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TrafficProvider } from './context/TrafficContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import AdminDashboard from './components/dashboard/AdminDashboard';
import UserDashboard from './components/dashboard/UserDashboard';
import AdminUsers from './pages/Admin/Users';
import AdminVehicles from './pages/Admin/Vehicles';
import AdminAnalytics from './pages/Admin/Analytics';
import Incidents from './pages/Admin/Incidents';
import TrafficLights from './pages/Admin/TrafficLights';
import Maintenance from './pages/Admin/Maintenance';
import UserProfile from './pages/User/Profile';
import UserReport from './pages/User/UserReport';
import TrafficView from './pages/User/TrafficView';
import TrafficLightsStatus from './pages/User/TrafficLightsStatus';
import RoutePlanner from './pages/User/RoutePlanner';
import './styles/main.css';
import './styles/components.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />;
    }

    return children;
};

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="dashboard-container">
            <Sidebar isCollapsed={isSidebarCollapsed} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Header
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    isSidebarCollapsed={isSidebarCollapsed}
                />
                <main className="main-content">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <TrafficProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* User Routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute requiredRole="user">
                                <DashboardLayout>
                                    <UserDashboard />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/map" element={
                            <ProtectedRoute requiredRole="user">
                                <DashboardLayout>
                                    <TrafficView />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute requiredRole="user">
                                <DashboardLayout>
                                    <UserProfile />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/report" element={
                            <ProtectedRoute requiredRole="user">
                                <DashboardLayout>
                                    <UserReport />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/trafficlightstatus" element={
                            <ProtectedRoute requiredRole="user">
                                <DashboardLayout>
                                    <TrafficLightsStatus />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/route-planner" element={
                            <ProtectedRoute requiredRole="user">
                                <DashboardLayout>
                                    <RoutePlanner />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />

                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute requiredRole="admin">
                                <DashboardLayout>
                                    <AdminDashboard />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute requiredRole="admin">
                                <DashboardLayout>
                                    <AdminUsers />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/vehicles" element={
                            <ProtectedRoute requiredRole="admin">
                                <DashboardLayout>
                                    <AdminVehicles />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/analytics" element={
                            <ProtectedRoute requiredRole="admin">
                                <DashboardLayout>
                                    <AdminAnalytics />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/map" element={
                            <ProtectedRoute requiredRole="admin">
                                <DashboardLayout>
                                    <TrafficView isAdmin={true} />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        {/* Inside the Routes component, add new routes: */}
                        <Route path="/admin/incidents" element={
                            <ProtectedRoute requiredRole="admin">
                                <DashboardLayout>
                                    <Incidents />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/trafficlight" element={
                            <ProtectedRoute requiredRole="admin">
                                <DashboardLayout>
                                    <TrafficLights />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/maintenance" element={
                            <ProtectedRoute requiredRole="admin">
                                <DashboardLayout>
                                    <Maintenance />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/profile" element={
                            <ProtectedRoute requiredRole="admin">
                                <DashboardLayout>
                                    <UserProfile isAdmin={true} />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />

                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/login" />} />

                        {/* 404 Route */}
                        <Route path="*" element={
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <h1>404 - Page Not Found</h1>
                                <p>The page you're looking for doesn't exist.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => window.history.back()}
                                    style={{ marginTop: '20px' }}
                                >
                                    Go Back
                                </button>
                            </div>
                        } />
                    </Routes>
                </TrafficProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;