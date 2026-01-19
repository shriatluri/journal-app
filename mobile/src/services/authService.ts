import apiClient from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthResponse {
  token: string;
  userId: string;
  message?: string;
}

export const authService = {
  async signup(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/signup', { email, password });
    const { token, userId } = response.data;

    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userId', userId);

    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, userId } = response.data;

    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userId', userId);

    return response.data;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
  },

  async getStoredAuth(): Promise<{ token: string | null; userId: string | null }> {
    const token = await AsyncStorage.getItem('authToken');
    const userId = await AsyncStorage.getItem('userId');
    return { token, userId };
  },
};
