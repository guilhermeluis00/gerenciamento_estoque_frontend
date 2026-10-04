import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Download, History } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { formatDateTime, formatNumber } from '../format';
import { LIMITS } from '../limits';
import ExportDialog from './ExportDialog';
import Field from './ui/Field';
import { useFeedback } from './ui/Feedback';
import { EmptyState, SkeletonList } from './ui/States';

const QUICK_REASONS = {
  IN: ['Compra', 'Devolução de cliente', 'Ajuste de inventário'],
  OUT: ['Venda', 'Perda/avaria', 'Uso interno', 'Ajuste de inventário'],
};

export default function StockMovements() {
  const { toast } = useFeedback();
  const [searchParams] = useSearchParams();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [form, setForm] = useState(() => ({
    productId: searchParams.get('produto') || '',
    type: searchParams.get('tipo') === 'OUT' ? 'OUT' : 'IN',
    quantity: '',
    reason: '',
  }));

  const loadAll = useCallback(() =>
    Promise.all([api.getMovements(), api.getProducts()])
      .then(([movs, prods]) => { setMovements(movs); setProducts(prods); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false)), []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const activeProducts = products.filter((p) => p.active);
  const selected = products.find((p) => p.id === form.productId);
  const qty = Number(form.quantity) || 0;
  const newBalance = selected ? selected.quantity + (form.type === 'IN' ? qty : -qty) : null;
  const insufficient = form.type === 'OUT' && newBalance !== null && newBalance < 0;

  const filtered = useMemo(
    () => (typeFilter ? movements.filter((m) => m.type === typeFilter) : movements),
    [movements, typeFilter],
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (insufficient) {
      setError(`Estoque insuficiente. Saldo atual: ${selected.quantity}`);
      return;
    }
    setSaving(true);
    try {
      await api.createMovement({
        productId: form.productId,
        type: form.type,
        quantity: qty,
        reason: form.reason.trim() || null,
      });
      toast(`${form.type === 'IN' ? 'Entrada' : 'Saída'} de ${formatNumber(qty)} registrada`);
      // Mantém produto e tipo selecionados para lançar vários seguidos
      setForm((f) => ({ ...f, quantity: '', reason: '' }));
      loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Movimentações</h1>
      </div>

      <div className="panel">
        <h2>Registrar movimentação</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <form className="movement-form" onSubmit={handleSubmit}>
          <div className="segmented segmented-lg" role="radiogroup" aria-label="Tipo de movimentação">
            <button
              type="button" role="radio" aria-checked={form.type === 'IN'}
              className={form.type === 'IN' ? 'active in' : ''}
              onClick={() => setForm((f) => ({ ...f, type: 'IN', reason: '' }))}
            ><ArrowDownLeft size={16} /> Entrada</button>
            <button
              type="button" role="radio" aria-checked={form.type === 'OUT'}
              className={form.type === 'OUT' ? 'active out' : ''}
              onClick={() => setForm((f) => ({ ...f, type: 'OUT', reason: '' }))}
            ><ArrowUpRight size={16} /> Saída</button>
          </div>

          <div className="form-row form-row-wide">
            <Field as="select" label="Produto" value={form.productId} onChange={update('productId')} required>
              <option value="">Selecione o produto</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.sku ? ` (${p.sku})` : ''}</option>
              ))}
            </Field>
            <Field
              label="Quantidade" type="number" min="1" step="1" max={LIMITS.QUANTITY_MAX} inputMode="numeric"
              placeholder="0" value={form.quantity} onChange={update('quantity')} required
            />
          </div>

          {selected && (
            <div className={`balance-preview ${insufficient ? 'danger' : ''}`}>
              <span>Saldo atual: <strong>{formatNumber(selected.quantity)}</strong></span>
              {qty > 0 && (
                <span>→ Após {form.type === 'IN' ? 'entrada' : 'saída'}: <strong>{formatNumber(newBalance)}</strong></span>
              )}
              {insufficient && <span className="balance-warning">Estoque insuficiente</span>}
            </div>
          )}

          <Field
            label="Motivo" optional max={LIMITS.MOVEMENT_REASON} value={form.reason} onChange={update('reason')}
            placeholder="Ex.: nota fiscal 1234"
          />
          <div className="chips chips-tight">
            {QUICK_REASONS[form.type].map((r) => (
              <button
                key={r} type="button"
                className={`chip ${form.reason === r ? 'chip-active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, reason: f.reason === r ? '' : r }))}
              >{r}</button>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving || insufficient}>
              {saving ? 'Registrando...' : `Registrar ${form.type === 'IN' ? 'entrada' : 'saída'}`}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Histórico</h2>
          <div className="panel-header-actions">
            <div className="segmented segmented-sm" role="radiogroup" aria-label="Filtrar histórico">
              {[['', 'Todas'], ['IN', 'Entradas'], ['OUT', 'Saídas']].map(([value, label]) => (
                <button
                  key={value} type="button" role="radio" aria-checked={typeFilter === value}
                  className={typeFilter === value ? 'active' : ''} onClick={() => setTypeFilter(value)}
                >{label}</button>
              ))}
            </div>
            <button
              type="button" className="btn-secondary btn-sm" onClick={() => setShowExport(true)}
              disabled={movements.length === 0}
            >
              <Download size={15} /> Exportar CSV
            </button>
          </div>
        </div>

        {showExport && (
          <ExportDialog products={products} initialType={typeFilter} onClose={() => setShowExport(false)} />
        )}

        {loading ? <SkeletonList rows={5} /> : filtered.length === 0 ? (
          <EmptyState icon={History} title="Nenhuma movimentação" text="As entradas e saídas registradas aparecem aqui." />
        ) : (
          <table className="responsive-table">
            <thead>
              <tr><th>Produto</th><th>Tipo</th><th className="num">Qtd</th><th>Motivo</th><th>Usuário</th><th>Data</th></tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td data-label="Produto" className="cell-title">{m.product?.name}</td>
                  <td data-label="Tipo">
                    <span className={`badge ${m.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                      {m.type === 'IN' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td data-label="Qtd" className={`num qty-${m.type === 'IN' ? 'in' : 'out'}`}>
                    {m.type === 'IN' ? '+' : '−'}{formatNumber(m.quantity)}
                  </td>
                  <td data-label="Motivo" className="cell-wrap">{m.reason || <span className="text-muted">—</span>}</td>
                  <td data-label="Usuário">{m.user?.name || <span className="text-muted">—</span>}</td>
                  <td data-label="Data" className="text-secondary">{formatDateTime(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
