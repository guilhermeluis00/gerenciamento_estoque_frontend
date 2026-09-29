import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setCategories(await api.getCategories());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createCategory({ name });
      setName('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta categoria?')) return;
    await api.deleteCategory(id);
    load();
  }

  return (
    <div>
      <h1>Categorias</h1>

      <div className="panel">
        {error && <div className="alert alert-error">{error}</div>}
        <form className="inline-form" onSubmit={handleSubmit}>
          <input placeholder="Nome da categoria" value={name} onChange={(e) => setName(e.target.value)} required />
          <button type="submit">Adicionar</button>
        </form>
      </div>

      {loading ? <p>Carregando...</p> : (
        <table>
          <thead><tr><th>Nome</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="table-actions">
                  <button className="btn-link btn-danger" onClick={() => handleDelete(c.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={2}>Nenhuma categoria cadastrada.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}