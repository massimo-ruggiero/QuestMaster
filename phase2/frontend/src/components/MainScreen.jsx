// src/components/MainScreen.jsx
import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import '../styles/mainScreen.css'; // Assicurati che questo percorso sia corretto

/**
 * Componente MainScreen per la schermata principale dell'applicazione.
 * Permette all'utente di caricare un documento lore tramite drag-and-drop
 * e di avviare il processo di elaborazione.
 *
 * @param {Object} props - Le proprietà del componente.
 * @param {string|null} props.uploadedFile - Il nome del file caricato, o null se nessun file è stato caricato.
 * @param {Function} props.setUploadedFile - Funzione per impostare il nome del file caricato.
 * @param {Function} props.setShowErrorPopup - Funzione per mostrare/nascondere il popup di errore globale.
 * @param {Function} props.onProcessStart - Callback chiamato per avviare il processo di stream.
 */
function MainScreen({ uploadedFile, setUploadedFile, setShowErrorPopup, onProcessStart }) {
  // Stato per gestire l'effetto visivo di "drag-over" sulla drop zone
  const [dragOver, setDragOver] = useState(false);
  // Stato per forzare il re-render della drop zone quando necessario (es. dopo la chiusura della chat)
  const [dropZoneKey, setDropZoneKey] = useState(0);

  /**
   * Gestisce l'evento di drag-over sulla drop zone.
   * Impedisce il comportamento predefinito del browser e imposta lo stato `dragOver` su `true`.
   * @param {Event} e - L'evento di drag.
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  /**
   * Gestisce l'evento di drag-leave dalla drop zone.
   * Impedisce il comportamento predefinito del browser e imposta lo stato `dragOver` su `false`.
   * @param {Event} e - L'evento di drag.
   */
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  /**
   * Gestisce l'evento di drop di un file sulla drop zone.
   * Verifica il tipo di file (solo .txt o .md) e aggiorna lo stato del file caricato.
   * Mostra un popup di errore se il file non è valido.
   * @param {Event} e - L'evento di drop.
   */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/plain' || file.name.endsWith('.md'))) {
      setUploadedFile(file.name);
      setShowErrorPopup(false); // Nasconde eventuali errori precedenti
    } else {
      setShowErrorPopup(true); // Mostra errore se il file non è valido
      setTimeout(() => setShowErrorPopup(false), 3000);
    }
  }, [setUploadedFile, setShowErrorPopup]);

  /**
   * Rimuove il file caricato e nasconde eventuali popup di errore.
   */
  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setShowErrorPopup(false);
  }, [setUploadedFile, setShowErrorPopup]);

  // Questo useEffect è stato rimosso da App.jsx e non è strettamente necessario qui
  // a meno che non ci sia una logica specifica di MainScreen che dipenda da `showChat`
  // per resettare la drop zone. Per ora, lo lascio fuori.
  // useEffect(() => {
  //   if (!showChat) {
  //     setDropZoneKey(prev => prev + 1);
  //   }
  // }, [showChat]); // Dipende da showChat, che non è una prop di MainScreen in questa versione.

  return (
    <div className="main-screen">
      <div className="retro-window upload-window">
        <div className="retro-title-bar">
          <span className="title-text">📄 Carica Documento Lore</span>
        </div>
        <div className="upload-content">
          <div
            key={dropZoneKey} // Usa la key per forzare il re-render solo quando necessario
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
        onClick={onProcessStart} // Chiama la funzione passata da App.jsx
        className="retro-button continue-button"
        disabled={!uploadedFile}
      >
        CONTINUA →
      </button>
    </div>
  );
}

export default MainScreen;
