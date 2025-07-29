import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import '../styles/mainScreen.css'; 
import { uploadLoreFile } from '../services/fileUploadService';

/**
 * Componente MainScreen per la schermata principale dell'applicazione.
 * Permette all'utente di caricare un documento lore tramite drag-and-drop
 * e di avviare il processo di elaborazione.
 */
function MainScreen({ uploadedFile, setUploadedFile, setShowErrorPopup, onProcessStart }) {
  const [dragOver, setDragOver] = useState(false);
  const [dropZoneKey, setDropZoneKey] = useState(0);


  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);


  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);


  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    console.log(file)
    if (file && (file.type === 'text/plain') || file.name.toLowerCase().endsWith('.txt')) {
      try{
        await uploadLoreFile(file);
        setUploadedFile(file.name);
        setShowErrorPopup(false);
      } catch(error) {
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 3000);
      }
    } else {
      setShowErrorPopup(true); 
      setTimeout(() => setShowErrorPopup(false), 3000);
    }
  }, [setUploadedFile, setShowErrorPopup]);

 
  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setShowErrorPopup(false);
  }, [setUploadedFile, setShowErrorPopup]);

 
  return (
    <div className="main-screen">
      <div className="retro-window upload-window">
        <div className="retro-title-bar">
          <span className="title-text">📄 Carica Documento Lore</span>
        </div>
        <div className="upload-content">
          <div
            key={dropZoneKey} 
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
                  Supporta file .txt
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
        onClick={onProcessStart} 
        className="retro-button continue-button"
        disabled={!uploadedFile}
      >
        CONTINUA →
      </button>
    </div>
  );
}

export default MainScreen;
