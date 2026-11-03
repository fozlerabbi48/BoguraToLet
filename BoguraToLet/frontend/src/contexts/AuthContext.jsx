import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // সকেট কানেকশন ইনিশিয়ালাইজেশন
  useEffect(() => {
    if (token && user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://boguratolet-api.onrender.com';


      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('[Socket] Connected:', newSocket.id);
        newSocket.emit('setup', user.id || user._id);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
    }
  }, [token, user]);

  // ইউজার ভ্যালিডেশন
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('[AuthCheck] Failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  // লগইন ফাংশন
  const login = async (loginData, password) => {
    const res = await api.post('/auth/login', { login: loginData, password });
    const { token: newToken, user: userData } = res.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  // লগআউট ফাংশন
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket) socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, socket, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
