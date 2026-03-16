import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.removeItem('auth_token');
      // Navigate to login (would need navigation context)
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
};

export const postAPI = {
  getAllPosts: (page = 0, size = 20) =>
    api.get(`/posts?page=${page}&size=${size}`),
  
  getPostById: (id) =>
    api.get(`/posts/${id}`),
  
  createPost: (post, userId) =>
    api.post('/posts', post, { params: { userId } }),
  
  updatePost: (id, updatedPost, userId) =>
    api.put(`/posts/${id}`, updatedPost, { params: { userId } }),
  
  deletePost: (id, userId) =>
    api.delete(`/posts/${id}`, { params: { userId } }),
  
  getUserPosts: (userId) =>
    api.get(`/posts/user/${userId}`),
};

export const commentAPI = {
  getPostComments: (postId, page = 0, size = 20) =>
    api.get(`/comments/post/${postId}?page=${page}&size=${size}`),
  
  getAllPostComments: (postId) =>
    api.get(`/comments/post/${postId}/all`),
  
  createComment: (comment, postId, userId) =>
    api.post('/comments', comment, { params: { postId, userId } }),
  
  updateComment: (id, updatedComment, userId) =>
    api.put(`/comments/${id}`, updatedComment, { params: { userId } }),
  
  deleteComment: (id, userId) =>
    api.delete(`/comments/${id}`, { params: { userId } }),
};

export const uploadAPI = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });
    return api.post('/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteFile: (fileName) =>
    api.delete(`/uploads/${fileName}`),
};

export const userAPI = {
  getProfile: (id) =>
    api.get(`/users/${id}`),
  
  updateProfile: (id, userData) =>
    api.put(`/users/${id}`, userData),
};

export default api;
