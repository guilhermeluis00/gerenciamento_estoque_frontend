import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ArrowLeftRight, Tags, Truck, Users, Settings, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { isAdmin } from '../roles';
import { SUBSCRIPTION_LABELS } from '../format';

export default function Layout() {
  const { user, account, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha com Esc e trava o scroll do fundo enquanto o menu está aberto
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const status = account?.subscriptionStatus;

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/produtos', label: 'Produtos', icon: Package },
    { to: '/estoque', label: 'Movimentações', icon: ArrowLeftRight },
    { to: '/categorias', label: 'Categorias', icon: Tags },
    { to: '/fornecedores', label: 'Fornecedores', icon: Truck },
    ...(isAdmin(user) ? [{ to: '/equipe', label: 'Equipe', icon: Users }] : []),
    { to: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="app-layout">
      <header className="topbar">
        <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
          <Menu size={22} />
        </button>
        <strong className="topbar-title">{account?.name}</strong>
      </header>

      <div className={`sidebar-backdrop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div>
            <strong>{account?.name}</strong>
            {status && (
              <span className={`badge badge-${status.toLowerCase()}`}>
                {SUBSCRIPTION_LABELS[status] || status}
              </span>
            )}
          </div>
          <button className="icon-btn sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}>
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{isAdmin(user) ? 'Administrador' : 'Operador'}</small>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-link btn-danger logout-btn">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
