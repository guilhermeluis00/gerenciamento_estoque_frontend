import { createContext, useContext, useState } from 'react';
import { api, clearSession } from '../api';

const AuthContext = createContext(null);

// Lê a sessão salva de forma síncrona (evita um frame "deslogado") e tolera JSON corrompido.
function readSession() {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const account = JSON.parse(localStorage.getItem('account'));
    if (token && user && account) return { user, account };
  } catch {
    clearSession();
  }
  return { user: null, account: null };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  function persistSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('account', JSON.stringify(data.account));
    setSession({ user: data.user, account: data.account });
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
    clearSession();
    setSession({ user: null, account: null });
  }

  return (
    <AuthContext.Provider value={{ user: session.user, account: session.account, loading: false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  return ctx;
}
