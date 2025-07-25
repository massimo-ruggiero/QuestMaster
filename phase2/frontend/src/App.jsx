import React, { useState, useCallback } from 'react';
import {
  Upload,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Chat from './components/Chat';
import './index.css';
import './styles/chat.css'; // Importa i nuovi stili

function App() {
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main' | 'loading' | 'gameplay'
  const [showChat, setShowChat] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [currentGameplayImage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = e => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = e => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.md'))) {
      setUploadedFile(file.name);
      setShowErrorPopup(false);
    } else {
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
    }
  };
  
  const removeFile = () => {
    setUploadedFile(null);
    setShowErrorPopup(false);
  };

  // Callback chiamato quando il lore viene salvato
  const handleLoreSaved = useCallback((filename) => {
    setUploadedFile(filename);
    setShowErrorPopup(false);
  }, []);

  // Gestisce il process stream
  const handleProcessStream = useCallback(async () => {
    setIsProcessing(true);
    setLoadingProgress([]);
    setCurrentScreen('loading');

    try {
      const response = await fetch('http://localhost:5001/process_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let hasError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Controlla se c'è un errore di fallimento
              if (data.event === 'fail') {
                hasError = true;
              }
              
              setLoadingProgress(prev => [...prev, {
                id: Date.now() + Math.random(),
                stage: data.stage,
                event: data.event,
                message: data.message || '',
                payload: data.payload || null,
                timestamp: new Date()
              }]);
            } catch (e) {
              console.error('Errore parsing JSON:', e);
            }
          }
        }
      }

      // Se c'è stato un errore, torna alla home e mostra popup errore
      if (hasError) {
        setTimeout(() => {
          setCurrentScreen('main');
          setIsProcessing(false);
          setShowErrorPopup(true);
          setTimeout(() => setShowErrorPopup(false), 5000);
        }, 2000);
      } else {
        // Processo completato con successo, vai alla gameplay screen
        setTimeout(() => {
          setCurrentScreen('gameplay');
          setIsProcessing(false);
        }, 1500);
      }

    } catch (error) {
      console.error('Errore durante il process stream:', error);
      setLoadingProgress(prev => [...prev, {
        id: Date.now(),
        stage: 'error',
        event: 'error',
        message: 'Errore durante l\'elaborazione: ' + error.message,
        timestamp: new Date()
      }]);
      
      // Torna alla home con errore
      setTimeout(() => {
        setCurrentScreen('main');
        setIsProcessing(false);
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 5000);
      }, 2000);
    }
  }, []);

  const MainScreen = () => (
    <div className="main-screen">
      <div className="retro-window upload-window">
        <div className="retro-title-bar">
          <span className="title-text">📄 Carica Documento Lore</span>
        </div>
        <div className="upload-content">
          <div
            className={`retro-drop-zone ${dragOver ? 'drag-over' : ''} ${uploadedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!uploadedFile ? (
              <>
                <Upload className="upload-icon" />
                <p className="upload-main-text">
                  Trascina qui il tuo documento lore
                </p>
                <p className="upload-sub-text">
                  Supporta file .txt e .md
                </p>
              </>
            ) : (
              <div className="file-loaded">
                <div className="file-icon">📄</div>
                <p className="file-name">{uploadedFile}</p>
                <button
                  onClick={removeFile}
                  className="retro-button remove-button"
                >
                  🗑️ Rimuovi File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleProcessStream}
        className="retro-button continue-button"
        disabled={!uploadedFile}
      >
        CONTINUA →
      </button>
    </div>
  );

  const LoadingScreen = () => {
    const hasError = loadingProgress.some(item => item.event === 'fail' || item.event === 'error');
    
    return (
      <div className="loading-screen">
        <div className="loading-backdrop">
          {/* Effetto matrix di sfondo */}
          <div className="matrix-rain">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="matrix-column" style={{animationDelay: `${i * 0.5}s`}}>
                {Array.from({length: 20}).map((_, j) => (
                  <span key={j} className="matrix-char">
                    {String.fromCharCode(65 + Math.random() * 26)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="loading-terminal">
          <div className="terminal-header">
            <div className="terminal-buttons">
              <span className="terminal-button red"></span>
              <span className="terminal-button yellow"></span>
              <span className="terminal-button green"></span>
            </div>
            <div className="terminal-title">⚡ SISTEMA DI ELABORAZIONE LORE v2.1</div>
          </div>
          
          <div className="terminal-content">
            <div className="loading-ascii-art">
              <pre>{`
   ╔═══════════════════════════════════════╗
   ║        🏛️  LORE PROCESSOR  🏛️        ║
   ║                                       ║
   ║     ⚡ Inizializzazione sistema...     ║
   ╚═══════════════════════════════════════╝
              `}</pre>
            </div>

            <div className="terminal-messages">
              {loadingProgress.map((item, index) => (
                <div key={item.id} className={`terminal-line ${item.event}`}>
                  <span className="line-prefix">
                    [{new Date(item.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className="line-stage">
                    {item.stage === 'pddl' ? '[PDDL-ENGINE]' : 
                     item.stage === 'reflective' ? '[AI-CORE]' : 
                     item.stage === 'error' ? '[ERROR]' : 
                     `[${item.stage?.toUpperCase()}]`}
                  </span>
                  <span className="line-message">
                    {item.event === 'fail' ? `❌ ERRORE CRITICO: ${item.message}` : 
                     item.event === 'error' ? `⚠️  ERRORE: ${item.message}` :
                     item.event === 'completed' ? `✅ ${item.message}` :
                     `▶️  ${item.message}`}
                  </span>
                  {item.event === 'fail' && (
                    <div className="error-details">
                      <span className="error-code">CODICE ERRORE: LORE_PROCESSING_FAILED</span>
                      <span className="error-action">→ Ritorno alla schermata principale...</span>
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && !hasError && (
                <div className="terminal-line processing">
                  <span className="line-prefix">[{new Date().toLocaleTimeString()}]</span>
                  <span className="line-stage">[SYSTEM]</span>
                  <span className="line-message processing-text">
                    <span className="processing-dots">Elaborazione in corso</span>
                    <span className="cursor-blink">█</span>
                  </span>
                </div>
              )}
              
              {!isProcessing && !hasError && loadingProgress.length > 0 && (
                <div className="completion-banner">
                  <div className="success-ascii">
                    <pre>{`
    ████████████████████████████████████
    █                                  █
    █    ✅ ELABORAZIONE COMPLETATA    █
    █                                  █
    █     🎮 Avvio gameplay...         █
                    █                                  █
    ████████████████████████████████████
                    `}</pre>
                  </div>
                </div>
              )}

              {hasError && (
                <div className="error-banner">
                  <div className="error-ascii">
                    <pre>{`
    ████████████████████████████████████
    █                                  █
    █      ❌ PROCESSO FALLITO         █
    █                                  █
    █   🔄 Ritorno alla home page...   █
    █                                  █
    ████████████████████████████████████
                    `}</pre>
                  </div>
                </div>
              )}
            </div>

            <div className="terminal-footer">
              <div className="system-info">
                <span>CPU: [{'█'.repeat(Math.floor(Math.random() * 8) + 2)}{'░'.repeat(8)}] {20 + Math.floor(Math.random() * 60)}%</span>
                <span>RAM: [{'█'.repeat(Math.floor(Math.random() * 6) + 4)}{'░'.repeat(4)}] {60 + Math.floor(Math.random() * 30)}%</span>
                <span>PROCESSATI: {loadingProgress.length} messaggi</span>
              </div>
            </div>
          </div>
        </div>

        {hasError && (
          <div className="loading-error-notice">
            <AlertCircle className="error-icon-large" />
            <p>Il processo è fallito. Sarai reindirizzato automaticamente.</p>
          </div>
        )}
      </div>
    );
  };

  const GameplayScreen = () => {
    const gameplayImages = [
      "🎮 Schermata di gioco 1",
      "⚔️ Battaglia epica",
      "🏰 Esplorazione castello",
      "💎 Raccolta tesori",
      "🐉 Boss finale"
    ];
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
    const [currentActionIndex, setCurrentActionIndex] = useState(0);
    const actionsPerPage = 3;
    const totalPages = Math.ceil(gameplayActions.length / actionsPerPage);
    const currentActions = gameplayActions.slice(
      currentActionIndex * actionsPerPage,
      (currentActionIndex + 1) * actionsPerPage
    );

    const nextActions = () => setCurrentActionIndex(prev => (prev + 1) % totalPages);
    const prevActions = () => setCurrentActionIndex(prev => (prev - 1 + totalPages) % totalPages);

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
          onClick={() => setCurrentScreen('main')}
          className="retro-button back-button"
        >
          ← INDIETRO
        </button>
      </div>
    );
  };

  return (
    <div className="brick-pattern app-container">
      {currentScreen === 'main' && <MainScreen />}
      {currentScreen === 'loading' && <LoadingScreen />}
      {currentScreen === 'gameplay' && <GameplayScreen />}

      {currentScreen === 'main' && (
        <div className="chat-container">
          <Chat 
            showChat={showChat} 
            setShowChat={setShowChat}
            onLoreSaved={handleLoreSaved}
          />
        </div>
      )}

      {showErrorPopup && (
        <div className="error-popup-container">
          <div className="retro-error-popup">
            ❌ Elaborazione fallita! Il processo non è riuscito a completarsi correttamente.
          </div>
        </div>
      )}
    </div>
  );
}

export default App;