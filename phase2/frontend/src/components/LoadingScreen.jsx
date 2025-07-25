import React, { useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import '../styles/loadingScreen.css'; 

/**
 * Componente LoadingScreen per visualizzare lo stato di elaborazione del lore.
 * Mostra un terminale con messaggi di progresso e animazioni.
 *
 * @param {Object} props - Le proprietà del componente.
 * @param {Array<Object>} props.loadingProgress - Array di oggetti che rappresentano lo stato di avanzamento del caricamento.
 * @param {boolean} props.isProcessing - Indica se il processo di elaborazione è ancora in corso.
 */

function LoadingScreen({ loadingProgress, isProcessing }) {
  // Controlla se c'è stato un errore nel processo
  const hasError = loadingProgress.some(item => item.event === 'fail' || item.event === 'error');
  // Riferimento per lo scroll automatico dei messaggi del terminale
  const messagesEndRef = useRef(null);

  // Effetto per scorrere automaticamente ai nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [loadingProgress]);

  return (
    <div className="loading-screen brick-pattern">
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
          <div className="terminal-title">SISTEMA DI ELABORAZIONE DEL LORE</div>
        </div>

        <div className="terminal-content">
          <div className="terminal-messages">
            {loadingProgress.map((item) => (
              <div key={item.id} className={`terminal-line ${item.event}`}>
                <span className="line-prefix">
                  [{new Date(item.timestamp).toLocaleTimeString()}]
                </span>
                <span className="line-stage">
                  {item.stage === 'pddl' ? '[PDDL-AGENT]' :
                   item.stage === 'reflective' ? '[REFLECTIVE-AGENT]' :
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

            {/* Elemento invisibile per lo scroll automatico */}
            <div ref={messagesEndRef} />
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
}

export default LoadingScreen;
