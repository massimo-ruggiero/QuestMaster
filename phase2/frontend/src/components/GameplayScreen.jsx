// src/components/GameplayScreen.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import '../styles/gameplayScreen.css';
import { useGame } from '../hooks/useGame';

/**
 * Componente GameplayScreen per la schermata di gioco.
 * Mostra lo stato del gioco (con testo nascosto all'hover), un'immagine, e le azioni interattive.
 *
 * @param {Object} props - Le proprietà del componente.
 * @param {Function} props.onBackToMain - Callback chiamato per tornare alla schermata principale.
 */
function GameplayScreen({ onBackToMain }) {
  const {
    gameState,      // Descrizione dello stato corrente del gioco
    gameActions,    // Dizionario delle azioni disponibili
    gameImageUrl,   // URL dell'immagine generata per lo stato corrente
    isGameLoading,  // Indica se il gioco sta caricando il prossimo stato
    gameError,      // Messaggio di errore corrente
    startGame,      // Funzione per avviare un nuovo gioco
    sendGameAction, // Funzione per inviare un'azione
  } = useGame();

  // Stato per la paginazione delle azioni
  const [currentActionPageIndex, setCurrentActionPageIndex] = useState(0);
  const actionsPerPage = 3;
  const hasGameStartedInitialCall = useRef(false);

  // Effetto per avviare il gioco automaticamente quando il componente viene montato
  useEffect(() => {
    if (Object.keys(gameActions).length === 0 && !isGameLoading && !gameError && !hasGameStartedInitialCall.current) {
      startGame();
      hasGameStartedInitialCall.current = true;
    }
  }, [startGame, gameActions, isGameLoading, gameError]);

  // Converte il dizionario delle azioni in un array per la paginazione e il rendering
  const actionEntries = Object.entries(gameActions);
  const totalActionPages = Math.ceil(actionEntries.length / actionsPerPage);
  const currentPaginatedActions = actionEntries.slice(
    currentActionPageIndex * actionsPerPage,
    (currentActionPageIndex + 1) * actionsPerPage
  );

  /**
   * Passa alla pagina successiva delle azioni.
   */
  const nextActions = useCallback(() => {
    setCurrentActionPageIndex(prev => (prev + 1) % totalActionPages);
  }, [totalActionPages]);

  /**
   * Passa alla pagina precedente delle azioni.
   */
  const prevActions = useCallback(() => {
    setCurrentActionPageIndex(prev => (prev - 1 + totalActionPages) % totalActionPages);
  }, [totalActionPages]);

  /**
   * Gestisce il click su un'azione (bottone).
   * @param {string} actionId - L'ID dell'azione scelta.
   */
  const handleActionClick = useCallback(async (actionId) => {
    if (isGameLoading) return;
    setCurrentActionPageIndex(0);
    await sendGameAction(actionId);
  }, [isGameLoading, sendGameAction]);

  // Controlla se le azioni devono essere disabilitate (solo durante il caricamento)
  const areActionsDisabled = isGameLoading || actionEntries.length === 0;

  // Il gioco è "avviato" se ci sono azioni da visualizzare e non ci sono errori.
  const isGameStarted = Object.keys(gameActions).length > 0 && !gameError;

  return (
    <div className="gameplay-screen">
      <div className="retro-window gameplay-window">
        <div className="retro-title-bar">
          <span className="title-text">🎮 Quest-Master 🎮</span> {/* Cambiato il titolo qui */}
          {/* Rimosso il pulsante Riavvia Gioco */}
        </div>
        <div className="gameplay-content">
          <div className="gameplay-viewport">
            <div className="gameplay-screen-inner">
              {/* Overlay di caricamento che copre l'immagine */}
              {isGameLoading && (
                <div className="loading-overlay">
                  <Loader2 className="loading-spinner" />
                  <span>Caricamento...</span>
                </div>
              )}
              
              {/* Contenitore per l'immagine e l'overlay dello stato */}
              {gameImageUrl && (
                <div className="image-and-state-container">
                  <img src={gameImageUrl} alt="Scena di gioco" className="gameplay-image" />
                  <div className="state-overlay">
                    <p className="game-state-text">{gameState}</p>
                  </div>
                </div>
              )}

              {gameError && (
                <div className="error-display">
                  <AlertCircle className="error-icon" />
                  <span>{gameError}</span>
                </div>
              )}
              {/* Rimosso il vecchio .gameplay-display con il testo statico */}
            </div>
          </div>
        </div>
      </div>

      <div className="retro-window actions-window">
        <div className="actions-content">
          {/* Mostra le azioni solo se il gioco è avviato e non ci sono errori. */}
          {(isGameStarted && !gameError) || isGameLoading ? (
            <>
              {actionEntries.length > 0 && (
                <div className="actions-grid">
                  {currentPaginatedActions.map(([id, actionText]) => (
                    <button
                      key={id}
                      onClick={() => handleActionClick(id)}
                      className="retro-text-action"
                      disabled={areActionsDisabled}
                    >
                      {actionText}
                    </button>
                  ))}
                </div>
              )}
              {actionEntries.length === 0 && !isGameLoading && !gameError && (
                 <div className="no-actions-message">
                   Nessuna azione disponibile.
                 </div>
              )}
              {totalActionPages > 1 && (
                <div className="actions-navigation">
                  <button
                    onClick={prevActions}
                    className="retro-button nav-button"
                    disabled={areActionsDisabled}
                  >
                    <ArrowLeft className="nav-icon" />
                  </button>
                  <span className="page-indicator">
                    {currentActionPageIndex + 1} / {totalActionPages}
                  </span>
                  <button
                    onClick={nextActions}
                    className="retro-button nav-button"
                    disabled={areActionsDisabled}
                  >
                    <ArrowRight className="nav-icon" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-actions-message">
              {isGameLoading ? "Caricamento azioni..." :
               gameError ? "Errore nel gioco." :
               ""}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onBackToMain}
        className="retro-button back-button"
      >
        ← INDIETRO
      </button>
    </div>
  );
}

export default GameplayScreen;