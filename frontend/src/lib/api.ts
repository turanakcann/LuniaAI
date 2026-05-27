import axios from 'axios';
import Cookies from 'js-cookie';

// Backend adresimizi tanımlıyoruz (Artık dinamik olarak .env'den çekecek)
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
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