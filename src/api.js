const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

/**
 * Wrapper de fetch que injeta o token JWT e trata erros de forma padronizada.
 */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),

  // Products
  getProducts: (params = '') => request(`/products${params}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Stock movements
  getMovements: (params = '') => request(`/stock-movements${params}`),
  createMovement: (payload) => request('/stock-movements', { method: 'POST', body: payload }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (payload) => request('/categories', { method: 'POST', body: payload }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: () => request('/suppliers'),
  createSupplier: (payload) => request('/suppliers', { method: 'POST', body: payload }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),

  // Users (team)
  getUsers: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: payload }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};