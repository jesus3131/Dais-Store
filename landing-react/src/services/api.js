const base = import.meta.env.VITE_API_URL || '';
const API_BASE = base ? `${base}/api` : '/api';
export { API_BASE };

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

  // Reports
  getReportKpiSummary: (params) => request(`/reports/kpi-summary?${new URLSearchParams(params || {}).toString()}`),
  getReportSales: (params) => request(`/reports/sales?${new URLSearchParams(params || {}).toString()}`),
  getReportSalesByDay: (params) => request(`/reports/sales-by-day?${new URLSearchParams(params || {}).toString()}`),
  getReportSalesByHour: (params) => request(`/reports/sales-by-hour?${new URLSearchParams(params || {}).toString()}`),
  getReportSalesByCategory: (params) => request(`/reports/sales-by-category?${new URLSearchParams(params || {}).toString()}`),
  getReportAovTrend: (params) => request(`/reports/aov-trend?${new URLSearchParams(params || {}).toString()}`),
  getReportMonthOverMonth: (params) => request(`/reports/month-over-month?${new URLSearchParams(params || {}).toString()}`),
  getReportYearOverYear: () => request('/reports/year-over-year'),
  getReportDiscountAnalysis: (params) => request(`/reports/discount-analysis?${new URLSearchParams(params || {}).toString()}`),
  getReportTopProducts: (params) => request(`/reports/top-products?${new URLSearchParams(params || {}).toString()}`),
  getReportProductCategories: () => request('/reports/product-categories'),
  getReportPriceDistribution: () => request('/reports/price-distribution'),
  getReportOrdersByStatus: (params) => request(`/reports/orders-by-status?${new URLSearchParams(params || {}).toString()}`),
  getReportOrderValueDistribution: () => request('/reports/order-value-distribution'),
  getReportCustomerStats: (params) => request(`/reports/customer-stats?${new URLSearchParams(params || {}).toString()}`),
  getReportTopCustomers: (params) => request(`/reports/top-customers?${new URLSearchParams(params || {}).toString()}`),
  getReportRepeatPurchase: () => request('/reports/repeat-purchase-rate'),
  getReportCustomersByCity: () => request('/reports/customers-by-city'),
  getReportInventorySummary: () => request('/reports/inventory-summary'),
  getReportInventoryValue: (params) => request(`/reports/inventory-value?${new URLSearchParams(params || {}).toString()}`),
  getReportSalesDetail: (params) => request(`/reports/sales-detail?${new URLSearchParams(params || {}).toString()}`),
  getReportProductDetail: (params) => request(`/reports/product-detail?${new URLSearchParams(params || {}).toString()}`),
  getReportCustomerDetail: (params) => request(`/reports/customer-detail?${new URLSearchParams(params || {}).toString()}`),
  getReportInventoryDetail: () => request('/reports/inventory-detail'),
  getReportOrderDetail: (params) => request(`/reports/order-detail?${new URLSearchParams(params || {}).toString()}`),
  getReportFinancialDetail: (params) => request(`/reports/financial-detail?${new URLSearchParams(params || {}).toString()}`),

  // Report Analysis (pandas)
  getReportAnalysis: (type, params) => request(`/reports-analysis/${type}?${new URLSearchParams(params || {}).toString()}`),

  // Invoice
  downloadInvoiceUrl: (orderId) => `${API_BASE}/orders/${orderId}/invoice`,
  downloadInvoice: async (orderId) => {
    const headers = {};
    if (_token) headers['Authorization'] = `Bearer ${_token}`;
    const res = await fetch(`${API_BASE}/orders/${orderId}/invoice`, { headers });
    if (!res.ok) throw new Error('Error al descargar factura');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${String(orderId).padStart(6, '0')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Quotations
  getQuotations: () => request('/quotations'),
  getQuotation: (id) => request(`/quotations/${id}`),
  createQuotation: (data) => request('/quotations', { method: 'POST', body: JSON.stringify(data) }),
  updateQuotation: (id, data) => request(`/quotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuotation: (id) => request(`/quotations/${id}`, { method: 'DELETE' }),
  updateQuotationStatus: (id, status) => request(`/quotations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  downloadQuotationUrl: (id) => `${API_BASE}/quotations/${id}/pdf`,
  downloadQuotationPdf: async (id, number) => {
    const headers = {};
    if (_token) headers['Authorization'] = `Bearer ${_token}`;
    const res = await fetch(`${API_BASE}/quotations/${id}/pdf`, { headers });
    if (!res.ok) throw new Error('Error al descargar cotización');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(number || `COT-${String(id).padStart(6, '0')}`).replace(/\//g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Users
  getUsers: () => request('/users'),
  getUser: (id) => request(`/users/${id}`),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Self password change
  changePassword: (currentPassword, newPassword) =>
    request('/users/me/password', { method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }) }),
};
