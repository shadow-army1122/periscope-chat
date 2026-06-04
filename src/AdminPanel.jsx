import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Trash2, Image as ImageIcon } from 'lucide-react';
import './index.css';

function AdminPanel() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [history, setHistory] = useState(null);
    const [viewingUserId, setViewingUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Create user states
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('user');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/chat');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        const token = localStorage.getItem('periscope_token');
        const res = await fetch('/api/periscope-app/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setUsers(await res.json());
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('periscope_token');
        const res = await fetch('/api/periscope-app/admin/users', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
        });
        if (res.ok) {
            setNewUsername('');
            setNewPassword('');
            fetchUsers();
        } else {
            alert('Error creating user');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        const token = localStorage.getItem('periscope_token');
        const res = await fetch(`/api/periscope-app/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) fetchUsers();
    };

    const viewHistory = async (id) => {
        setLoading(true);
        const token = localStorage.getItem('periscope_token');
        const res = await fetch(`/api/periscope-app/admin/history/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setHistory(await res.json());
            setViewingUserId(id);
        }
        setLoading(false);
    };

    return (
        <div className="brutalist-container" style={{ overflowY: 'auto' }}>
            <header className="brutalist-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>ADMIN CONTROL</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="brutalist-button" onClick={() => navigate('/chat')}>BACK TO CHAT</button>
                    <button className="brutalist-button primary" onClick={logout}>LOGOUT</button>
                </div>
            </header>

            <main style={{ padding: '2rem', display: 'flex', flexDirection: window.innerWidth > 768 ? 'row' : 'column', gap: '2rem' }}>
                {/* Users List */}
                <div style={{ flex: 1, border: 'var(--border-width) solid var(--border-color)', padding: '1rem' }}>
                    <h2>USER REGISTRY</h2>
                    
                    <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <input 
                            type="text" 
                            placeholder="Username" 
                            className="brutalist-input" 
                            value={newUsername} 
                            onChange={e => setNewUsername(e.target.value)} 
                            required 
                            style={{ flex: 1 }}
                        />
                        <input 
                            type="password" 
                            placeholder="Temp Password" 
                            className="brutalist-input" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            required 
                            style={{ flex: 1 }}
                        />
                        <select className="brutalist-input" value={newRole} onChange={e => setNewRole(e.target.value)}>
                            <option value="user">USER</option>
                            <option value="admin">ADMIN</option>
                        </select>
                        <button type="submit" className="brutalist-button primary">CREATE</button>
                    </form>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {users.map(u => (
                            <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '2px solid black', backgroundColor: viewingUserId === u.id ? '#f3f4f6' : 'white' }}>
                                <div>
                                    <strong style={{ fontSize: '1.1rem' }}>{u.username}</strong>
                                    <span style={{ marginLeft: '1rem', padding: '0.2rem 0.5rem', backgroundColor: u.role === 'admin' ? 'var(--secondary-color)' : 'lightgray', color: u.role === 'admin' ? 'white' : 'black', fontSize: '0.8rem', fontWeight: 'bold' }}>{u.role.toUpperCase()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="brutalist-button" onClick={() => viewHistory(u.id)}>VIEW LOGS</button>
                                    <button className="brutalist-button" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }} onClick={() => deleteUser(u.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* History Viewer */}
                <div style={{ flex: 1, border: 'var(--border-width) solid var(--border-color)', padding: '1rem', backgroundColor: '#fafafa', height: '70vh', overflowY: 'auto' }}>
                    <h2>SURVEILLANCE LOGS {viewingUserId && `(User #${viewingUserId})`}</h2>
                    {loading && <p>Loading logs...</p>}
                    {!loading && !history && <p>Select a user to view their history.</p>}
                    {!loading && history && history.length === 0 && <p>No history found for this user.</p>}
                    
                    {!loading && history && history.map(session => (
                        <div key={session.id} style={{ marginBottom: '2rem', border: '2px dashed gray', padding: '1rem' }}>
                            <div style={{ fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                                SESSION #{session.id} | {new Date(session.created_at).toLocaleString()}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {session.messages.map(msg => (
                                    <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '0.5rem', border: '2px solid black', backgroundColor: msg.sender === 'user' ? 'var(--accent-color)' : 'white', color: msg.sender === 'user' ? 'white' : 'black' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            {msg.sender.toUpperCase()} | {new Date(msg.created_at).toLocaleTimeString()}
                                        </div>
                                        {msg.image_url && (
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <img src={msg.image_url} alt="Uploaded" style={{ maxWidth: '100%', border: '2px solid black' }} />
                                            </div>
                                        )}
                                        <div>{msg.content}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default AdminPanel;
