import { useState, useCallback } from 'react';
import gameService from '../services/gameService'; 

export const useGame = () => {
  const [gameState, setGameState] = useState('Benvenuto nel gioco! Premi "Avvia Gioco" per iniziare.');
  const [gameActions, setGameActions] = useState({}); // Dizionario di azioni
  const [gameImageUrl, setGameImageUrl] = useState('');
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [gameError, setGameError] = useState(null);


  const startGame = useCallback(async () => {
    setIsGameLoading(true);
    setGameError(null);

    try {
      const result = await gameService.startGame(); 

      if (result.success) {
        setGameState(result.state);
        setGameActions(result.actions);
        setGameImageUrl(result.imageUrl);
      } else {
        setGameError(result.state);
      }
    } catch (err) {
      setGameError('Errore sconosciuto durante l\'avvio del gioco.');
      console.error('Errore startGame:', err);
    } finally {
      setIsGameLoading(false);
    }
  }, []);

 
  const sendGameAction = useCallback(async (actionId) => {
    setIsGameLoading(true);
    setGameError(null);

    try {
      const result = await gameService.sendAction(actionId); 

      if (result.success) {
        setGameState(result.state);
        setGameActions(result.actions);
        setGameImageUrl(result.imageUrl);
      } else {
        setGameError(result.state);
      }
    } catch (err) {
      setGameError('Errore sconosciuto durante l\'invio dell\'azione.');
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
    startGame,
    sendGameAction,
  };
};