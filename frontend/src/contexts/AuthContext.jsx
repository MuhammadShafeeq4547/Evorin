import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = `${API_URL}/api`;
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Set up axios interceptors for token handling
  useEffect(() => {
    // Attach access token from localStorage (if present)
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to attempt refresh when 401 occurs
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshResp = await axios.post('/auth/refresh');
            if (refreshResp.data && refreshResp.data.accessToken) {
              localStorage.setItem('accessToken', refreshResp.data.accessToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${refreshResp.data.accessToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${refreshResp.data.accessToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Try to get current user. If unauthorized, attempt refresh and retry.
      try {
        const response = await axios.get('/auth/me');
        if (response.data && response.data.success) {
          setUser(response.data.user);
          return;
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          // Attempt to refresh token
          try {
            const refreshResp = await axios.post('/auth/refresh');
            if (refreshResp.data && refreshResp.data.accessToken) {
              localStorage.setItem('accessToken', refreshResp.data.accessToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${refreshResp.data.accessToken}`;
              const retry = await axios.get('/auth/me');
              if (retry.data && retry.data.success) {
                setUser(retry.data.user);
                return;
              }
            }
          } catch (refreshError) {
            console.warn('Refresh failed during auth check:', refreshError.message || refreshError);
            localStorage.removeItem('accessToken');
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.data.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const verifyTwoFactor = async (code) => {
    try {
      if (!twoFactorUserId) {
        throw new Error('No 2FA session in progress');
      }

      const response = await axios.post('/auth/2fa/verify', {
        userId: twoFactorUserId,
        code
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        setUser(response.data.user);
        setRequiresTwoFactor(false);
        setTwoFactorUserId(null);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: 'Invalid verification code' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Verification failed' 
      };
    }
  };

  const setupTwoFactor = async () => {
    try {
      const response = await axios.post('/auth/2fa/enable');
      return {
        success: true,
        qrCode: response.data.qrCode,
        secret: response.data.secret,
        backupCodes: response.data.backupCodes
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to set up 2FA'
      };
    }
  };

  const disableTwoFactor = async (code) => {
    try {
      await axios.post('/auth/2fa/disable', { code });
      const updatedUser = { ...user, twoFactorEnabled: false };
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to disable 2FA'
      };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await axios.post('/auth/resend-verification');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend verification email'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      if (response.data.success) {
        return { 
          success: true, 
          message: 'Registration successful! Please check your email to verify your account.' 
        };
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      // Ignore
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading,
      updateUser,
      isAuthenticated: !!user,
      requiresTwoFactor,
      verifyTwoFactor,
      setupTwoFactor,
      disableTwoFactor,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};