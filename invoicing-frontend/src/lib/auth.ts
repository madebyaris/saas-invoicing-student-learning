import apiClient from './api';

export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/api/auth/login', { email, password });
    
    // API returns { data: { token, user }, success: true }
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    
    // TODO: Store user if needed
    return { user, token };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  // Use window.location for now - router navigation will be handled by the component
  window.location.href = '/login';
};

export const getToken = () => localStorage.getItem('token');

export const isAuthenticated = () => !!getToken();

export const useAuth = () => ({
  isAuthenticated,
  login,
  logout,
  token: getToken(),
});
