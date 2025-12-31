import api from './api';

const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  if (response.data.access_token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.access_token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user') || 'null');
};

const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getProfile,
};

export default authService;
