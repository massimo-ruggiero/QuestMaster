// Chat.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MessageSquare, BookOpen, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useChat } from '../hooks/useChat';

/**
 * Componente Chat per l'interazione con il Lore Assistant.
 * Gestisce l'input dell'utente, la visualizzazione dei messaggi,
 * l'invio di comandi al backend (come "salva lore" e riavvio chat),
 * e l'integrazione con il custom hook `useChat`.
 *
 * @param {Object} props - Le proprietà del componente.
 * @param {boolean} props.showChat - Indica se la finestra della chat deve essere visibile.
 * @param {Function} props.setShowChat - Funzione per impostare la visibilità della chat.
 * @param {Function} props.onLoreSaved - Callback chiamato quando il lore viene salvato con successo.
 */
const Chat = ({ showChat, setShowChat, onLoreSaved }) => {
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  const {
    chatMessages,
    setChatMessages,
    isLoading,
    isInitialized,
    error,
    initializeChat,
    sendMessage,
    stopChat,
    clearError,
    isRestarting,
    setIsRestarting,
    afterSaveOnlyRestart,
    setAfterSaveOnlyRestart,
    restartChat,
    saveLore, // IMPORTA la nuova funzione saveLore
  } = useChat();

  const hasLoreInLastMessage = useCallback(() => {
    if (chatMessages.length === 0) return false;

    const lastBotMessage = [...chatMessages]
      .reverse()
      .find(msg => msg.isBot);

    if (!lastBotMessage) return false;

    const loreRegex = /<lore>[\s\S]*?<\/lore>/i;
    return loreRegex.test(lastBotMessage.text);
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    console.log("Chat Messages Updated:", chatMessages);
  }, [chatMessages]);


  useEffect(() => {
    if (showChat && !isInitialized && !isLoading && !isRestarting) {
      initializeChat();
    }
  }, [showChat, isInitialized, isLoading, initializeChat, isRestarting]);

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || isLoading || isRestarting || afterSaveOnlyRestart) return;

    const messageText = chatInput.trim();
    setChatInput('');
    await sendMessage(messageText);
  }, [chatInput, isLoading, sendMessage, isRestarting, afterSaveOnlyRestart]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
  }, [setShowChat]);

  /**
   * Gestisce il salvataggio del lore chiamando direttamente la funzione `saveLore` dal hook.
   * Il backend è ora responsabile di estrarre e salvare il lore.
   */
  const handleSaveLore = useCallback(async () => {
    // Non salvare se il sistema è occupato, non c'è lore, in riavvio o dopo il salvataggio
    if (isLoading || !hasLoreInLastMessage() || isRestarting || afterSaveOnlyRestart) return;

    try {
      await saveLore(); // CHIAMA LA NUOVA FUNZIONE saveLore DAL HOOK
      // Una volta che saveLore() è completato con successo (o fallito),
      // il suo stato `afterSaveOnlyRestart` sarà aggiornato.
      
      // Se vuoi comunque notificare il componente parent dopo il tentativo di salvataggio
      // (indipendentemente dal risultato del caricamento frontend del file, che ora non facciamo più qui)
      if (onLoreSaved) {
        // Puoi passare un indicatore di successo o il nome del file se lo conosci
        onLoreSaved('lore.txt'); // Assumendo che il nome del file sia sempre 'lore.txt'
      }

    } catch (error) {
      console.error('Errore durante il salvataggio del lore (frontend):', error);
      // L'errore sarà già gestito dal useChat, qui solo un log aggiuntivo.
    }
  }, [isLoading, hasLoreInLastMessage, isRestarting, afterSaveOnlyRestart, onLoreSaved, saveLore]); // Aggiungi saveLore alle dipendenze

  const handleRestartChat = useCallback(async () => {
    if (isRestarting) return;
    await restartChat();
  }, [isRestarting, restartChat]);

  const ErrorMessage = ({ message, onClose }) => (
    <div className="chat-error">
      <div className="error-content">
        <AlertCircle className="error-icon" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="error-close">✕</button>
    </div>
  );

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
  const canRestart = (isInitialized && !isLoading && !isRestarting) || afterSaveOnlyRestart;

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
          {(isRestarting || (!isInitialized && isLoading)) ? (
            <div className="chat-initializing">
              <Loader2 className="loading-spinner" />
              <span>{isRestarting ? "Riavvio Lore Assistant..." : "Inizializzazione Lore Assistant..."}</span>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}>
                  <div className="chat-bubble">
                    {msg.text}
                    {msg.action === 'save'}
                    {msg.action === 'exit'}
                  </div>
                </div>
              ))}

              {isLoading && !isRestarting && <TypingIndicator />}
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
              isInitialized && !isRestarting
                ? "Scrivi un messaggio..."
                : "Inizializzazione in corso..."
            }
            disabled={!isInitialized || isLoading || isRestarting || afterSaveOnlyRestart}
          />
          <button
            onClick={handleSendMessage}
            className="retro-button send-button"
            disabled={!isInitialized || isLoading || !chatInput.trim() || isRestarting || afterSaveOnlyRestart}
          >
            {isLoading ? (
              <Loader2 className="send-icon loading" />
            ) : (
              <MessageSquare className="send-icon" />
            )}
          </button>
          <button
            onClick={handleSaveLore}
            className={`retro-button send-button ${canSave && !afterSaveOnlyRestart ? 'send-enabled' : 'send-disabled'}`}
            disabled={!isInitialized || isLoading || !canSave || isRestarting || afterSaveOnlyRestart}
            title={canSave && !afterSaveOnlyRestart ? "Salva il lore corrente" : "Nessuno lore da salvare nel messaggio corrente o azione non disponibile"}
          >
            💾 Salva
          </button>
          <button
            onClick={handleRestartChat}
            className={`retro-button send-button ${canRestart ? 'send-enabled' : 'send-disabled'}`}
            disabled={!canRestart}
            title={canRestart ? "Riavvia la chat" : "Impossibile riavviare la chat"}
          >
            <Plus className="send-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;