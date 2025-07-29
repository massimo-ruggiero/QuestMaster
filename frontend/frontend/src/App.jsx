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
  const [showChat, setShowChat] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLoreSaved = useCallback((filename) => {
    setUploadedFile(filename);
    setShowErrorPopup(false);
  }, []);

  
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

      if (hasError) {
        setTimeout(() => {
          setCurrentScreen('main');
          setIsProcessing(false);
          setShowErrorPopup(true);
          setTimeout(() => setShowErrorPopup(false), 5000);
          setLoadingProgress([]); 
        }, 2000);
      } else {
        setTimeout(() => {
          setCurrentScreen('gameplay');
          setIsProcessing(false);
          setLoadingProgress([]); 
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

      setTimeout(() => {
        setCurrentScreen('main');
        setIsProcessing(false);
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 5000);
        setLoadingProgress([]); 
      }, 2000);
    }
  }, []);

  return (
    <div className="brick-pattern app-container">
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
          loadingProgress={loadingProgress} 
          isProcessing={isProcessing}     
        />
      )}
      {currentScreen === 'gameplay' && (
        <GameplayScreen
          onBackToMain={() => setCurrentScreen('main')} 
        />
      )}

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
