import api from './api';

const tagService = {
  // Get all tags
  getTags: async () => {
    const response = await api.get('/tags');
    return response;
  },

  // Get single tag
  getTag: async (id) => {
    const response = await api.get(`/tags/${id}`);
    return response;
  },

  // Create tag
  createTag: async (tagData) => {
    const response = await api.post('/tags', tagData);
    return response;
  },

  // Create multiple tags
  createBulkTags: async (tags) => {
    const response = await api.post('/tags/bulk', { tags });
    return response;
  },

  // Update tag
  updateTag: async (id, tagData) => {
    const response = await api.put(`/tags/${id}`, tagData);
    return response;
  },

  // Delete tag
  deleteTag: async (id) => {
    const response = await api.delete(`/tags/${id}`);
    return response;
  },
};

export default tagService;