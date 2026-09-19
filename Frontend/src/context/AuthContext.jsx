import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medconnect_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync current user on load
  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('medconnect_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session expired or invalid token');
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, email: identifier, phone: identifier, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('medconnect_token', receivedToken);
    localStorage.setItem('medconnect_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('medconnect_token', receivedToken);
    localStorage.setItem('medconnect_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const resetPassword = async (identifier, newPassword) => {
    const res = await api.post('/auth/forgot-password', { identifier, email: identifier, phone: identifier, newPassword });
    const { token: receivedToken, user: receivedUser } = res.data;
    if (receivedToken && receivedUser) {
      localStorage.setItem('medconnect_token', receivedToken);
      localStorage.setItem('medconnect_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
    }
    return res.data;
  };

  // Phone OTP Flow Methods
  const sendPhoneOtp = async (phone) => {
    const res = await api.post('/auth/phone/send-otp', { phone });
    return res.data;
  };

  const verifyPhoneOtp = async (phone, otp) => {
    const res = await api.post('/auth/phone/verify-otp', { phone, otp });
    return res.data;
  };

  const setPasswordAndLoginWithPhone = async ({ phone, newPassword, name, role }) => {
    const res = await api.post('/auth/phone/set-password-login', { phone, newPassword, name, role });
    const { token: receivedToken, user: receivedUser } = res.data;
    if (receivedToken && receivedUser) {
      localStorage.setItem('medconnect_token', receivedToken);
      localStorage.setItem('medconnect_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
    }
    return res.data;
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('medconnect_token');
    localStorage.removeItem('medconnect_user');
    setToken(null);
    setUser(null);
  };

  const demoLogin = async (role) => {
    let email = 'rahul@gmail.com';
    let password = 'password123';

    if (role === 'doctor') {
      email = 'dr.rajesh@medconnect.com';
      password = 'doctor123';
    } else if (role === 'admin') {
      email = 'admin@medconnect.com';
      password = 'admin123';
    }

    return await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        resetPassword,
        sendPhoneOtp,
        verifyPhoneOtp,
        setPasswordAndLoginWithPhone,
        logout,
        demoLogin,
        isAuthenticated: !!user,
        isPatient: user?.role === 'patient',
        isDoctor: user?.role === 'doctor',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
