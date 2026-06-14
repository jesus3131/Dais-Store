const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
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

  // Catalogs
  getCatalogs: () => request('/catalogs'),
  uploadCatalog: async (formData) => {
    const res = await fetch(`${API_BASE}/catalogs`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    return res.json();
  },
  deleteCatalog: (id) => request(`/catalogs/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => request('/inventory'),
  getLowStock: () => request('/inventory/low-stock'),
  updateStock: (productId, quantity) => request(`/inventory/${productId}/stock`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  updateMinStock: (productId, minStock) => request(`/inventory/${productId}/min-stock`, { method: 'PUT', body: JSON.stringify({ min_stock: minStock }) }),
};
