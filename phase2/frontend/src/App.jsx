// src/App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Chat from './components/Chat';
import LoadingScreen from './components/LoadingScreen';
import MainScreen from './components/MainScreen';
import GameplayScreen from './components/GameplayScreen';

// Importa i nuovi file CSS separati
import './styles/base.css';           
import './styles/app.css';
import './styles/retro.css';
import './styles/chat.css';           
import './styles/loadingScreen.css';  
import './styles/mainScreen.css';
import './styles/gameplayScreen.css';

/**
 * Componente principale dell'applicazione.
 * Gestisce la navigazione tra le diverse schermate (Main, Loading, Gameplay)
 * e la logica di base per il caricamento dei file e l'elaborazione dello stream.
 */
function App() {
  // Stato corrente della schermata: 'main' (principale), 'loading' (caricamento), 'gameplay' (gioco)
  const [currentScreen, setCurrentScreen] = useState('main');
  // Stato per controllare la visibilità della chat
  const [showChat, setShowChat] = useState(false);
  // Stato per memorizzare il nome del file caricato
  const [uploadedFile, setUploadedFile] = useState(null);
  // Stato per controllare la visibilità del popup di errore globale
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  // Array che memorizza il progresso del caricamento, con i messaggi dello stream
  const [loadingProgress, setLoadingProgress] = useState([]);
  // Stato che indica se un processo di elaborazione è in corso
  const [isProcessing, setIsProcessing] = useState(false);

  // Callback chiamato dalla componente Chat quando il lore viene salvato.
  // Aggiorna il nome del file caricato e nasconde il popup di errore.
  const handleLoreSaved = useCallback((filename) => {
    setUploadedFile(filename);
    setShowErrorPopup(false);
  }, []);

  /**
   * Gestisce l'avvio del processo di stream.
   * Invia una richiesta al backend e processa lo stream di dati in tempo reale.
   * Gestisce il progresso, gli errori e la transizione tra le schermate.
   */
  const handleProcessStream = useCallback(async () => {
    setIsProcessing(true); // Imposta lo stato di elaborazione su true
    setLoadingProgress([]); // Resetta il progresso del caricamento
    setCurrentScreen('loading'); // Passa alla schermata di caricamento

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
      let hasError = false; // Flag per tracciare se si è verificato un errore durante lo stream

      // Legge lo stream di dati
      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // Termina quando lo stream è finito

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              // Controlla se c'è un errore di fallimento nel dato ricevuto
              if (data.event === 'fail') {
                hasError = true;
              }

              // Aggiorna lo stato del progresso del caricamento
              setLoadingProgress(prev => [...prev, {
                id: Date.now() + Math.random(), // ID unico per ogni messaggio
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

      // Logica post-stream: gestione successo o errore
      if (hasError) {
        // Se c'è stato un errore, torna alla home e mostra popup errore
        setTimeout(() => {
          setCurrentScreen('main');
          setIsProcessing(false);
          setShowErrorPopup(true);
          setTimeout(() => setShowErrorPopup(false), 5000);
          setLoadingProgress([]); // Resetta il progresso dopo l'errore
        }, 2000);
      } else {
        // Processo completato con successo, vai alla gameplay screen
        setTimeout(() => {
          setCurrentScreen('gameplay');
          setIsProcessing(false);
          setLoadingProgress([]); // Resetta il progresso dopo il successo
        }, 1500);
      }

    } catch (error) {
      // Gestione errori di rete o altri errori durante il fetch
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
        setLoadingProgress([]); // Resetta il progresso dopo l'errore
      }, 2000);
    }
  }, []);

  return (
    <div className="brick-pattern app-container">
      {/* Renderizza la schermata corrente in base allo stato */}
      {currentScreen === 'main' && (
        <MainScreen
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          setShowErrorPopup={setShowErrorPopup}
          onProcessStart={handleProcessStream}
        />
      )}
      {currentScreen === 'loading' && (
        <LoadingScreen
          loadingProgress={loadingProgress} // Passa il progresso del caricamento alla LoadingScreen
          isProcessing={isProcessing}     // Passa lo stato di elaborazione alla LoadingScreen
        />
      )}
      {currentScreen === 'gameplay' && (
        <GameplayScreen
          onBackToMain={() => setCurrentScreen('main')} // Passa la funzione per tornare alla main screen
        />
      )}

      {/* La chat è visibile solo nella schermata principale */}
      {currentScreen === 'main' && (
        <div className="chat-container">
          <Chat
            showChat={showChat}
            setShowChat={setShowChat}
            onLoreSaved={handleLoreSaved} // Passa il callback per il salvataggio del lore
          />
        </div>
      )}

      {/* Popup di errore globale */}
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
