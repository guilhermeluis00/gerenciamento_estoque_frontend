import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Register() {
  const [accountName, setAccountName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(accountName, name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Criar conta</h1>
        <p className="auth-subtitle">14 dias grátis para testar o sistema.</p>
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Nome da empresa/loja
          <input value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
        </label>

        <label>
          Seu nome
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Senha (mín. 6 caracteres)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar conta'}
        </button>

        <p className="auth-switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}