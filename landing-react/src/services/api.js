const API_BASE = '/api';

let _token = sessionStorage.getItem('admin_token');

export function setToken(token) { _token = token; }
export function getToken() { return _token; }
export function clearToken() { _token = null; }

async function request(url, options = {}) {
  const headers = { ...options.headers };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  loginUser: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // Products — Bulk
  importProducts: (data) => request('/products/import', { method: 'POST', body: JSON.stringify(data) }),
  exportProducts: () => request('/products/export'),

  // Categories
  getCategories: async () => {
    const products = await request('/products');
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.map(name => ({ name, image_url: null }));
  },

  // Products
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (status) => request(`/orders${status ? `?status=${status}` : ''}`),
  getOrderStats: () => request('/orders/stats'),
  getOrder: (id) => request(`/orders/${id}`),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  // Messages
  getMessages: () => request('/messages'),
  getUnreadCount: () => request('/messages/unread-count'),
  createMessage: (data) => request('/messages', { method: 'POST', body: JSON.stringify(data) }),
  markRead: (id) => request(`/messages/${id}/read`, { method: 'PATCH' }),
  markUnread: (id) => request(`/messages/${id}/unread`, { method: 'PATCH' }),
  deleteMessage: (id) => request(`/messages/${id}`, { method: 'DELETE' }),
  replyMessage: (id, reply) => request(`/messages/${id}/reply`, { method: 'PATCH', body: JSON.stringify({ reply }) }),

  // Settings
  getSettings: () => request('/settings'),
  updateSetting: (key, value) => request(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),

  // Upload
  uploadImage: async (formData) => {
    const headers = {};
    if (_token) headers['Authorization'] = `Bearer ${_token}`;
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData, headers });
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    return res.json();
  },

  // Catalogs
  getCatalogs: () => request('/catalogs'),
  uploadCatalog: async (formData) => {
    const headers = {};
    if (_token) headers['Authorization'] = `Bearer ${_token}`;
    const res = await fetch(`${API_BASE}/catalogs`, { method: 'POST', body: formData, headers });
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    return res.json();
  },
  deleteCatalog: (id) => request(`/catalogs/${id}`, { method: 'DELETE' }),

  // Accounting
  getAccountingEntries: (filters) => request(`/accounting${filters ? '?' + new URLSearchParams(filters).toString() : ''}`),
  getAccountingSummary: (filters) => request(`/accounting/summary${filters ? '?' + new URLSearchParams(filters).toString() : ''}`),
  getTaxSummary: (year) => request(`/accounting/tax-summary${year ? `?year=${year}` : ''}`),
  createAccountingEntry: (data) => request('/accounting', { method: 'POST', body: JSON.stringify(data) }),
  updateAccountingEntry: (id, data) => request(`/accounting/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccountingEntry: (id) => request(`/accounting/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => request('/inventory'),
  getLowStock: () => request('/inventory/low-stock'),
  updateStock: (productId, quantity) => request(`/inventory/${productId}/stock`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  updateMinStock: (productId, minStock) => request(`/inventory/${productId}/min-stock`, { method: 'PUT', body: JSON.stringify({ min_stock: minStock }) }),
  getInventoryMovements: (productId) => request(`/inventory-movements?product_id=${productId}`),
  createInventoryMovement: (data) => request('/inventory-movements', { method: 'POST', body: JSON.stringify(data) }),

  // Accounting System - Master Data
  getAccountCharts: () => request('/account-charts'),
  createAccountChart: (data) => request('/account-charts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccountChart: (id, data) => request(`/account-charts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getThirdParties: (filters) => request(`/third-parties${filters ? '?' + new URLSearchParams(filters).toString() : ''}`),
  getThirdParty: (id) => request(`/third-parties/${id}`),
  createThirdParty: (data) => request('/third-parties', { method: 'POST', body: JSON.stringify(data) }),
  updateThirdParty: (id, data) => request(`/third-parties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getCostCenters: () => request('/cost-centers'),
  createCostCenter: (data) => request('/cost-centers', { method: 'POST', body: JSON.stringify(data) }),
  getBankAccounts: () => request('/bank-accounts'),
  createBankAccount: (data) => request('/bank-accounts', { method: 'POST', body: JSON.stringify(data) }),

  // Accounting System - Core
  getJournalEntries: (filters) => request(`/journal-entries${filters ? '?' + new URLSearchParams(filters).toString() : ''}`),
  getJournalEntry: (id) => request(`/journal-entries/${id}`),
  createJournalEntry: (data) => request('/journal-entries', { method: 'POST', body: JSON.stringify(data) }),
  updateJournalEntryStatus: (id, status) => request(`/journal-entries/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getInvoices: (filters) => request(`/invoices${filters ? '?' + new URLSearchParams(filters).toString() : ''}`),
  getInvoice: (id) => request(`/invoices/${id}`),
  createInvoice: (data) => request('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoiceStatus: (id, status) => request(`/invoices/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getReceivablePayable: (filters) => request(`/receivable-payable${filters ? '?' + new URLSearchParams(filters).toString() : ''}`),
  createReceivablePayable: (data) => request('/receivable-payable', { method: 'POST', body: JSON.stringify(data) }),
  getBankReconciliation: (bankAccountId) => request(`/bank-reconciliation?bank_account_id=${bankAccountId}`),
  createBankReconciliation: (data) => request('/bank-reconciliation', { method: 'POST', body: JSON.stringify(data) }),

  // Financial Reports
  getTrialBalance: (from, to) => request(`/financial-reports/trial-balance?from=${from}&to=${to}`),
  getIncomeStatement: (from, to) => request(`/financial-reports/income-statement?from=${from}&to=${to}`),
  getBalanceSheet: (asOf) => request(`/financial-reports/balance-sheet?as_of=${asOf}`),

  // Page Sections (page builder)
  getPageSections: () => request('/page-sections'),
  getPageSection: (id) => request(`/page-sections/${id}`),
  createPageSection: (data) => request('/page-sections', { method: 'POST', body: JSON.stringify(data) }),
  updatePageSection: (id, data) => request(`/page-sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePageSection: (id) => request(`/page-sections/${id}`, { method: 'DELETE' }),

  // Design Tokens (theme colors)
  getDesignTokens: () => request('/design-tokens'),
  updateDesignToken: (name, value, category) => request(`/design-tokens/${name}`, { method: 'PUT', body: JSON.stringify({ value, category }) }),
  bulkUpdateDesignTokens: (tokens) => request('/design-tokens', { method: 'PUT', body: JSON.stringify({ tokens }) }),

  // Customers
  getCustomers: () => request('/customers'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Coupons
  getCoupons: () => request('/coupons'),
  getCoupon: (id) => request(`/coupons/${id}`),
  createCoupon: (data) => request('/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id, data) => request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCoupon: (id) => request(`/coupons/${id}`, { method: 'DELETE' }),
  validateCoupon: (code) => request('/coupons/validate', { method: 'POST', body: JSON.stringify({ code }) }),

  // Users
  getUsers: () => request('/users'),
  getUser: (id) => request(`/users/${id}`),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
