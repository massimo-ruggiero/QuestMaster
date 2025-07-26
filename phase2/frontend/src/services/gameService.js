// src/services/gameService.js
const API_BASE_URL = 'http://localhost:5001';

class GameService {
  /**
   * Avvia un nuovo gioco chiamando l'endpoint /start_game.
   * @returns {Promise<Object>} Un oggetto contenente lo stato iniziale del gioco.
   */
  async startGame() {
    try {
      const response = await fetch(`${API_BASE_URL}/start_game`, { // Endpoint cambiato a /start_game
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Body vuoto per l'avvio
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
        // gameStatus: data.game_status, // Rimosso: lo status non è più atteso dal backend
      };
    } catch (error) {
      console.error('Errore durante l\'avvio del gioco:', error);
      return {
        success: false,
        state: 'Errore di connessione con il server di gioco all\'avvio.',
        actions: {},
        imageUrl: '',
        // gameStatus: 'ERROR', // Rimosso
      };
    }
  }

  /**
   * Invia un'azione al backend chiamando l'endpoint /send_action.
   * @param {string} actionId - L'ID dell'azione scelta.
   * @returns {Promise<Object>} Un oggetto contenente il nuovo stato del gioco.
   */
  async sendAction(actionId) { 
    try {
      const response = await fetch(`${API_BASE_URL}/send_action`, { // Endpoint cambiato a /send_action
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: actionId }), // Il backend si aspetta 'id'
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
        // gameStatus: data.game_status, // Rimosso
      };
    } catch (error) {
      console.error('Errore durante l\'invio dell\'azione di gioco:', error);
      return {
        success: false,
        state: `Errore durante l'invio dell'azione: ${error.message}`,
        actions: {},
        imageUrl: '',
        // gameStatus: 'ERROR', // Rimosso
      };
    }
  }
}

export const gameService = new GameService();
export default gameService;