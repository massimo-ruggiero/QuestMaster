import { useState, useCallback } from 'react';
import chatService from '../services/chatService';

export const useChat = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isRestarting, setIsRestarting] = useState(false);
  const [afterSaveOnlyRestart, setAfterSaveOnlyRestart] = useState(false);

  const initializeChat = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatService.startChat();
      
      if (result.success) {
        setIsInitialized(true);
        setChatMessages(prevMessages => [...prevMessages, {
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
  }, []);

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
      const result = await chatService.sendMessage(messageText.trim());
      
      if (result.success) {
        const botMessage = {
          text: result.message,
          isBot: true,
          action: result.action,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMessage]);

        if (result.action === 'save') {
          console.log('Backend ha segnalato un\'azione di salvataggio.');
        } else if (result.action === 'exit') {
          console.log('Chat terminata dall\'utente');
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

  const stopChat = useCallback(async () => {
    try {
      await chatService.stopChat();
      setIsInitialized(false);
      setError(null);
    } catch (err) {
      console.error('Errore durante la chiusura della chat:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const restartChat = useCallback(async () => {
    if (isLoading || isRestarting) return;

    setIsRestarting(true);
    setError(null);
    setAfterSaveOnlyRestart(false);
    setChatMessages([]);

    try {
      const result = await chatService.restartChat();
      if (result.success) {
        setIsInitialized(true);
        setChatMessages(prevMessages => [...prevMessages, {
          text: result.message,
          isBot: true,
          action: result.action,
          timestamp: new Date()
        }]);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Errore durante il riavvio della chat');
      console.error('Errore riavvio:', err);
    } finally {
      setIsRestarting(false);
      setIsLoading(false);
    }
  }, [isLoading, isRestarting, setChatMessages]);

  const saveLore = useCallback(async () => {
    if (isLoading || isRestarting || afterSaveOnlyRestart) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await chatService.saveLore();
      if (result.success) {
        setAfterSaveOnlyRestart(true); 
        setChatMessages(prev => [...prev, {
          text: result.message, 
          isBot: true,
          action: result.action,
          timestamp: new Date()
        }]);
        console.log('Lore salvato con successo dal backend!');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Errore durante il salvataggio del lore');
      console.error('Errore salvataggio lore:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isRestarting, afterSaveOnlyRestart, setChatMessages]);


  return {
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
    saveLore, 
  };
};