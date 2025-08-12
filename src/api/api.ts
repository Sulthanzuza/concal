import axios from 'axios';

const API_BASE_URL = 'https://concal-q66g.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;