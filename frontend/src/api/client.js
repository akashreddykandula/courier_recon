import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

export const client = axios.create({
  baseURL: apiBaseUrl
});
