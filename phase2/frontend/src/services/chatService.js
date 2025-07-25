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
      // Prima fermiamo la chat corrente
      await this.stopChat();
      
      // Poi la riavviamo
      return await this.startChat();
    } catch (error) {
      console.error('Errore durante il restart della chat:', error);
      return {
        success: false,
        message: 'Errore durante il restart della chat.',
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

  // Nuovo metodo per il process_stream
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

// Esporta un'istanza singleton
export const chatService = new ChatService();
export default chatService;