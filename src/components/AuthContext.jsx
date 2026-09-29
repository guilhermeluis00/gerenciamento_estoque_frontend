import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedAccount = localStorage.getItem('account');
    if (savedUser && savedAccount) {
      setUser(JSON.parse(savedUser));
      setAccount(JSON.parse(savedAccount));
    }
    setLoading(false);
  }, []);

  function persistSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('account', JSON.stringify(data.account));
    setUser(data.user);
    setAccount(data.account);
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    persistSession(data);
    return data;
  }

  async function register(accountName, name, email, password) {
    const data = await api.register({ accountName, name, email, password });
    persistSession(data);
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('account');
    setUser(null);
    setAccount(null);
  }

  return (
    <AuthContext.Provider value={{ user, account, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  return ctx;
}