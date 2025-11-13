// src/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

// Token migration: move from 'eduhub_token' to 'learnhub_token' if needed
(() => {
  try {
    const newKey = 'learnhub_token';
    const oldKey = 'eduhub_token';
    const hasNew = localStorage.getItem(newKey);
    const oldVal = localStorage.getItem(oldKey);
    if (!hasNew && oldVal) {
      localStorage.setItem(newKey, oldVal);
      // keep old key for now to avoid surprises; can be removed later
    }
  } catch {}
})();

// Attach token automatically
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('learnhub_token') || localStorage.getItem('eduhub_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// add this to src/api.js (alongside the other exports)
export const forgotPassword = (data) => api.post('/auth/forgot', data);


// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const me = () => api.get('/users/me');
export const myEnrollments = () => api.get('/users/me/enrollments');
export const updateProfile = (data) => api.patch('/users/me', data);
export const uploadAvatar = (formData) => api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' }});

// Courses
export const listCourses = (params) => api.get('/courses', { params });
export const getCourse = (idOrSlug) => api.get(`/courses/${idOrSlug}`);
export const createCourse = (formData) =>
  api.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
export const enroll = (courseId) => api.post('/courses/enroll', { courseId });
// Progress / streak
export const recordStudy = (courseId) => api.post('/progress/ping', { courseId });
export const getStreak = () => api.get('/progress/streak');
export const getCalendar = (params) => api.get('/progress/calendar', { params });

// Notes
export const createNote = (formData) =>
  api.post('/notes', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
export const listNotes = (courseId) => api.get(`/notes/course/${courseId}`);
export const updateNoteApi = (id, dataOrFormData, isForm=false) => isForm
  ? api.patch(`/notes/${id}`, dataOrFormData, { headers: { 'Content-Type': 'multipart/form-data' }})
  : api.patch(`/notes/${id}`, dataOrFormData);
export const deleteNoteApi = (id) => api.delete(`/notes/${id}`);
export const togglePinApi = (id) => api.patch(`/notes/${id}/pin`);

// Admin
export const adminStats = () => api.get('/admin/stats');

// Ping (non /api route)
export const ping = () => axios.get((process.env.REACT_APP_API_PING || 'http://localhost:4000') + '/api/ping');

export default api;
