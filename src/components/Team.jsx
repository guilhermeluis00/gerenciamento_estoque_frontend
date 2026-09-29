import { useEffect, useState } from 'react';
import { api } from '../api';
import { OPCOES_ROLE } from '../roles';

const emptyForm = { name: '', email: '', password: '', role: 'OPERATOR' };

export default function Team() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setUsers(await api.getUsers());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createUser(form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(user) {
    await api.updateUser(user.id, { active: !user.active });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Remover este usuário da equipe?')) return;
    try {
      await api.deleteUser(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h1>Equipe</h1>

      <div className="panel">
        <h2>Adicionar membro</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form className="inline-form" onSubmit={handleSubmit}>
          <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Senha temporária" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {OPCOES_ROLE.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button type="submit">Adicionar</button>
        </form>
      </div>

      {loading ? <p>Carregando...</p> : (
        <table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role === 'ADMIN' ? 'Administrador' : 'Operador'}</td>
                <td>
                  <button className="btn-link" onClick={() => toggleActive(u)}>
                    {u.active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="table-actions">
                  <button className="btn-link btn-danger" onClick={() => handleDelete(u.id)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}