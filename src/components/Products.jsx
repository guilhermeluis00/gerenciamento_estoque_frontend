import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, RotateCcw, Package, X, Archive, History } from 'lucide-react';
import { api } from '../api';
import { formatCurrency, formatPercent } from '../format';
import { LIMITS, onlyDigits, skuChars } from '../limits';
import Modal from './Modal';
import Field from './ui/Field';
import { useFeedback } from './ui/Feedback';
import { EmptyState, SkeletonList } from './ui/States';

const emptyForm = {
  name: '', sku: '', barcode: '', description: '',
  costPrice: '', sellingPrice: '', quantity: '', minStock: '',
  categoryId: '', supplierId: '', active: true,
};

// Busca sem acento e sem diferenciar maiúsculas
const normalize = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Products() {
  const { toast, confirm } = useFeedback();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(() =>
    api.getProducts()
      .then(setProducts)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false)), []);

  useEffect(() => {
    loadProducts();
    Promise.all([api.getCategories(), api.getSuppliers()])
      .then(([cats, sups]) => { setCategories(cats); setSuppliers(sups); })
      .catch((err) => setLoadError(err.message));
  }, [loadProducts]);

  // Filtros aplicados no navegador: a lista inteira já está carregada, então é instantâneo
  const visible = useMemo(() => {
    const term = normalize(search.trim());
    return products.filter((p) => {
      if (!showInactive && !p.active) return false;
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (onlyLow && !(p.active && p.quantity <= p.minStock)) return false;
      if (term && ![p.name, p.sku, p.barcode].some((v) => normalize(v).includes(term))) return false;
      return true;
    });
  }, [products, search, categoryFilter, onlyLow, showInactive]);

  const inactiveCount = products.filter((p) => !p.active).length;
  const lowCount = products.filter((p) => p.active && p.quantity <= p.minStock).length;
  const hasFilters = search || categoryFilter || onlyLow;

  function clearFilters() {
    setSearch('');
    setCategoryFilter('');
    setOnlyLow(false);
  }

  const update = (field, transform) => (e) => {
    const raw = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const value = transform ? transform(raw) : raw;
    setForm((f) => ({ ...f, [field]: value }));
  };

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(product) {
    setForm({
      name: product.name,
      sku: product.sku || '',
      barcode: product.barcode || '',
      description: product.description || '',
      costPrice: Number(product.costPrice) || '',
      sellingPrice: Number(product.sellingPrice) || '',
      quantity: product.quantity,
      minStock: product.minStock,
      categoryId: product.categoryId || '',
      supplierId: product.supplierId || '',
      active: product.active,
    });
    setEditingId(product.id);
    setFormError('');
    setShowForm(true);
  }

  // Margem sobre o preço de venda, para ajudar a precificar
  const cost = Number(form.costPrice) || 0;
  const price = Number(form.sellingPrice) || 0;
  const margin = price > 0 ? (price - cost) / price : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (form.barcode && ![8, 12, 13, 14].includes(form.barcode.length)) {
      setFormError('Código de barras deve ter 8, 12, 13 ou 14 dígitos');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        description: form.description.trim() || null,
        costPrice: cost,
        sellingPrice: price,
        minStock: Number(form.minStock) || 0,
        categoryId: form.categoryId || null,
        supplierId: form.supplierId || null,
      };

      if (editingId) {
        payload.active = form.active;
        await api.updateProduct(editingId, payload);
        toast('Produto atualizado');
      } else {
        payload.quantity = Number(form.quantity) || 0;
        await api.createProduct(payload);
        toast('Produto cadastrado');
      }

      setShowForm(false);
      loadProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  /** Exclui de vez um produto sem histórico. */
  async function handleDelete(product) {
    const ok = await confirm({
      title: `Excluir "${product.name}"?`,
      message: 'O produto será apagado definitivamente. Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    try {
      const result = await api.deleteProduct(product.id);
      // Se alguém registrou uma movimentação nesse meio-tempo, o backend desativa em vez de apagar
      toast(result.archived ? 'O produto recebeu movimentações e foi desativado em vez de excluído' : 'Produto excluído', result.archived ? 'info' : 'success');
      loadProducts();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  /** Desativa um produto com histórico (o DELETE do backend arquiva nesse caso). */
  async function handleDeactivate(product) {
    const ok = await confirm({
      title: `Desativar "${product.name}"?`,
      message: 'Ele deixa de aparecer nas listas, alertas e movimentações, mas o histórico é mantido. Você pode reativá-lo quando quiser.',
      confirmLabel: 'Desativar',
    });
    if (!ok) return;
    try {
      await api.updateProduct(product.id, { active: false });
      toast('Produto desativado');
      loadProducts();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function handleReactivate(product) {
    try {
      await api.updateProduct(product.id, { active: true });
      toast('Produto reativado');
      loadProducts();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Produtos</h1>
          {!loading && <p className="page-subtitle">{products.length - inactiveCount} ativos{inactiveCount > 0 && ` · ${inactiveCount} inativos`}</p>}
        </div>
        <button onClick={openNewForm}><Plus size={16} /> Novo produto</button>
      </div>

      {loadError && <div className="alert alert-error">{loadError}</div>}

      <div className="toolbar">
        <div className="search-input">
          <Search size={16} />
          <input
            type="search"
            placeholder="Buscar por nome, SKU ou código de barras"
            value={search}
            maxLength={100}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar produtos"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filtrar por categoria">
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="chips">
        <button type="button" className={`chip ${onlyLow ? 'chip-active chip-danger' : ''}`} onClick={() => setOnlyLow((v) => !v)} aria-pressed={onlyLow}>
          Estoque baixo{lowCount > 0 && <span className="chip-count">{lowCount}</span>}
        </button>
        {inactiveCount > 0 && (
          <button type="button" className={`chip ${showInactive ? 'chip-active' : ''}`} onClick={() => setShowInactive((v) => !v)} aria-pressed={showInactive}>
            Mostrar inativos<span className="chip-count">{inactiveCount}</span>
          </button>
        )}
        {hasFilters && (
          <button type="button" className="chip chip-ghost" onClick={clearFilters}><X size={14} /> Limpar filtros</button>
        )}
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <form className="modal-form" onSubmit={handleSubmit}>
            <h2>{editingId ? 'Editar produto' : 'Novo produto'}</h2>
            {formError && <div className="alert alert-error">{formError}</div>}

            <Field label="Nome" max={LIMITS.PRODUCT_NAME} value={form.name} onChange={update('name')} required autoFocus />

            <div className="form-row">
              <Field
                label="SKU" optional max={LIMITS.SKU} value={form.sku} onChange={update('sku', skuChars)}
                hint="Letras, números e - _ . /" autoCapitalize="characters" spellCheck={false}
              />
              <Field
                label="Código de barras" optional max={LIMITS.BARCODE} value={form.barcode} onChange={update('barcode', onlyDigits)}
                hint="EAN/GTIN: 8, 12, 13 ou 14 dígitos" inputMode="numeric"
              />
            </div>

            <Field as="textarea" label="Descrição" optional max={LIMITS.DESCRIPTION} value={form.description} onChange={update('description')} rows={3} />

            <div className="form-row">
              <Field
                label="Preço de custo (R$)" type="number" step="0.01" min="0" max={LIMITS.PRICE_MAX} inputMode="decimal"
                value={form.costPrice} onChange={update('costPrice')} placeholder="0,00"
              />
              <Field
                label="Preço de venda (R$)" type="number" step="0.01" min="0" max={LIMITS.PRICE_MAX} inputMode="decimal"
                value={form.sellingPrice} onChange={update('sellingPrice')} placeholder="0,00"
                hint={margin !== null && (
                  <span className={margin < 0 ? 'text-danger' : ''}>
                    Margem: {formatPercent(margin)} ({formatCurrency(price - cost)} por unidade)
                  </span>
                )}
              />
            </div>

            <div className="form-row">
              <Field
                label={editingId ? 'Estoque atual' : 'Quantidade inicial'} type="number" min="0" step="1" max={LIMITS.QUANTITY_MAX}
                inputMode="numeric" value={form.quantity} disabled={!!editingId} onChange={update('quantity')} placeholder="0"
                hint={editingId ? 'Altere pelo menu Movimentações' : undefined}
              />
              <Field
                label="Estoque mínimo" type="number" min="0" step="1" max={LIMITS.QUANTITY_MAX} inputMode="numeric"
                value={form.minStock} onChange={update('minStock')} placeholder="0" hint="Avisa quando o saldo chegar nesse valor"
              />
            </div>

            <div className="form-row">
              <Field as="select" label="Categoria" value={form.categoryId} onChange={update('categoryId')}>
                <option value="">Nenhuma</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Field>
              <Field as="select" label="Fornecedor" value={form.supplierId} onChange={update('supplierId')}>
                <option value="">Nenhum</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Field>
            </div>

            {editingId && (
              <label className="switch-label">
                <input type="checkbox" role="switch" checked={form.active} onChange={update('active')} />
                <span className="switch" aria-hidden="true" />
                Produto ativo
              </label>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {loading ? <SkeletonList rows={5} /> : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto cadastrado"
          text="Cadastre seu primeiro produto para começar a controlar o estoque."
          action={<button onClick={openNewForm}><Plus size={16} /> Cadastrar produto</button>}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nenhum produto encontrado"
          text="Tente outro termo de busca ou remova os filtros."
          action={<button className="btn-secondary" onClick={clearFilters}>Limpar filtros</button>}
        />
      ) : (
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Produto</th><th>Categoria</th><th className="num">Saldo</th><th className="num">Preço venda</th><th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => {
              const low = p.active && p.quantity <= p.minStock;
              const hasHistory = (p._count?.stockMovements ?? 0) > 0;
              return (
                <tr key={p.id} className={`${low ? 'row-alert' : ''} ${p.active ? '' : 'row-inactive'}`}>
                  <td data-label="Produto" className="cell-title">
                    <div className="cell-stack">
                      <span>
                        {p.name}
                        {!p.active && <span className="badge badge-muted">Inativo</span>}
                      </span>
                      {(p.sku || p.barcode) && (
                        <small className="cell-sub">{[p.sku && `SKU ${p.sku}`, p.barcode].filter(Boolean).join(' · ')}</small>
                      )}
                      {!p.active && hasHistory && (
                        <small className="cell-sub cell-note">
                          <History size={12} /> Tem histórico de movimentações, por isso não pode ser excluído
                        </small>
                      )}
                    </div>
                  </td>
                  <td data-label="Categoria">{p.category?.name || <span className="text-muted">—</span>}</td>
                  <td data-label="Saldo" className="num">
                    <span className={low ? 'stock-pill stock-low' : 'stock-pill'}>{p.quantity}</span>
                    {low && <small className="cell-sub"> mín. {p.minStock}</small>}
                  </td>
                  <td data-label="Preço venda" className="num">{formatCurrency(p.sellingPrice)}</td>
                  <td className="table-actions">
                    <button className="btn-link" onClick={() => openEditForm(p)} aria-label={`Editar ${p.name}`}><Pencil size={14} /> Editar</button>
                    {!p.active && (
                      <button className="btn-link" onClick={() => handleReactivate(p)}><RotateCcw size={14} /> Reativar</button>
                    )}
                    {p.active && hasHistory && (
                      <button className="btn-link btn-danger" onClick={() => handleDeactivate(p)} aria-label={`Desativar ${p.name}`}><Archive size={14} /> Desativar</button>
                    )}
                    {!hasHistory && (
                      <button className="btn-link btn-danger" onClick={() => handleDelete(p)} aria-label={`Excluir ${p.name}`}><Trash2 size={14} /> Excluir</button>
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
