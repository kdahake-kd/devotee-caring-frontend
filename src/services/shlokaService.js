import axios from 'axios';

// Create a separate axios instance for shloka API (might be on different port or not require auth)
const shlokaApi = axios.create({
  baseURL: 'http://localhost:8001', // Update this to match your API server (0.0.0.0:8001 should be localhost:8001)
  headers: {
    'Content-Type': 'application/json',
  },
});

export const shlokaService = {
  searchShloka: async (chapter, verse) => {
    try {
      // Log request for debugging
      console.log('Searching shloka:', { chapter, verse });
      
      const response = await shlokaApi.post('/api/scrape/vedabase/verse', {
        chapter: parseInt(chapter),
        verse: verse.toString()
      });
      
      console.log('Raw API response:', response);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Shloka service error:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      // Re-throw to let component handle it
      throw error;
    }
  },
};

