import { useState, useCallback, useEffect } from 'react';
import chatService from '../services/chatService';

export const useChat = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Inizializza la chat quando il hook viene montato
  const initializeChat = useCallback(async () => {
    if (isInitialized) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatService.startChat();
      
      if (result.success) {
        setIsInitialized(true);
        // Aggiungi il messaggio iniziale del bot
        setChatMessages([{
          text: result.message,
          isBot: true,
          action: result.action,
          timestamp: new Date()
        }]);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Errore durante l\'inizializzazione della chat');
      console.error('Errore inizializzazione:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Invia un messaggio
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || isLoading || !isInitialized) return;

    // Aggiungi il messaggio dell'utente immediatamente
    const userMessage = {
      text: messageText.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatService.sendMessage(messageText.trim());
      
      if (result.success) {
        // Aggiungi la risposta del bot
        const botMessage = {
          text: result.message,
          isBot: true,
          action: result.action,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev, botMessage]);

        // Se l'azione è "save" o "exit", potresti voler fare qualcosa di speciale
        if (result.action === 'save') {
          console.log('Lore salvato con successo!');
        } else if (result.action === 'exit') {
          console.log('Chat terminata dall\'utente');
          setIsInitialized(false);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Errore durante l\'invio del messaggio');
      console.error('Errore invio messaggio:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isInitialized]);

  // Ferma la chat
  const stopChat = useCallback(async () => {
    try {
      await chatService.stopChat();
      setIsInitialized(false);
      setChatMessages([]);
      setError(null);
    } catch (err) {
      console.error('Errore durante la chiusura della chat:', err);
    }
  }, []);

  // Resetta lo stato di errore
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Resetta la chat
  const restartChat = useCallback(async () => {
    await stopChat();
    await initializeChat();
  }, [stopChat, initializeChat]);

  return {
    chatMessages,
    isLoading,
    isInitialized,
    error,
    initializeChat,
    sendMessage,
    stopChat,
    clearError,
    restartChat
  };
};