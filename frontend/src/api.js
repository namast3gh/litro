import axios from 'axios';

const api = axios.create({
  baseURL: 'http://87.228.102.111:8000',
});

export default api;
