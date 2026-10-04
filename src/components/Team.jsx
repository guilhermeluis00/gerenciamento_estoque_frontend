import { useCallback, useEffect, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { api } from '../api';
import { OPCOES_ROLE, ROLES } from '../roles';
import { LIMITS } from '../limits';
import { useAuth } from './AuthContext';
import Field from './ui/Field';
import { useFeedback } from './ui/Feedback';
import { SkeletonList } from './ui/States';

const emptyForm = { name: '', email: '', password: '', role: 'OPERATOR' };

export default function Team() {
  const { user: currentUser } = useAuth();
  const { toast, confirm } = useFeedback();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() =>
    api.getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false)), []);

  useEffect(() => { load(); }, [load]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.createUser(form);
      toast(`${form.name.trim()} foi adicionado(a) à equipe`);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user) {
    try {
      await api.updateUser(user.id, { active: !user.active });
      toast(user.active ? `${user.name} foi desativado(a)` : `${user.name} foi reativado(a)`);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleDelete(user) {
    const ok = await confirm({
      title: `Remover ${user.name} da equipe?`,
      message: 'O acesso é revogado imediatamente. As movimentações registradas por essa pessoa continuam no histórico.',
      confirmLabel: 'Remover',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.deleteUser(user.id);
      toast('Membro removido');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Equipe</h1>
      </div>

      <div className="panel">
        <h2>Adicionar membro</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="stack-form">
          <div className="form-row">
            <Field label="Nome" max={LIMITS.USER_NAME} value={form.name} onChange={update('name')} required />
            <Field label="E-mail" type="email" max={LIMITS.EMAIL} autoComplete="off" value={form.email} onChange={update('email')} required />
          </div>
          <div className="form-row">
            <Field
              label="Senha temporária" type="password" autoComplete="new-password" value={form.password} onChange={update('password')}
              required minLength={LIMITS.PASSWORD_MIN} max={LIMITS.PASSWORD_MAX}
              hint={`Entre ${LIMITS.PASSWORD_MIN} e ${LIMITS.PASSWORD_MAX} caracteres`}
            />
            <Field as="select" label="Papel" value={form.role} onChange={update('role')}
              hint={form.role === 'ADMIN' ? 'Acesso total, inclusive à equipe' : 'Gerencia estoque e cadastros'}>
              {OPCOES_ROLE.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Field>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={saving}><UserPlus size={16} /> {saving ? 'Adicionando...' : 'Adicionar'}</button>
          </div>
        </form>
      </div>

      {loading ? <SkeletonList rows={3} /> : (
        <table className="responsive-table">
          <thead><tr><th>Membro</th><th>Papel</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <tr key={u.id} className={u.active ? '' : 'row-inactive'}>
                  <td data-label="Membro" className="cell-title">
                    <div className="member">
                      <span className="user-avatar">{u.name.charAt(0).toUpperCase()}</span>
                      <div className="cell-stack">
                        <span>{u.name}{isSelf && <span className="badge badge-muted">Você</span>}</span>
                        <small className="cell-sub">{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="Papel">{ROLES[u.role] || u.role}</td>
                  <td data-label="Status">
                    <span className={`badge ${u.active ? 'badge-active' : 'badge-canceled'}`}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="table-actions">
                    {!isSelf && (
                      <>
                        <button className="btn-link" onClick={() => toggleActive(u)}>
                          {u.active ? 'Desativar' : 'Reativar'}
                        </button>
                        <button className="btn-link btn-danger" onClick={() => handleDelete(u)}><Trash2 size={14} /> Remover</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
