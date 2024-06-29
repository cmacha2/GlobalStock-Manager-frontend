import axios from 'axios';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3010/';

console.log('Using backend URL:', BACKEND_URL);

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: BACKEND_URL, // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get user credentials
export const getCredentials = async (userId) => {
  try {
    const response = await api.get(`api/credentials/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting credentials:', error.message);
    throw new Error('Error getting credentials');
  }
};

// Save user credentials
export const saveCredentials = async (userId, credentials) => {
  try {
    const response = await api.post('api/save-credentials', { userId, ...credentials });
    return response.data;
  } catch (error) {
    console.error('Error saving credentials:', error.message);
    throw new Error('Error saving credentials');
  }
};

// Get items
export const getItems = async (userId, limit = 100, offset = 0) => {
  try {
    const response = await api.get(`/api/items/${userId}?limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Error getting items:', error.message);
    throw new Error('Error getting items');
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await api.post('api/create-product', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.message);
    throw new Error('Error creating product');
  }
};

// Get the next SKU
export const getNextSku = async (userId, category) => {
  try {
    const response = await api.get(`api/next-sku/${userId}/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error getting next SKU:', error.message);
    throw new Error('Error getting next SKU');
  }
};

export default api;
