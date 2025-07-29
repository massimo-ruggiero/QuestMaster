const API_BASE_URL = 'http://localhost:5001';

class GameService {
  async startGame() {
    try {
      const response = await fetch(`${API_BASE_URL}/start_game`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        state: data.state, 
        actions: data.actions,
        imageUrl: data.image_url,
      };
    } catch (error) {
      console.error('Errore durante l\'avvio del gioco:', error);
      return {
        success: false,
        state: 'Errore di connessione con il server di gioco all\'avvio.',
        actions: {},
        imageUrl: '',
      };
    }
  }


  async sendAction(actionId) { 
    try {
      const response = await fetch(`${API_BASE_URL}/send_action`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: actionId }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        state: data.state, 
        actions: data.actions,
        imageUrl: data.image_url,
      };
    } catch (error) {
      console.error('Errore durante l\'invio dell\'azione di gioco:', error);
      return {
        success: false,
        state: `Errore durante l'invio dell'azione: ${error.message}`,
        actions: {},
        imageUrl: '',
      };
    }
  }
}

export const gameService = new GameService();
export default gameService;