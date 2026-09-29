import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isAdmin } from '../roles';

export default function Layout() {
  const { user, account, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <strong>{account?.name}</strong>
          <span className={`badge badge-${account?.subscriptionStatus?.toLowerCase()}`}>
            {account?.subscriptionStatus}
          </span>
        </div>

        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/produtos">Produtos</NavLink>
          <NavLink to="/estoque">Movimentações</NavLink>
          <NavLink to="/categorias">Categorias</NavLink>
          <NavLink to="/fornecedores">Fornecedores</NavLink>
          {isAdmin(user) && <NavLink to="/equipe">Equipe</NavLink>}
          <NavLink to="/configuracoes">Configurações</NavLink>
        </nav>

        <div className="sidebar-footer">
          <span>{user?.name} ({isAdmin(user) ? 'Admin' : 'Operador'})</span>
          <button onClick={handleLogout} className="btn-link">Sair</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}