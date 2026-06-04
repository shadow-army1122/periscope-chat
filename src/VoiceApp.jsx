import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Activity, MessageSquare, LogOut, Settings, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';

function VoiceApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(new Audio());

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [user, navigate]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // release mic
      };

      mediaRecorder.start();
      setIsRecording(true);
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setAudioUrl(null);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required for voice chat.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const token = localStorage.getItem('periscope_token');
      const res = await fetch('/api/periscope-app/voice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error('Backend responded with an error');
      }

      const responseBlob = await res.blob();
      const url = URL.createObjectURL(responseBlob);
      setAudioUrl(url);
      
      const player = audioPlayerRef.current;
      player.src = url;
      player.play();

    } catch (error) {
      console.error("Voice processing failed:", error);
      alert("Sorry, failed to process voice. Make sure the backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="brutalist-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <header className="brutalist-header">
        <div className="flex items-center gap-4">
          <img src="/logo2.png" alt="Periscope" className="core-indicator-img" />
          <h1>VOICE CHAT</h1>
        </div>
        
        <button 
          className="brutalist-button mobile-menu-btn" 
          style={{ display: window.innerWidth > 768 ? 'none' : 'flex', padding: '0.75rem' }}
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        
        <div style={{ display: window.innerWidth > 768 ? 'flex' : 'none', gap: '1rem', alignItems: 'center' }}>
          <button className="brutalist-button" onClick={() => navigate('/chat')}><MessageSquare size={20} /> TEXT CHAT</button>
          {user?.role === 'admin' && (
              <button className="brutalist-button" onClick={() => navigate('/admin')}><Settings size={20} /> ADMIN</button>
          )}
          <button className="brutalist-button primary" onClick={logout}><LogOut size={20} /></button>
        </div>
      </header>

      <div className={`mobile-drawer-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900' }}>MENU</h2>
            <button className="brutalist-button" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '0.5rem' }}><X size={24} /></button>
        </div>
        <button className="brutalist-button" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/chat')}><MessageSquare size={20} /> TEXT CHAT</button>
        {user?.role === 'admin' && (
            <button className="brutalist-button" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/admin')}><Settings size={20} /> ADMIN</button>
        )}
        <div style={{ flex: 1 }}></div>
        <button className="brutalist-button primary" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}><LogOut size={20} /> LOGOUT</button>
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '3rem' }}>
        
        <div style={{ textAlign: 'center', height: '100px' }}>
          {isRecording ? (
            <h2 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity className="animate-pulse" size={32} /> LISTENING...
            </h2>
          ) : isProcessing ? (
            <h2 style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity className="animate-spin" size={32} /> PROCESSING...
            </h2>
          ) : (
            <h2 style={{ color: '#3b82f6' }}>READY TO SPEAK (MALAYALAM)</h2>
          )}
        </div>

        <button 
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: isRecording ? '#ef4444' : '#fff',
            color: isRecording ? '#fff' : '#000',
            border: '8px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: isRecording ? '0 0 40px #ef4444' : '0 10px 0 #666',
            transform: isRecording ? 'translateY(10px)' : 'none'
          }}
        >
          {isRecording ? <Square size={80} /> : <Mic size={80} />}
        </button>
        
        <p style={{ opacity: 0.6, marginTop: '1rem', fontSize: '1.2rem', textAlign: 'center' }}>
          {isRecording ? "Release to Send" : "Hold to Talk"}
        </p>

        {audioUrl && !isRecording && !isProcessing && (
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
             <p>AI Response:</p>
             <audio src={audioUrl} controls autoPlay style={{ filter: 'grayscale(1)', border: '2px solid white' }} />
          </div>
        )}
      </main>
    </div>
  );
}

export default VoiceApp;
