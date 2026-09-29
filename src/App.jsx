import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

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
            <Route path="equipe" element={<Team />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}