import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = {
  name: '', sku: '', barcode: '', description: '',
  costPrice: '', sellingPrice: '', quantity: '', minStock: '',
  categoryId: '', supplierId: '',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    try {
      const [prods, cats, sups] = await Promise.all([
        api.getProducts(search ? `?search=${encodeURIComponent(search)}` : ''),
        api.getCategories(),
        api.getSuppliers(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setSuppliers(sups);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleSearch(e) {
    e.preventDefault();
    loadAll();
  }

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  }

  function openEditForm(product) {
    setForm({
      name: product.name,
      sku: product.sku || '',
      barcode: product.barcode || '',
      description: product.description || '',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      minStock: product.minStock,
      categoryId: product.categoryId || '',
      supplierId: product.supplierId || '',
    });
    setEditingId(product.id);
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        barcode: form.barcode || null,
        description: form.description || null,
        costPrice: Number(form.costPrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        minStock: Number(form.minStock) || 0,
        categoryId: form.categoryId || null,
        supplierId: form.supplierId || null,
      };

      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        payload.quantity = Number(form.quantity) || 0;
        await api.createProduct(payload);
      }

      setShowForm(false);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    await api.deleteProduct(id);
    loadAll();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Produtos</h1>
        <button onClick={openNewForm}>+ Novo produto</button>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Buscar por nome, SKU ou código de barras..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editingId ? 'Editar produto' : 'Novo produto'}</h2>
            {error && <div className="alert alert-error">{error}</div>}

            <label>Nome
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>

            <div className="form-row">
              <label>SKU
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </label>
              <label>Código de barras
                <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
              </label>
            </div>

            <label>Descrição
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>

            <div className="form-row">
              <label>Preço de custo
                <input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
              </label>
              <label>Preço de venda
                <input type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
              </label>
            </div>

            <div className="form-row">
              <label>
                {editingId ? 'Estoque atual (edite em Movimentações)' : 'Quantidade inicial'}
                <input
                  type="number"
                  value={form.quantity}
                  disabled={!!editingId}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </label>
              <label>Estoque mínimo (alerta)
                <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
              </label>
            </div>

            <div className="form-row">
              <label>Categoria
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Nenhuma</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label>Fornecedor
                <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                  <option value="">Nenhum</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p>Carregando...</p> : (
        <table>
          <thead>
            <tr>
              <th>Nome</th><th>SKU</th><th>Categoria</th><th>Saldo</th><th>Preço venda</th><th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={p.quantity <= p.minStock ? 'row-alert' : ''}>
                <td>{p.name}</td>
                <td>{p.sku || '-'}</td>
                <td>{p.category?.name || '-'}</td>
                <td>{p.quantity}</td>
                <td>R$ {Number(p.sellingPrice).toFixed(2)}</td>
                <td className="table-actions">
                  <button className="btn-link" onClick={() => openEditForm(p)}>Editar</button>
                  <button className="btn-link btn-danger" onClick={() => handleDelete(p.id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Nenhum produto encontrado.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}