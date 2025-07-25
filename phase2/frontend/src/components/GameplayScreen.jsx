// src/components/GameplayScreen.jsx
import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import '../styles/gameplayScreen.css'; // Assicurati che questo percorso sia corretto

/**
 * Componente GameplayScreen per la schermata di gioco.
 * Mostra un'anteprima del gameplay e un set di azioni interattive
 * con navigazione tra le pagine di azioni.
 *
 * @param {Object} props - Le proprietà del componente.
 * @param {Function} props.onBackToMain - Callback chiamato per tornare alla schermata principale.
 */
function GameplayScreen({ onBackToMain }) {
  // Array di immagini di gameplay di esempio
  const gameplayImages = [
    "🎮 Schermata di gioco 1",
    "⚔️ Battaglia epica",
    "🏰 Esplorazione castello",
    "💎 Raccolta tesori",
    "🐉 Boss finale"
  ];
  // Array di azioni di gameplay di esempio
  const gameplayActions = [
    "Sconfiggi il nemico",
    "Conquista la fiducia del mago",
    "Esplora il castello abbandonato",
    "Raccogli i cristalli magici",
    "Affronta il boss finale",
    "Salva la principessa",
    "Trova la chiave segreta",
    "Risolvi l'enigma antico",
    "Attraversa il ponte pericoloso",
    "Parla con l'oracolo"
  ];
  // Indice dell'immagine di gameplay corrente (non ha logica di cambio in questo esempio)
  const [currentGameplayImage] = useState(0);
  // Indice dell'azione corrente visualizzata nella paginazione
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  // Numero di azioni da mostrare per pagina
  const actionsPerPage = 3;
  // Calcolo del numero totale di pagine di azioni
  const totalPages = Math.ceil(gameplayActions.length / actionsPerPage);
  // Azioni da visualizzare nella pagina corrente
  const currentActions = gameplayActions.slice(
    currentActionIndex * actionsPerPage,
    (currentActionIndex + 1) * actionsPerPage
  );

  /**
   * Passa alla pagina successiva delle azioni.
   */
  const nextActions = useCallback(() => {
    setCurrentActionIndex(prev => (prev + 1) % totalPages);
  }, [totalPages]);

  /**
   * Passa alla pagina precedente delle azioni.
   */
  const prevActions = useCallback(() => {
    setCurrentActionIndex(prev => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  return (
    <div className="gameplay-screen">
      <div className="retro-window gameplay-window">
        <div className="retro-title-bar">
          <span className="title-text">🎮 Gameplay Preview</span>
        </div>
        <div className="gameplay-content">
          <div className="gameplay-viewport">
            <div className="gameplay-screen-inner">
              <div className="gameplay-display">
                {gameplayImages[currentGameplayImage]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="retro-window actions-window">
        <div className="actions-content">
          <div className="actions-grid">
            {currentActions.map((action, idx) => (
              <button
                key={idx}
                className="retro-text-action"
              >
                {action}
              </button>
            ))}
          </div>
          <div className="actions-navigation">
            <button
              onClick={prevActions}
              className="retro-button nav-button"
              disabled={totalPages <= 1}
            >
              <ArrowLeft className="nav-icon" />
            </button>
            <span className="page-indicator">
              {currentActionIndex + 1} / {totalPages}
            </span>
            <button
              onClick={nextActions}
              className="retro-button nav-button"
              disabled={totalPages <= 1}
            >
              <ArrowRight className="nav-icon" />
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={onBackToMain} // Chiama la funzione passata da App.jsx
        className="retro-button back-button"
      >
        ← INDIETRO
      </button>
    </div>
  );
}

export default GameplayScreen;
