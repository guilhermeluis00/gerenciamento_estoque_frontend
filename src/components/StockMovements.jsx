import { useEffect, useState } from 'react';
import { api } from '../api';

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ productId: '', type: 'IN', quantity: '', reason: '' });

  async function loadAll() {
    setLoading(true);
    try {
      const [movs, prods] = await Promise.all([api.getMovements(), api.getProducts()]);
      setMovements(movs);
      setProducts(prods);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createMovement({
        productId: form.productId,
        type: form.type,
        quantity: Number(form.quantity),
        reason: form.reason || null,
      });
      setForm({ productId: '', type: 'IN', quantity: '', reason: '' });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Movimentações de estoque</h1>

      <div className="panel">
        <h2>Registrar movimentação</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form className="inline-form" onSubmit={handleSubmit}>
          <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
            <option value="">Selecione o produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} (saldo: {p.quantity})</option>
            ))}
          </select>

          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="IN">Entrada</option>
            <option value="OUT">Saída</option>
          </select>

          <input
            type="number"
            min="1"
            placeholder="Quantidade"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />

          <input
            placeholder="Motivo (opcional)"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          <button type="submit">Registrar</button>
        </form>
      </div>

      <div className="panel">
        <h2>Histórico</h2>
        {loading ? <p>Carregando...</p> : (
          <table>
            <thead>
              <tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Qtd</th><th>Motivo</th><th>Usuário</th></tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleString('pt-BR')}</td>
                  <td>{m.product?.name}</td>
                  <td>
                    <span className={`badge ${m.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                      {m.type === 'IN' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td>{m.quantity}</td>
                  <td>{m.reason || '-'}</td>
                  <td>{m.user?.name || '-'}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Nenhuma movimentação registrada.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}