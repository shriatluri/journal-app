import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    userId: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { token, userId } = await authService.getStoredAuth();
      setState({
        token,
        userId,
        isLoading: false,
        isAuthenticated: !!token,
      });
    } catch {
      setState({
        token: null,
        userId: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    const { token, userId } = await authService.login(email, password);
    setState({
      token,
      userId,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const signup = async (email: string, password: string) => {
    const { token, userId } = await authService.signup(email, password);
    setState({
      token,
      userId,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    await authService.logout();
    setState({
      token: null,
      userId: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
