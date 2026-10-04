import { useCallback, useEffect, useState } from 'react';
import { Check, Pencil, Tags, Trash2, X } from 'lucide-react';
import { api } from '../api';
import { LIMITS } from '../limits';
import Field from './ui/Field';
import { useFeedback } from './ui/Feedback';
import { EmptyState, SkeletonList } from './ui/States';

export default function Categories() {
  const { toast, confirm } = useFeedback();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // { id, name }

  const load = useCallback(() =>
    api.getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false)), []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.createCategory({ name: name.trim() });
      toast('Categoria criada');
      setName('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    try {
      await api.updateCategory(editing.id, { name: editing.name.trim() });
      toast('Categoria renomeada');
      setEditing(null);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleDelete(category) {
    const count = category._count?.products || 0;
    const ok = await confirm({
      title: `Excluir a categoria "${category.name}"?`,
      message: count > 0 ? `${count} produto(s) ficarão sem categoria.` : undefined,
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.deleteCategory(category.id);
      toast('Categoria excluída');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Categorias</h1>
      </div>

      <div className="panel">
        <h2>Nova categoria</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form className="inline-form" onSubmit={handleSubmit}>
          <Field
            label="Nome" max={LIMITS.CATEGORY_NAME} value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Bebidas" required className="grow"
          />
          <button type="submit" disabled={saving}>Adicionar</button>
        </form>
      </div>

      {loading ? <SkeletonList rows={3} /> : categories.length === 0 ? (
        <EmptyState icon={Tags} title="Nenhuma categoria" text="Categorias ajudam a organizar e filtrar seus produtos." />
      ) : (
        <table className="responsive-table">
          <thead><tr><th>Nome</th><th className="num">Produtos</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td data-label="Nome" className="cell-title">
                  {editing?.id === c.id ? (
                    <form className="inline-edit" onSubmit={saveEdit}>
                      <input
                        value={editing.name} maxLength={LIMITS.CATEGORY_NAME} required autoFocus
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}
                        aria-label="Novo nome"
                      />
                      <button type="submit" className="icon-btn" aria-label="Salvar"><Check size={18} /></button>
                      <button type="button" className="icon-btn" onClick={() => setEditing(null)} aria-label="Cancelar"><X size={18} /></button>
                    </form>
                  ) : c.name}
                </td>
                <td data-label="Produtos" className="num">{c._count?.products ?? 0}</td>
                <td className="table-actions">
                  {editing?.id !== c.id && (
                    <>
                      <button className="btn-link" onClick={() => setEditing({ id: c.id, name: c.name })}><Pencil size={14} /> Renomear</button>
                      <button className="btn-link btn-danger" onClick={() => handleDelete(c)}><Trash2 size={14} /> Excluir</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
