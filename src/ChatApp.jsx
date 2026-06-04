import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Paperclip, Image as ImageIcon, FileText, Menu, X, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

function ChatApp() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hi there! 👋 I am Periscope AI. I am so happy you are here! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [activeImageContext, setActiveImageContext] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchSessions();
    }
  }, [user, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessions = async () => {
    const token = localStorage.getItem('periscope_token');
    const res = await fetch('/api/periscope-app/sessions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        loadSession(data[0].id);
      }
    }
  };

  const loadSession = async (sessionId) => {
    const token = localStorage.getItem('periscope_token');
    const res = await fetch(`/api/periscope-app/sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const msgs = await res.json();
      const formattedMsgs = msgs.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        imageUrl: m.image_url
      }));
      setMessages(formattedMsgs.length > 0 ? formattedMsgs : [
        { id: 1, role: 'assistant', content: 'Hi there! 👋 I am Periscope AI. I am so happy you are here! How can I help you today?' }
      ]);
      setCurrentSessionId(sessionId);
      setActiveImageContext(null);
    }
    setIsMobileMenuOpen(false);
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
        { id: 1, role: 'assistant', content: 'Hi there! 👋 I am Periscope AI. I am so happy you are here! How can I help you today?' }
    ]);
    setActiveImageContext(null);
    setIsMobileMenuOpen(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: crypto.randomUUID(),
        file: file,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document'
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;
    
    const processFiles = async () => {
      let newImageContext = null;
      for (const f of files) {
        if (f.type === 'image') {
          const reader = new FileReader();
          const base64 = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(f.file);
          });
          newImageContext = { name: f.name, base64 };
        }
      }
      if (newImageContext) {
        setActiveImageContext(newImageContext);
      }
      return newImageContext;
    };

    const newImageContext = await processFiles();
    const imageToSend = newImageContext ? newImageContext.base64 : (activeImageContext ? activeImageContext.base64 : null);
    const imagesArray = imageToSend ? [imageToSend] : [];

    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      imageUrl: imageToSend
    };
    
    setMessages(prev => [...prev, newMessage]);
    const currentInput = input;
    setInput('');
    setFiles([]);
    
    const aiMessageId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: 'assistant',
      content: 'Let me think about that for a moment... 🤔'
    }]);

    try {
      const token = localStorage.getItem('periscope_token');
      const res = await fetch('/api/periscope-app/chat', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: currentSessionId,
          images: imagesArray
        })
      });
      const data = await res.json();
      
      if (!currentSessionId && data.sessionId) {
          setCurrentSessionId(data.sessionId);
          fetchSessions();
      }

      setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: data.response || 'ERROR.' } : m));
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: 'SYSTEM FAILURE. OFFLINE.' } : m));
    }
  };

  return (
    <div className="brutalist-container">
      <header className="brutalist-header">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Periscope OS" className="core-indicator-img" />
          <h1>PERISCOPE OS</h1>
        </div>
        
        <button 
          className="brutalist-button" 
          style={{ display: window.innerWidth > 768 ? 'none' : 'flex' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div style={{ display: window.innerWidth > 768 ? 'flex' : 'none', gap: '1rem', alignItems: 'center' }}>
          <button className="brutalist-button" onClick={startNewChat}>NEW CHAT</button>
          <select className="brutalist-input" style={{ width: '150px' }} value={currentSessionId || ''} onChange={(e) => loadSession(e.target.value)}>
              <option value="" disabled>History...</option>
              {sessions.map(s => (
                  <option key={s.id} value={s.id}>Session {new Date(s.created_at).toLocaleDateString()}</option>
              ))}
          </select>
          {user?.role === 'admin' && (
              <button className="brutalist-button" onClick={() => navigate('/admin')}><Settings size={20} /> ADMIN</button>
          )}
          <button className="brutalist-button primary" onClick={logout}><LogOut size={20} /></button>
        </div>
      </header>
      
      {isMobileMenuOpen && (
        <div style={{ position: 'absolute', top: '88px', left: 0, width: '100%', backgroundColor: 'var(--secondary-color)', borderBottom: 'var(--border-width) solid var(--border-color)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
          <button className="brutalist-button w-full" onClick={startNewChat}>NEW CHAT</button>
          <select className="brutalist-input w-full" value={currentSessionId || ''} onChange={(e) => loadSession(e.target.value)}>
              <option value="" disabled>History...</option>
              {sessions.map(s => (
                  <option key={s.id} value={s.id}>Session {new Date(s.created_at).toLocaleDateString()}</option>
              ))}
          </select>
          {user?.role === 'admin' && (
              <button className="brutalist-button w-full" onClick={() => navigate('/admin')}><Settings size={20} /> ADMIN</button>
          )}
          <button className="brutalist-button primary w-full" onClick={logout}>LOGOUT</button>
        </div>
      )}

      <main className="chat-area">
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble ${msg.role}`}>
            {msg.imageUrl && (
              <div style={{ marginBottom: '1rem' }}>
                <img src={msg.imageUrl} alt="Context" style={{ maxWidth: '200px', border: '2px solid white' }} />
              </div>
            )}
            {msg.role === 'assistant' ? (
              <TypewriterText text={msg.content} />
            ) : (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <form onSubmit={handleSubmit} className="input-area">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          {files.length > 0 && (
            <div className="upload-preview">
              {files.map(file => (
                <div key={file.id} className="upload-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {file.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                    <span>{file.name.substring(0, 15)}{file.name.length > 15 ? '...' : ''}</span>
                  </div>
                  <button type="button" onClick={() => removeFile(file.id)}>×</button>
                </div>
              ))}
            </div>
          )}

          {activeImageContext && files.length === 0 && (
            <div className="upload-preview" style={{ marginBottom: '0.5rem' }}>
              <div className="upload-item" style={{ backgroundColor: '#fffde7', borderColor: '#eab308' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#854d0e' }}>
                  <ImageIcon size={16} />
                  <span>Looking at: {activeImageContext.name.substring(0, 15)}...</span>
                </div>
                <button type="button" style={{ background: '#eab308' }} onClick={() => setActiveImageContext(null)}>×</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }} className="input-wrapper">
            <label className="brutalist-button" style={{ cursor: 'pointer', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Paperclip size={24} />
              <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            <input 
              type="text" 
              className="brutalist-input" 
              placeholder="What's on your mind?..." 
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button type="submit" className="brutalist-button primary" style={{ padding: '1rem' }}>
              <Send size={24} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ChatApp;
