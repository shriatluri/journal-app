import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // MVP: Bypass authentication - always authenticated
  const [state, setState] = useState<AuthState>({
    token: 'mvp-bypass-token',
    userId: 'mvp-user',
    isLoading: false,
    isAuthenticated: true,
  });

  const login = async (_email: string, _password: string) => {
    setState({
      token: 'mvp-bypass-token',
      userId: 'mvp-user',
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const signup = async (_email: string, _password: string) => {
    setState({
      token: 'mvp-bypass-token',
      userId: 'mvp-user',
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    // MVP: Just reload to "login" again
    setState({
      token: null,
      userId: null,
      isLoading: false,
      isAuthenticated: false,
    });
    // Re-authenticate immediately for MVP
    setTimeout(() => {
      setState({
        token: 'mvp-bypass-token',
        userId: 'mvp-user',
        isLoading: false,
        isAuthenticated: true,
      });
    }, 100);
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
