import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import '../styles/gameplayScreen.css';
import { useGame } from '../hooks/useGame';
import winImage from '../default_images/WIN.png';
import gameoverImage from '../default_images/GAME_OVER.png';

/**
 * Componente GameplayScreen per la schermata di gioco.
 * Mostra lo stato del gioco (con testo nascosto all'hover), un'immagine, e le azioni interattive.
 */
function GameplayScreen({ onBackToMain }) {
  const {
    gameState,      
    gameActions,    
    gameImageUrl,   
    isGameLoading,  
    gameError,      
    startGame,      
    sendGameAction, 
  } = useGame();

  
  const [currentActionPageIndex, setCurrentActionPageIndex] = useState(0);
  const actionsPerPage = 3;
  const hasGameStartedInitialCall = useRef(false);

  const displayImageSrc =
    gameState === 'WIN'
      ? winImage
      : gameState === 'GAME-OVER'
      ? gameoverImage
      : gameImageUrl;

  
  useEffect(() => {
    if (Object.keys(gameActions).length === 0 && !isGameLoading && !gameError && !hasGameStartedInitialCall.current) {
      startGame();
      hasGameStartedInitialCall.current = true;
    }
  }, [startGame, gameActions, isGameLoading, gameError]);

  
  const actionEntries = Object.entries(gameActions);
  const totalActionPages = Math.ceil(actionEntries.length / actionsPerPage);
  const currentPaginatedActions = actionEntries.slice(
    currentActionPageIndex * actionsPerPage,
    (currentActionPageIndex + 1) * actionsPerPage
  );

  
  const nextActions = useCallback(() => {
    setCurrentActionPageIndex(prev => (prev + 1) % totalActionPages);
  }, [totalActionPages]);

 
  const prevActions = useCallback(() => {
    setCurrentActionPageIndex(prev => (prev - 1 + totalActionPages) % totalActionPages);
  }, [totalActionPages]);


  const handleActionClick = useCallback(async (actionId) => {
    if (isGameLoading) return;
    setCurrentActionPageIndex(0);
    await sendGameAction(actionId);
  }, [isGameLoading, sendGameAction]);

  
  const areActionsDisabled = isGameLoading || actionEntries.length === 0;

  
  const isGameStarted = Object.keys(gameActions).length > 0 && !gameError;

  return (
    <div className="gameplay-screen">
      <div className="retro-window gameplay-window">
        <div className="retro-title-bar">
          <span className="title-text">🎮 Quest-Master 🎮</span> 
        </div>
        <div className="gameplay-content">
          <div className="gameplay-viewport">
            <div className="gameplay-screen-inner">
              {isGameLoading && (
                <div className="loading-overlay">
                  <Loader2 className="loading-spinner" />
                  <span>Caricamento...</span>
                </div>
              )}
              
              {displayImageSrc && (
                <div className="image-and-state-container">
                  <img src={displayImageSrc} alt="Scena di gioco" className="gameplay-image" />
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
            </div>
          </div>
        </div>
      </div>

      <div className="retro-window actions-window">
        <div className="actions-content">
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