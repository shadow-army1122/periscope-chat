import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // For password reset flow
    const [requiresReset, setRequiresReset] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/periscope-app/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            if (data.requiresReset) {
                setRequiresReset(true);
            } else {
                login(data.user, data.token);
                navigate('/chat');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const res = await fetch('/api/periscope-app/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, oldPassword: password, newPassword })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Reset failed');

            login(data.user, data.token);
            navigate('/chat');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="brutalist-container" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--primary-color)' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', border: 'var(--border-width) solid var(--border-color)', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0px var(--border-color)' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--secondary-color)' }}>
                    PERISCOPE OS
                </h1>
                
                {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.5rem', border: '2px solid #dc2626', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
                
                {!requiresReset ? (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>USERNAME</label>
                            <input 
                                type="text" 
                                className="brutalist-input" 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>PASSWORD</label>
                            <input 
                                type="password" 
                                className="brutalist-input" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="brutalist-button primary" style={{ marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#fef3c7', padding: '0.5rem', border: '2px solid #d97706', marginBottom: '1rem', fontWeight: 'bold' }}>
                            SECURITY DIRECTIVE: First login requires a new password.
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>NEW PASSWORD</label>
                            <input 
                                type="password" 
                                className="brutalist-input" 
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>CONFIRM PASSWORD</label>
                            <input 
                                type="password" 
                                className="brutalist-input" 
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="brutalist-button primary" style={{ marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'UPDATING...' : 'UPDATE CREDENTIALS'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;
