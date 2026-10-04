import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import { FeedbackProvider } from './components/ui/Feedback';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import StockMovements from './components/StockMovements';
import Categories from './components/Categories';
import Suppliers from './components/Suppliers';
import Team from './components/Team';
import Settings from './components/Settings';

import './App.css';

// Quem já está logado não precisa ver login/registro
function PublicOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FeedbackProvider>
        <Routes>
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/registro" element={<PublicOnly><Register /></PublicOnly>} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<Products />} />
            <Route path="estoque" element={<StockMovements />} />
            <Route path="categorias" element={<Categories />} />
            <Route path="fornecedores" element={<Suppliers />} />
            <Route path="equipe" element={<PrivateRoute adminOnly><Team /></PrivateRoute>} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </FeedbackProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
