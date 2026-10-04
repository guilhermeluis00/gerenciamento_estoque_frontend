import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isAdmin } from '../roles';

export default function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="loading-text">Carregando...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin(user)) return <Navigate to="/" replace />;

  return children;
}
