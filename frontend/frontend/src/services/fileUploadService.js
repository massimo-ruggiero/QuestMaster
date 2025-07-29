const API_BASE_URL = 'http://localhost:5001'; 

export const uploadLoreFile = async (file) => {
  const formData = new FormData();
  formData.append('lore_file', file); 

  try {
    const response = await fetch(`${API_BASE_URL}/upload_lore`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Errore HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore durante l\'upload del file:', error);
    throw error; 
  }
};