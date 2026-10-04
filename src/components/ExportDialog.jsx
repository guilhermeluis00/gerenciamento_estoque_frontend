import { useState } from 'react';
import { Download } from 'lucide-react';
import { api } from '../api';
import { formatNumber } from '../format';
import Modal from './Modal';
import Field from './ui/Field';
import { useFeedback } from './ui/Feedback';

const PERIODS = {
  month: 'Este mês',
  last30: 'Últimos 30 dias',
  lastMonth: 'Mês passado',
  all: 'Tudo',
  custom: 'Personalizado',
};

const pad = (n) => String(n).padStart(2, '0');
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
// "2026-10-04" → Date local (new Date("2026-10-04") seria meia-noite UTC, um dia antes no Brasil)
const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

/** Converte o período escolhido em datas no fuso do usuário. */
function periodRange(period, customFrom, customTo) {
  const now = new Date();
  switch (period) {
    case 'month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    case 'last30': {
      const from = startOfDay(now);
      from.setDate(from.getDate() - 29);
      return { from, to: now };
    }
    case 'lastMonth':
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    case 'custom':
      return {
        from: customFrom ? parseDay(customFrom) : null,
        to: customTo ? endOfDay(parseDay(customTo)) : null,
      };
    default:
      return { from: null, to: null };
  }
}

export default function ExportDialog({ products, initialType = '', onClose }) {
  const { toast } = useFeedback();
  const today = isoDay(new Date());
  const [period, setPeriod] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState(today);
  const [type, setType] = useState(initialType);
  const [productId, setProductId] = useState('');
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const { from, to } = periodRange(period, customFrom, customTo);
    if (period === 'custom' && from && to && from > to) {
      setError('A data inicial deve ser anterior à data final');
      return;
    }

    const params = { tz: Intl.DateTimeFormat().resolvedOptions().timeZone };
    if (from) params.from = from.toISOString();
    if (to) params.to = to.toISOString();
    if (type) params.type = type;
    if (productId) params.productId = productId;

    const suffix = from || to
      ? `_${from ? isoDay(from) : 'inicio'}_a_${to ? isoDay(to) : isoDay(new Date())}`
      : `_completo_${today}`;
    const filename = `movimentacoes${suffix}.csv`;

    setExporting(true);
    try {
      const { total } = await api.exportMovements(params, filename);
      toast(total ? `${formatNumber(total)} movimentações exportadas` : 'Arquivo exportado');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Modal onClose={onClose} size="sm">
      <form className="modal-form" onSubmit={handleSubmit}>
        <h2>Exportar movimentações</h2>
        <p className="modal-description">
          Gera um arquivo CSV que abre no Excel, Google Planilhas ou LibreOffice.
        </p>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <span className="field-label">Período</span>
          <div className="chips chips-wrap" role="radiogroup" aria-label="Período">
            {Object.entries(PERIODS).map(([key, label]) => (
              <button
                key={key} type="button" role="radio" aria-checked={period === key}
                className={`chip ${period === key ? 'chip-active' : ''}`}
                onClick={() => setPeriod(key)}
              >{label}</button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="form-row">
            <Field label="De" type="date" value={customFrom} max={customTo || today} onChange={(e) => setCustomFrom(e.target.value)} />
            <Field label="Até" type="date" value={customTo} min={customFrom || undefined} max={today} onChange={(e) => setCustomTo(e.target.value)} />
          </div>
        )}

        <div className="form-row">
          <Field as="select" label="Tipo" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Entradas e saídas</option>
            <option value="IN">Somente entradas</option>
            <option value="OUT">Somente saídas</option>
          </Field>
          <Field as="select" label="Produto" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Todos os produtos</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.active ? '' : ' (inativo)'}</option>)}
          </Field>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" disabled={exporting}>
            <Download size={16} /> {exporting ? 'Gerando...' : 'Baixar CSV'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
