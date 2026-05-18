import axios from 'axios';
import Cookies from 'js-cookie';

// Backend adresimizi tanımlıyoruz
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: İstek backend'e gitmeden HEMEN ÖNCE araya girer
api.interceptors.request.use(
  (config) => {
    // Çerezlerden token'ı al
    const token = Cookies.get('token');
    
    // Eğer token varsa ve config.headers tanımlıysa, yetki kartını (Bearer) ekle
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;