import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Paperclip, Image as ImageIcon, FileText, Trash2, Menu, X } from 'lucide-react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: 'HELLO. I AM PERISCOPE CENTRAL NEURAL CORE. WHAT IS YOUR DIRECTIVE?' }
  ]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    
    // Create new message
    const newMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      attachments: [...files]
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setFiles([]);
    
    const processFiles = async () => {
      const base64Files = [];
      for (const f of files) {
        if (f.type === 'image') {
          const reader = new FileReader();
          const base64 = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(f.file);
          });
          base64Files.push(base64);
        } else {
          const formData = new FormData();
          formData.append('document', f.file);
          await fetch('http://localhost:5000/api/periscope/upload', { method: 'POST', body: formData });
        }
      }
      return base64Files;
    };

    const imageAttachments = await processFiles();
    
    const aiMessageId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: 'ai',
      content: 'PROCESSING DIRECTIVE...'
    }]);

    try {
      const res = await fetch('http://localhost:5000/api/periscope/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.content,
          history: messages.slice(-5),
          images: imageAttachments
        })
      });
      const data = await res.json();
      setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: data.response || 'ERROR.' } : m));
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: 'SYSTEM FAILURE. OFFLINE.' } : m));
    }
  };

  return (
    <div className="brutalist-container">
      {/* HEADER */}
      <header className="brutalist-header">
        <div className="flex items-center gap-4">
          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--border-color)', borderRadius: '50%', border: '4px solid white', boxShadow: '4px 4px 0px 0px white' }}></div>
          <h1>PERISCOPE OS</h1>
        </div>
        
        {/* Mobile menu toggle */}
        <button 
          className="brutalist-button" 
          style={{ display: window.innerWidth > 768 ? 'none' : 'flex' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <div style={{ display: window.innerWidth > 768 ? 'flex' : 'none', gap: '1rem' }}>
          <button className="brutalist-button">NEW CHAT</button>
          <button className="brutalist-button primary">HISTORY</button>
        </div>
      </header>
      
      {/* MOBILE MENU (Absolute overlay) */}
      {isMobileMenuOpen && (
        <div style={{ position: 'absolute', top: '88px', left: 0, width: '100%', backgroundColor: 'var(--secondary-color)', borderBottom: 'var(--border-width) solid var(--border-color)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
          <button className="brutalist-button w-full" onClick={() => setIsMobileMenuOpen(false)}>NEW CHAT</button>
          <button className="brutalist-button primary w-full" onClick={() => setIsMobileMenuOpen(false)}>HISTORY</button>
        </div>
      )}

      {/* CHAT AREA */}
      <main className="chat-area">
        {messages.map(msg => (
          <div key={msg.id} className={`message-bubble ${msg.role}`}>
            {msg.role === 'user' && msg.attachments && msg.attachments.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {msg.attachments.map(att => (
                  <div key={att.id} style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {att.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{att.name}</span>
                  </div>
                ))}
              </div>
            )}
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* INPUT AREA */}
      <form onSubmit={handleSubmit} className="input-area">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          {/* ATTACHMENT PREVIEWS */}
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

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }} className="input-wrapper">
            <label className="brutalist-button" style={{ cursor: 'pointer', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Paperclip size={24} />
              <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            <input 
              type="text" 
              className="brutalist-input" 
              placeholder="ENTER DIRECTIVE..." 
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

export default App;
