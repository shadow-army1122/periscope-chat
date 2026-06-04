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
        <div style={{ 
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100dvh',
            width: '100vw',
            background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #1e1b4b)',
            backgroundSize: '400% 400%',
            animation: 'gradientBG 15s ease infinite'
        }}>
            <style>{`
                @keyframes gradientBG {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
            
            <div style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '3rem 2.5rem', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '24px',
                width: '90%', 
                maxWidth: '420px', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <img src="/logo2.png" alt="Periscope Logo" style={{ width: '90px', height: '90px', marginBottom: '1.5rem', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 20px rgba(255,255,255,0.1)' }} />
                
                <h1 style={{ textAlign: 'center', marginBottom: '2.5rem', color: '#ffffff', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>
                    PERISCOPE
                </h1>
                
                {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', border: '2px solid #dc2626', marginBottom: '1.5rem', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>{error}</div>}
                
                {!requiresReset ? (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#94a3b8', letterSpacing: '1px' }}>USERNAME</label>
                            <input 
                                type="text" 
                                style={{
                                    width: '100%', padding: '1rem', fontSize: '1.1rem', backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#818cf8'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#94a3b8', letterSpacing: '1px' }}>PASSWORD</label>
                            <input 
                                type="password" 
                                style={{
                                    width: '100%', padding: '1rem', fontSize: '1.1rem', backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#818cf8'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            style={{ 
                                marginTop: '1.5rem', width: '100%', padding: '1.1rem', background: 'linear-gradient(to right, #4f46e5, #6366f1)', 
                                color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', 
                                cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                            disabled={loading}
                        >
                            {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%' }}>
                        <div style={{ backgroundColor: '#fef3c7', padding: '1rem', border: '2px solid #d97706', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>
                            SECURITY DIRECTIVE: First login requires a new password.
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#94a3b8', letterSpacing: '1px' }}>NEW PASSWORD</label>
                            <input 
                                type="password" 
                                style={{
                                    width: '100%', padding: '1rem', fontSize: '1.1rem', backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#818cf8'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#94a3b8', letterSpacing: '1px' }}>CONFIRM PASSWORD</label>
                            <input 
                                type="password" 
                                style={{
                                    width: '100%', padding: '1rem', fontSize: '1.1rem', backgroundColor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#818cf8'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            style={{ 
                                marginTop: '1.5rem', width: '100%', padding: '1.1rem', background: 'linear-gradient(to right, #4f46e5, #6366f1)', 
                                color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', 
                                cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                            disabled={loading}
                        >
                            {loading ? 'UPDATING...' : 'UPDATE CREDENTIALS'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;
