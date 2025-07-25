import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MessageSquare, BookOpen, Loader2, AlertCircle } from 'lucide-react';
// Implementazione inline del hook useChat per compatibilità
const useChat = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  const initializeChat = useCallback(async () => {
    if (isInitialized) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/start_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsInitialized(true);
      setChatMessages([{
        text: data.response,
        isBot: true,
        action: data.action,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError('Errore durante l\'inizializzazione della chat');
      console.error('Errore inizializzazione:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || isLoading || !isInitialized) return;

    const userMessage = {
      text: messageText.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/send_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText.trim() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage = {
        text: data.response,
        isBot: true,
        action: data.action,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError('Errore durante l\'invio del messaggio');
      console.error('Errore invio messaggio:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isInitialized]);

  const stopChat = useCallback(async () => {
    try {
      await fetch('http://localhost:5001/stop_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsInitialized(false);
      setChatMessages([]);
      setError(null);
    } catch (err) {
      console.error('Errore durante la chiusura della chat:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    chatMessages,
    isLoading,
    isInitialized,
    error,
    initializeChat,
    sendMessage,
    stopChat,
    clearError
  };
};

const Chat = ({ showChat, setShowChat, onLoreSaved }) => {
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const {
    chatMessages,
    isLoading,
    isInitialized,
    error,
    initializeChat,
    sendMessage,
    stopChat,
    clearError
  } = useChat();

  // Verifica se l'ultimo messaggio del bot contiene tag <lore>
  const hasLoreInLastMessage = useCallback(() => {
    if (chatMessages.length === 0) return false;
    
    const lastBotMessage = [...chatMessages]
      .reverse()
      .find(msg => msg.isBot);
    
    if (!lastBotMessage) return false;
    
    const loreRegex = /<lore>[\s\S]*?<\/lore>/i;
    return loreRegex.test(lastBotMessage.text);
  }, [chatMessages]);

  // Auto scroll ai nuovi messaggi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Inizializza la chat quando viene aperta
  useEffect(() => {
    if (showChat && !isInitialized && !isLoading) {
      initializeChat();
    }
  }, [showChat, isInitialized, isLoading, initializeChat]);

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || isLoading) return;
    
    const messageText = chatInput.trim();
    setChatInput('');
    await sendMessage(messageText);
  }, [chatInput, isLoading, sendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    // Opzionalmente ferma la chat quando viene chiusa
    // stopChat();
  }, [setShowChat]);

  const handleSaveLore = useCallback(async () => {
    if (isLoading || !hasLoreInLastMessage()) return;
    
    try {
      await sendMessage('salva lore');
      
      // Attendi un momento per assicurarsi che il salvataggio sia completato
      setTimeout(async () => {
        try {
          // Carica automaticamente il file lore.txt
          const response = await fetch('/pddl/lore.txt');
          if (response.ok) {
            // Notifica il componente parent che il lore è stato salvato
            if (onLoreSaved) {
              onLoreSaved('lore.txt');
            }
          }
        } catch (error) {
          console.error('Errore nel caricamento automatico del file:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    }
  }, [isLoading, hasLoreInLastMessage, sendMessage, onLoreSaved]);

  // Componente per il messaggio di errore
  const ErrorMessage = ({ message, onClose }) => (
    <div className="chat-error">
      <div className="error-content">
        <AlertCircle className="error-icon" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="error-close">✕</button>
    </div>
  );

  // Indicatore di typing quando il bot sta "pensando"
  const TypingIndicator = () => (
    <div className="chat-message bot">
      <div className="chat-bubble typing">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="typing-text">Il Lore Assistant sta scrivendo...</span>
      </div>
    </div>
  );

  if (!showChat) {
    return (
      <div className="bot-trigger">
        <div className="speech-bubble">
          Hai bisogno di una mano?
        </div>
        <button
          onClick={() => setShowChat(true)}
          className="retro-bot-button"
        >
          <BookOpen className="bot-icon" />
        </button>
      </div>
    );
  }

  const canSave = hasLoreInLastMessage();

  return (
    <div className="retro-window chat-window">
      <div className="retro-title-bar">
        <span className="title-text">📖 Lore Assistant</span>
        <div className="title-controls">
          {isInitialized && (
            <span className="status-indicator online">●</span>
          )}
          <button
            onClick={handleCloseChat}
            className="close-button"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="chat-content">
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={clearError}
          />
        )}
        
        <div className="chat-messages">
          {!isInitialized && isLoading ? (
            <div className="chat-initializing">
              <Loader2 className="loading-spinner" />
              <span>Inizializzazione Lore Assistant...</span>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}>
                  <div className="chat-bubble">
                    {msg.text}
                    {msg.action === 'save' && (
                      <div className="message-tag save-tag">💾 Lore salvato</div>
                    )}
                    {msg.action === 'exit' && (
                      <div className="message-tag exit-tag">👋 Fine chat</div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <div className="chat-controls">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="retro-input chat-input"
            placeholder={
              isInitialized 
                ? "Scrivi un messaggio..." 
                : "Inizializzazione in corso..."
            }
            disabled={!isInitialized || isLoading}
          />
          <button
            onClick={handleSendMessage}
            className="retro-button send-button"
            disabled={!isInitialized || isLoading || !chatInput.trim()}
          >
            {isLoading ? (
              <Loader2 className="send-icon loading" />
            ) : (
              <MessageSquare className="send-icon" />
            )}
          </button>
          <button 
            onClick={handleSaveLore}
            className={`retro-button save-button ${canSave ? 'save-enabled' : 'save-disabled'}`}
            disabled={!isInitialized || isLoading || !canSave}
            title={canSave ? "Salva il lore corrente" : "Nessun lore da salvare nel messaggio corrente"}
          >
            💾 Salva
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;