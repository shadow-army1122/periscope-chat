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
        <div className="brutalist-container" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--primary-color)', padding: '1rem' }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '2.5rem 2rem', 
                border: 'var(--border-width) solid var(--border-color)', 
                width: '100%', 
                maxWidth: '420px', 
                boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0px var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <img src="/logo.png" alt="Periscope Logo" style={{ width: '80px', height: '80px', marginBottom: '1rem', border: 'var(--border-width) solid var(--border-color)', borderRadius: '50%', objectFit: 'cover' }} />
                
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--secondary-color)', fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>
                    PERISCOPE
                </h1>
                
                {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', border: '2px solid #dc2626', marginBottom: '1.5rem', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>{error}</div>}
                
                {!requiresReset ? (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '800', fontSize: '0.9rem' }}>USERNAME</label>
                            <input 
                                type="text" 
                                className="brutalist-input" 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '800', fontSize: '0.9rem' }}>PASSWORD</label>
                            <input 
                                type="password" 
                                className="brutalist-input" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="brutalist-button primary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', padding: '1rem' }} disabled={loading}>
                            {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
                        <div style={{ backgroundColor: '#fef3c7', padding: '1rem', border: '2px solid #d97706', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
                            SECURITY DIRECTIVE: First login requires a new password.
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '800', fontSize: '0.9rem' }}>NEW PASSWORD</label>
                            <input 
                                type="password" 
                                className="brutalist-input" 
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '800', fontSize: '0.9rem' }}>CONFIRM PASSWORD</label>
                            <input 
                                type="password" 
                                className="brutalist-input" 
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="brutalist-button primary" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', padding: '1rem' }} disabled={loading}>
                            {loading ? 'UPDATING...' : 'UPDATE CREDENTIALS'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;
