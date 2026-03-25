import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (identifier, password, captchaId, captchaCode) =>
    api.post('/auth/login', {
      username: identifier,
      password,
      captchaId,
      captchaCode,
    }),

  loginWithSms: (phone, code) =>
    api.post('/auth/login/sms', { phone, code }),

  sendLoginSmsCode: (phone) =>
    api.post('/auth/sms/send', { phone }),

  requestCaptcha: () =>
    api.get('/auth/captcha'),

  forgotPassword: (email) =>
    api.post('/auth/password/forgot', { email }),

  resetPassword: (email, code, newPassword) =>
    api.post('/auth/password/reset', { email, code, newPassword }),

  register: (username, email, password, phone) =>
    api.post('/auth/register', { username, email, password, phone }),
};

export const postAPI = {
  getAllPosts: (page = 0, size = 20) =>
    api.get('/posts', { params: { page, size } }),

  searchPosts: (keyword, page = 0, size = 20) =>
    api.get('/posts/search', { params: { keyword, page, size } }),

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

  createComment: (comment, postId, userId, parentId = null) => {
    const params = {
      postId: Number(postId),
      userId: Number(userId),
    };
    if (parentId !== null && parentId !== undefined) {
      params.parentId = Number(parentId);
    }

    return api.post('/comments', comment, {
      params,
      timeout: 30000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
  },

  updateComment: (id, updatedComment, userId) =>
    api.put(`/comments/${id}`, updatedComment, { params: { userId } }),

  deleteComment: (id, userId) =>
    api.delete(`/comments/${id}`, { params: { userId } }),

  getCommentReplies: (commentId) =>
    api.get(`/comments/${commentId}/replies`),
};

export const uploadAPI = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 45000,
    });
  },

  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 45000,
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

export const likeAPI = {
  likePost: (postId) =>
    api.post(`/posts/${postId}/like`),

  likeComment: (commentId) =>
    api.post(`/comments/${commentId}/like`),
};

export const locationAPI = {
  search: (keyword) =>
    api.get('/locations/search', { params: { keyword } }),
};

export default api;
