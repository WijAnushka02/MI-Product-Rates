import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/mi-product-rates/';

const apiClient = axios.create({
  baseURL: BASE_URL,
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
