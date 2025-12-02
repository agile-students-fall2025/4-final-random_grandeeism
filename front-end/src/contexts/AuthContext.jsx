/**
 * AuthContext.jsx
 * 
 * Description: Authentication context for managing user state and JWT tokens
 * Purpose: Provides global authentication state and functions (login, logout, register)
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, setAuthToken, clearAuthToken, getAuthToken } from '../services/api.js';

export const AuthContext = createContext(null); // Ensure this is exported

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.verify(storedToken);
          if (response.success) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, clear storage
            clearAuthToken();
            localStorage.removeItem('authUser');
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          clearAuthToken();
          localStorage.removeItem('authUser');
        }
      }
      setLoading(false); // Ensure loading is set to false
    };

    initAuth();
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        setAuthToken(token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
        return { success: true };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        setUser(user);
        setToken(token);
        setAuthToken(token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
        return { success: true };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout(token);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      clearAuthToken();
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      if (!token) return;
      const response = await authAPI.refresh(token);
      if (response.success && response.data) {
        const newToken = response.data.token;
        setToken(newToken);
        setAuthToken(newToken);
        localStorage.setItem('authToken', newToken);
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; // Ensure default export is provided
