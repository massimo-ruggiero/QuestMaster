// chatService.js

// Configurazione API
const API_BASE_URL = 'http://localhost:5001';

class ChatService {
  constructor() {
    this.isInitialized = false;
  }

  async startChat() {
    try {
      const response = await fetch(`${API_BASE_URL}/start_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.isInitialized = true;
      
      return {
        success: true,
        message: data.response,
        action: data.action
      };
    } catch (error) {
      console.error('Errore durante l\'inizializzazione della chat:', error);
      return {
        success: false,
        message: 'Errore di connessione con il server. Assicurati che il server Flask sia avviato.',
        action: 'error'
      };
    }
  }

  async sendMessage(message) {
    if (!this.isInitialized) {
      throw new Error('Chat non inizializzata. Chiama startChat() prima.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/send_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        message: data.response,
        action: data.action
      };
    } catch (error) {
      console.error('Errore durante l\'invio del messaggio:', error);
      return {
        success: false,
        message: 'Errore di connessione con il server.',
        action: 'error'
      };
    }
  }

  async restartChat() {
    try {
      const response = await fetch(`${API_BASE_URL}/restart_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.isInitialized = true;
      
      return {
        success: true,
        message: data.response,
        action: data.action
      };
    } catch (error) {
      console.error('Errore durante il restart della chat:', error);
      return {
        success: false,
        message: 'Errore durante il restart della chat. Assicurati che il server Flask sia avviato.',
        action: 'error'
      };
    }
  }

  async stopChat() {
    try {
      const response = await fetch(`${API_BASE_URL}/stop_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        this.isInitialized = false;
      }

      return response.ok;
    } catch (error) {
      console.error('Errore durante la chiusura della chat:', error);
      return false;
    }
  }

  // NUOVO METODO: Salva il Lore
  async saveLore() {
    try {
      const response = await fetch(`${API_BASE_URL}/save_lore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Se il backend si aspetta un body (anche vuoto)
        // body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.response, // Il backend dovrebbe restituire un messaggio di successo
        action: data.action // Potrebbe essere 'saved' o simile
      };
    } catch (error) {
      console.error('Errore durante il salvataggio del lore:', error);
      return {
        success: false,
        message: 'Errore durante il salvataggio del lore.',
        action: 'error'
      };
    }
  }

  async getStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/get_status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.isInitialized = data.is_active;
      
      return data;
    } catch (error) {
      console.error('Errore durante il controllo dello status:', error);
      return {
        is_initialized: false,
        is_active: false,
        status: 'error'
      };
    }
  }

  async processStream() {
    try {
      const response = await fetch(`${API_BASE_URL}/process_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Errore durante il process_stream:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
export default chatService;