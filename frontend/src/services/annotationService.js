import api from './api';

const annotationService = {
  // Create annotation
  createAnnotation: async (annotationData) => {
    const response = await api.post('/annotations', annotationData);
    return response;
  },

  // Get all annotations for a book
  getBookAnnotations: async (bookId, type = null) => {
    const params = type ? { type } : {};
    const response = await api.get(`/annotations/book/${bookId}`, { params });
    return response;
  },

  // Get all user annotations
  getAllAnnotations: async (params = {}) => {
    const response = await api.get('/annotations', { params });
    return response;
  },

  // Get single annotation
  getAnnotation: async (id) => {
    const response = await api.get(`/annotations/${id}`);
    return response;
  },

  // Update annotation
  updateAnnotation: async (id, data) => {
    const response = await api.put(`/annotations/${id}`, data);
    return response;
  },

  // Delete annotation
  deleteAnnotation: async (id) => {
    const response = await api.delete(`/annotations/${id}`);
    return response;
  },

  // Delete all book annotations
  deleteBookAnnotations: async (bookId, type = null) => {
    const params = type ? { type } : {};
    const response = await api.delete(`/annotations/book/${bookId}`, { params });
    return response;
  }
};

export default annotationService;