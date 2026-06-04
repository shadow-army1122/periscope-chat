import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { MessageSquare, Mic, LogOut, Settings } from 'lucide-react';
import './index.css';

function ModeSelect() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="brutalist-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header className="brutalist-header">
        <div className="flex items-center gap-4">
          <img src="/logo2.png" alt="Periscope" className="core-indicator-img" />
          <h1>PERISCOPE</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user?.role === 'admin' && (
            <button className="brutalist-button" onClick={() => navigate('/admin')}>
              <Settings size={20} /> ADMIN
            </button>
          )}
          <button className="brutalist-button primary" onClick={logout}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '2rem'
      }}>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          textAlign: 'center'
        }}>
          Choose Your Mode
        </h2>
        <p style={{ opacity: 0.6, fontSize: '1.1rem', textAlign: 'center', maxWidth: '500px' }}>
          Welcome back, <strong>{user?.username || 'User'}</strong>. How would you like to interact with Periscope AI today?
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          justifyContent: 'center',
          marginTop: '1rem'
        }}>
          {/* Text Chat Card */}
          <button
            onClick={() => navigate('/chat')}
            style={{
              width: '280px',
              padding: '3rem 2rem',
              background: '#fff',
              color: '#000',
              border: '4px solid #000',
              boxShadow: '8px 8px 0 #000',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(4px, 4px)';
              e.currentTarget.style.boxShadow = '4px 4px 0 #000';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '8px 8px 0 #000';
            }}
          >
            <MessageSquare size={64} strokeWidth={2.5} />
            <span style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase' }}>
              Text Chat
            </span>
            <span style={{ fontSize: '0.9rem', opacity: 0.6, textAlign: 'center' }}>
              Type messages, upload images & documents
            </span>
          </button>

          {/* Voice Chat Card */}
          <button
            onClick={() => navigate('/voice')}
            style={{
              width: '280px',
              padding: '3rem 2rem',
              background: '#000',
              color: '#fff',
              border: '4px solid #000',
              boxShadow: '8px 8px 0 #ef4444',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translate(4px, 4px)';
              e.currentTarget.style.boxShadow = '4px 4px 0 #ef4444';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '8px 8px 0 #ef4444';
            }}
          >
            <Mic size={64} strokeWidth={2.5} />
            <span style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase' }}>
              Voice Chat
            </span>
            <span style={{ fontSize: '0.9rem', opacity: 0.6, textAlign: 'center' }}>
              Speak in Malayalam, get spoken responses
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default ModeSelect;
