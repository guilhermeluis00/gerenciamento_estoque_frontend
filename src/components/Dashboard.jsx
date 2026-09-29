import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [all, low] = await Promise.all([
          api.getProducts(),
          api.getProducts('?lowStock=true'),
        ]);
        setProducts(all);
        setLowStock(low);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Carregando...</p>;

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + p.quantity * Number(p.sellingPrice), 0);

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="cards-grid">
        <div className="stat-card">
          <span className="stat-label">Produtos cadastrados</span>
          <span className="stat-value">{products.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Itens em estoque</span>
          <span className="stat-value">{totalItems}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Valor em estoque (venda)</span>
          <span className="stat-value">R$ {totalValue.toFixed(2)}</span>
        </div>
        <div className="stat-card stat-card-alert">
          <span className="stat-label">Estoque baixo</span>
          <span className="stat-value">{lowStock.length}</span>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="panel">
          <h2>⚠️ Produtos com estoque baixo</h2>
          <table>
            <thead>
              <tr><th>Produto</th><th>Saldo atual</th><th>Mínimo</th></tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.quantity}</td>
                  <td>{p.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}