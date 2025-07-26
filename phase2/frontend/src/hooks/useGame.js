// src/hooks/useGame.js
import { useState, useCallback } from 'react';
import gameService from '../services/gameService'; // Assicurati che il percorso sia corretto

export const useGame = () => {
  const [gameState, setGameState] = useState('Benvenuto nel gioco! Premi "Avvia Gioco" per iniziare.');
  const [gameActions, setGameActions] = useState({}); // Dizionario di azioni
  const [gameImageUrl, setGameImageUrl] = useState('');
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [gameError, setGameError] = useState(null);
  // const [gameStatus, setGameStatus] = useState('IDLE'); // Rimosso: non gestiamo più lo status dal backend

  /**
   * Avvia un nuovo gioco.
   */
  const startGame = useCallback(async () => {
    setIsGameLoading(true);
    setGameError(null);

    try {
      const result = await gameService.startGame(); // Chiamata a gameService.startGame()

      if (result.success) {
        setGameState(result.state);
        setGameActions(result.actions);
        setGameImageUrl(result.imageUrl);
        // setGameStatus('PLAYING'); // Rimosso: impostiamo sempre a PLAYING per un mock
      } else {
        setGameError(result.state);
        // setGameStatus('ERROR'); // Rimosso
      }
    } catch (err) {
      setGameError('Errore sconosciuto durante l\'avvio del gioco.');
      // setGameStatus('ERROR'); // Rimosso
      console.error('Errore startGame:', err);
    } finally {
      setIsGameLoading(false);
    }
  }, []);

  /**
   * Invia un'azione al gioco e riceve il nuovo stato.
   * @param {string} actionId - L'ID dell'azione scelta.
   */
  const sendGameAction = useCallback(async (actionId) => {
    setIsGameLoading(true);
    setGameError(null);

    try {
      const result = await gameService.sendAction(actionId); // Chiamata a gameService.sendAction()

      if (result.success) {
        setGameState(result.state);
        setGameActions(result.actions);
        setGameImageUrl(result.imageUrl);
        // setGameStatus('PLAYING'); // Rimosso: impostiamo sempre a PLAYING
      } else {
        setGameError(result.state);
        // setGameStatus('ERROR'); // Rimosso
      }
    } catch (err) {
      setGameError('Errore sconosciuto durante l\'invio dell\'azione.');
      // setGameStatus('ERROR'); // Rimosso
      console.error('Errore sendGameAction:', err);
    } finally {
      setIsGameLoading(false);
    }
  }, []);

  return {
    gameState,
    gameActions,
    gameImageUrl,
    isGameLoading,
    gameError,
    // gameStatus, // Rimosso
    startGame,      // Funzione per avviare il gioco
    sendGameAction, // Funzione per inviare un'azione
  };
};