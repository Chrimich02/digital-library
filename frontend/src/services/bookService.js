import api from './api';

const bookService = {
  // Get all books
  getBooks: async (params = {}) => {
    const response = await api.get('/books', { params });
    return response;
  },

  // Get single book
  getBook: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response;
  },

  // Upload book
  uploadBook: async (formData) => {
    const response = await api.post('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Update book
  updateBook: async (id, bookData) => {
    const response = await api.put(`/books/${id}`, bookData);
    return response;
  },

  // Delete book
  deleteBook: async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response;
  },

  // Upload book cover
  uploadCover: async (id, formData) => {
    const response = await api.put(`/books/${id}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Download book
  downloadBook: async (id) => {
    const response = await api.get(`/books/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  // View book (for reading in browser)
  viewBook: async (id) => {
    const response = await api.get(`/books/${id}/view`, {
      responseType: 'blob',
    });
    return response;
  },

  // Get library stats
  getStats: async () => {
    const response = await api.get('/search/stats');
    return response;
  },
};

export default bookService;