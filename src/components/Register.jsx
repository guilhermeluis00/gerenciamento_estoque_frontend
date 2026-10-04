import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Package } from 'lucide-react';
import { useAuth } from './AuthContext';
import { LIMITS } from '../limits';
import Field from './ui/Field';

export default function Register() {
  const [form, setForm] = useState({ accountName: '', name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.accountName.trim(), form.name.trim(), form.email, form.password);
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
          <h1>Criar conta</h1>
          <p className="auth-subtitle">Cadastre sua empresa e comece a controlar o estoque.</p>
        </div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <Field
          label="Nome da empresa/loja" autoComplete="organization" max={LIMITS.ACCOUNT_NAME}
          value={form.accountName} onChange={update('accountName')} required autoFocus
        />
        <Field label="Seu nome" autoComplete="name" max={LIMITS.USER_NAME} value={form.name} onChange={update('name')} required />
        <Field label="E-mail" type="email" autoComplete="email" maxLength={LIMITS.EMAIL} value={form.email} onChange={update('email')} required />

        <div className="password-field">
          <Field
            label="Senha" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password}
            onChange={update('password')} required minLength={LIMITS.PASSWORD_MIN} maxLength={LIMITS.PASSWORD_MAX}
            hint={`Entre ${LIMITS.PASSWORD_MIN} e ${LIMITS.PASSWORD_MAX} caracteres`}
          />
          <button
            type="button" className="icon-btn password-toggle" onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

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
