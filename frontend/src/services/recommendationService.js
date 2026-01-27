import api from './api';

const recommendationService = {
  getRecommendations: async () => {
    const response = await api.get('/recommendations');
    return response;
  },

  searchBooks: async (query, limit = 20) => {
    const response = await api.get('/recommendations/search', {
      params: { q: query, limit }
    });
    return response;
  }
};

export default recommendationService;