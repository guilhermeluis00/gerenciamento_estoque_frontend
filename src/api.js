const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('account');
}

/**
 * Faz o fetch injetando o token JWT. Em 401/402 (token expirado, usuário
 * desativado, assinatura cancelada) encerra a sessão e volta para o login.
 */
async function send(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
  }

  if (auth && (response.status === 401 || response.status === 402)) {
    clearSession();
    if (window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Erro na requisição');
  }

  return response;
}

/** Requisição JSON padrão. */
async function request(path, options) {
  const response = await send(path, options);
  return response.json().catch(() => ({}));
}

/** Baixa um arquivo autenticado e dispara o "salvar como" do navegador. */
async function downloadFile(path, filename) {
  const response = await send(path);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Dá tempo do navegador iniciar o download antes de liberar a memória
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return { total: Number(response.headers.get('X-Total-Count')) || null };
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
  exportMovements: (params, filename) =>
    downloadFile(`/stock-movements/export?${new URLSearchParams(params)}`, filename),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (payload) => request('/categories', { method: 'POST', body: payload }),
  updateCategory: (id, payload) => request(`/categories/${id}`, { method: 'PUT', body: payload }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: () => request('/suppliers'),
  createSupplier: (payload) => request('/suppliers', { method: 'POST', body: payload }),
  updateSupplier: (id, payload) => request(`/suppliers/${id}`, { method: 'PUT', body: payload }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),

  // Users (team)
  getUsers: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: payload }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
