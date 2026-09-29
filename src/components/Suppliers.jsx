import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { name: '', email: '', phone: '', document: '' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setSuppliers(await api.getSuppliers());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createSupplier(form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este fornecedor?')) return;
    await api.deleteSupplier(id);
    load();
  }

  return (
    <div>
      <h1>Fornecedores</h1>

      <div className="panel">
        {error && <div className="alert alert-error">{error}</div>}
        <form className="inline-form" onSubmit={handleSubmit}>
          <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="CNPJ/CPF" value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} />
          <button type="submit">Adicionar</button>
        </form>
      </div>

      {loading ? <p>Carregando...</p> : (
        <table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th></th></tr></thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email || '-'}</td>
                <td>{s.phone || '-'}</td>
                <td className="table-actions">
                  <button className="btn-link btn-danger" onClick={() => handleDelete(s.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && <tr><td colSpan={4}>Nenhum fornecedor cadastrado.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}