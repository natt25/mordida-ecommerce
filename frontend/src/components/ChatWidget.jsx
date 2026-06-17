import React, { useState } from 'react';
import { MessageCircle, Send, Loader } from 'lucide-react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hola, soy el asistente Mordida. ¿En qué puedo ayudarte?' }
  ]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    
    const userMessage = text;
    setText('');
    
    // Agregar mensaje del usuario
    setMessages((current) => [
      ...current,
      { from: 'user', text: userMessage }
    ]);

    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/chatbot/cliente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mensaje: userMessage })
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const data = await response.json();
      
      setMessages((current) => [
        ...current,
        { from: 'bot', text: data.respuesta }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((current) => [
        ...current,
        { from: 'bot', text: 'Perdón, hay un error al conectarme. Intenta de nuevo más tarde.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !loading) {
      send();
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <section className="chat-panel">
          <header>Asistente Mordida</header>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <p className={message.from} key={`${message.from}-${index}`}>{message.text}</p>
            ))}
            {loading && (
              <p className="bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Asistente está escribiendo...
              </p>
            )}
          </div>
          <div className="chat-input">
            <input 
              value={text} 
              onChange={(event) => setText(event.target.value)} 
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu consulta"
              disabled={loading}
            />
            <button onClick={send} aria-label="Enviar mensaje" disabled={loading}>
              <Send size={17} />
            </button>
          </div>
        </section>
      )}
      <button className="chat-bubble" onClick={() => setOpen((value) => !value)} aria-label="Abrir chat">
        <MessageCircle size={25} />
      </button>
    </div>
  );
}
