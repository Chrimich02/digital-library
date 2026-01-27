import api from './api';

const progressService = {
  // Update reading progress
  updateProgress: async (bookId, progressData) => {
    const response = await api.put(`/progress/${bookId}`, progressData);
    return response;
  },

  // Get progress for a book
  getProgress: async (bookId) => {
    const response = await api.get(`/progress/${bookId}`);
    return response;
  },

  // Get all user progress
  getAllProgress: async (params = {}) => {
    const response = await api.get('/progress', { params });
    return response;
  },

  // Mark book as completed
  markAsCompleted: async (bookId) => {
    const response = await api.put(`/progress/${bookId}/complete`);
    return response;
  },

  // Reset progress
  resetProgress: async (bookId) => {
    const response = await api.delete(`/progress/${bookId}`);
    return response;
  }
};

export default progressService;