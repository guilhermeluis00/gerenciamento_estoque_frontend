import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Package } from 'lucide-react';
import { useAuth } from './AuthContext';
import { LIMITS } from '../limits';
import Field from './ui/Field';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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
        <div className="auth-logo"><Package size={24} /></div>
        <div>
          <h1>Entrar</h1>
          <p className="auth-subtitle">Acesse o painel de estoque da sua empresa.</p>
        </div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <Field
          label="E-mail" type="email" autoComplete="email" value={email} maxLength={LIMITS.EMAIL}
          onChange={(e) => setEmail(e.target.value)} required autoFocus
        />

        <div className="password-field">
          <Field
            label="Senha" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
            maxLength={LIMITS.PASSWORD_MAX} onChange={(e) => setPassword(e.target.value)} required
          />
          <button
            type="button" className="icon-btn password-toggle" onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="auth-switch">
          Não tem conta? <Link to="/registro">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
