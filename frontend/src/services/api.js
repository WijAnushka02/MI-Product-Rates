import axios from 'axios';

// When running with Vite (or a proxy), relative paths avoid any CORS or host/port conflicts
const isDev = import.meta.env.DEV;
const API_BASE = isDev ? '' : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000');

const BASE_URL = `${API_BASE}/api/mi-product-rates/`;
const AUTH_URL = `${API_BASE}/api/auth/`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const authClient = axios.create({
  baseURL: AUTH_URL,
  withCredentials: true,
});

/**
 * Fetch list of all product rates, with optional search query
 */
export const getProductRates = async (searchQuery = '') => {
  const url = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Fetch single product rate by ID
 */
export const getProductRateById = async (id) => {
  const response = await apiClient.get(`${id}/`);
  return response.data;
};

/**
 * Create a new product rate (supports multipart/form-data for attachments)
 */
export const createProductRate = async (formData) => {
  const response = await apiClient.post('', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update an existing product rate (PATCH supports partial fields & files)
 */
export const updateProductRate = async (id, formData) => {
  const response = await apiClient.patch(`${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get direct download endpoint for an attachment
 */
export const getDownloadUrl = (id) => `${BASE_URL}${id}/download/`;

/**
 * Delete a product rate by ID
 */
export const deleteProductRate = async (id) => {
  const response = await apiClient.delete(`${id}/`);
  return response.data;
};

// -------------------------------------------------------------
// AUTHENTICATION API SERVICES
// -------------------------------------------------------------

export const loginApi = async (credentials) => {
  const response = await authClient.post('login/', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await authClient.post('register/', userData);
  return response.data;
};

export const googleAuthApi = async (googleProfile) => {
  const response = await authClient.post('google/', googleProfile);
  return response.data;
};

export const getMeApi = async () => {
  const response = await authClient.get('me/');
  return response.data;
};

export const logoutApi = async () => {
  const response = await authClient.post('logout/');
  return response.data;
};
