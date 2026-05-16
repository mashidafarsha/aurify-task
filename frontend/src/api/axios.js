import axios from 'axios';

const baseURL = import.meta.env.VITE_APP_API_URL 
  ? `${import.meta.env.VITE_APP_API_URL}/api` 
  : 'http://localhost:5001/api';

const API = axios.create({
  baseURL,
});

export default API;
