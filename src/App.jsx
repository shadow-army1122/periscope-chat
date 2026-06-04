import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import ChatApp from './ChatApp';
import AdminPanel from './AdminPanel';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/chat" />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/chat" element={
                        <ProtectedRoute>
                            <ChatApp />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminPanel />
                        </ProtectedRoute>
                    } />
                    
                    {/* Default route */}
                    <Route path="*" element={<Navigate to="/chat" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
