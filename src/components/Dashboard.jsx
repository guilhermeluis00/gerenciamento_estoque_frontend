import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowDownLeft, ArrowUpRight, Boxes, CheckCircle2, DollarSign, Package, Plus,
} from 'lucide-react';
import { api } from '../api';
import { formatCurrency, formatNumber, formatRelative } from '../format';
import { useAuth } from './AuthContext';
import { SkeletonList } from './ui/States';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getMovements()])
      .then(([prods, movs]) => { setProducts(prods); setMovements(movs.slice(0, 6)); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const active = products.filter((p) => p.active);
  const lowStock = active
    .filter((p) => p.quantity <= p.minStock)
    .sort((a, b) => a.quantity - b.quantity);
  const totalItems = active.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = active.reduce((sum, p) => sum + p.quantity * Number(p.sellingPrice), 0);
  const totalCost = active.reduce((sum, p) => sum + p.quantity * Number(p.costPrice), 0);

  const stats = [
    { label: 'Produtos ativos', value: formatNumber(active.length), icon: Package },
    { label: 'Itens em estoque', value: formatNumber(totalItems), icon: Boxes },
    { label: 'Valor em estoque', value: formatCurrency(totalValue), sub: `Custo: ${formatCurrency(totalCost)}`, icon: DollarSign },
    { label: 'Estoque baixo', value: formatNumber(lowStock.length), icon: AlertTriangle, alert: lowStock.length > 0 },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{greeting()}, {user?.name?.split(' ')[0]}</h1>
          <p className="page-subtitle">Resumo do seu estoque</p>
        </div>
        <div className="header-actions">
          <Link to="/estoque" className="button btn-secondary"><ArrowDownLeft size={16} /> Movimentar</Link>
          <Link to="/produtos" className="button"><Plus size={16} /> Produto</Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="cards-grid">
        {stats.map(({ label, value, sub, icon: Icon, alert }) => (
          <div key={label} className={`stat-card ${alert ? 'stat-card-alert' : ''}`}>
            <div className="stat-top">
              <span className="stat-label">{label}</span>
              <span className="stat-icon"><Icon size={18} /></span>
            </div>
            <span className="stat-value">{loading ? <span className="skeleton skeleton-text" /> : value}</span>
            {sub && !loading && <span className="stat-sub">{sub}</span>}
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title"><AlertTriangle size={18} /> Estoque baixo</h2>
            {lowStock.length > 5 && <Link to="/produtos" className="panel-link">Ver todos</Link>}
          </div>
          {loading ? <SkeletonList rows={3} /> : lowStock.length === 0 ? (
            <div className="panel-empty"><CheckCircle2 size={20} /> Todos os produtos estão acima do mínimo.</div>
          ) : (
            <ul className="list">
              {lowStock.slice(0, 5).map((p) => (
                <li key={p.id} className="list-item">
                  <div className="cell-stack">
                    <strong>{p.name}</strong>
                    <small className="cell-sub">Mínimo: {formatNumber(p.minStock)}</small>
                  </div>
                  <div className="list-item-end">
                    <span className="stock-pill stock-low">{formatNumber(p.quantity)}</span>
                    <Link to={`/estoque?produto=${p.id}&tipo=IN`} className="btn-link">Repor</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Atividade recente</h2>
            <Link to="/estoque" className="panel-link">Ver histórico</Link>
          </div>
          {loading ? <SkeletonList rows={3} /> : movements.length === 0 ? (
            <div className="panel-empty">Nenhuma movimentação registrada ainda.</div>
          ) : (
            <ul className="list">
              {movements.map((m) => (
                <li key={m.id} className="list-item">
                  <span className={`activity-icon ${m.type === 'IN' ? 'in' : 'out'}`}>
                    {m.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </span>
                  <div className="cell-stack grow">
                    <strong>{m.product?.name}</strong>
                    <small className="cell-sub">{[m.reason, m.user?.name].filter(Boolean).join(' · ') || '—'}</small>
                  </div>
                  <div className="cell-stack align-end">
                    <span className={`qty-${m.type === 'IN' ? 'in' : 'out'}`}>
                      {m.type === 'IN' ? '+' : '−'}{formatNumber(m.quantity)}
                    </span>
                    <small className="cell-sub">{formatRelative(m.createdAt)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
