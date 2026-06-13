const BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Products
  getProducts() {
    return fetch(`${BASE}/products`).then(handleResponse);
  },
  getProduct(id) {
    return fetch(`${BASE}/products/${id}`).then(handleResponse);
  },
  createProduct(data) {
    return fetch(`${BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },
  updateProduct(id, data) {
    return fetch(`${BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },
  deleteProduct(id) {
    return fetch(`${BASE}/products/${id}`, {
      method: 'DELETE',
    }).then(handleResponse);
  },

  // Image upload
  uploadImage(file) {
    const form = new FormData();
    form.append('image', file);
    return fetch(`${BASE}/upload`, {
      method: 'POST',
      body: form,
    }).then(handleResponse);
  },

  // Settings
  getSettings() {
    return fetch(`${BASE}/settings`).then(handleResponse);
  },
  updateSetting(key, value) {
    return fetch(`${BASE}/settings/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    }).then(handleResponse);
  },

  // Inventory
  getInventory() {
    return fetch(`${BASE}/inventory`).then(handleResponse);
  },
  getLowStock() {
    return fetch(`${BASE}/inventory/low-stock`).then(handleResponse);
  },
  updateStock(productId, quantity) {
    return fetch(`${BASE}/inventory/${productId}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    }).then(handleResponse);
  },
  setMinStock(productId, minStock) {
    return fetch(`${BASE}/inventory/${productId}/min-stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ min_stock: minStock }),
    }).then(handleResponse);
  },

  // Orders
  getOrders(filters = {}) {
    const qs = new URLSearchParams(filters).toString();
    return fetch(`${BASE}/orders?${qs}`).then(handleResponse);
  },
  getOrder(id) {
    return fetch(`${BASE}/orders/${id}`).then(handleResponse);
  },
  createOrder(data) {
    return fetch(`${BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse);
  },
  updateOrderStatus(id, status) {
    return fetch(`${BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(handleResponse);
  },
  deleteOrder(id) {
    return fetch(`${BASE}/orders/${id}`, {
      method: 'DELETE',
    }).then(handleResponse);
  },
  getOrderStats() {
    return fetch(`${BASE}/orders/stats`).then(handleResponse);
  },

  // Messages
  getMessages() {
    return fetch(`${BASE}/messages`).then(handleResponse);
  },
  getUnreadCount() {
    return fetch(`${BASE}/messages/unread-count`).then(handleResponse);
  },
  getMessage(id) {
    return fetch(`${BASE}/messages/${id}`).then(handleResponse);
  },
  markMessageRead(id) {
    return fetch(`${BASE}/messages/${id}/read`, { method: 'PATCH' }).then(handleResponse);
  },
  markMessageUnread(id) {
    return fetch(`${BASE}/messages/${id}/unread`, { method: 'PATCH' }).then(handleResponse);
  },
  deleteMessage(id) {
    return fetch(`${BASE}/messages/${id}`, {
      method: 'DELETE',
    }).then(handleResponse);
  },

  // Catalogs
  getCatalogs() {
    return fetch(`${BASE}/catalogs`).then(handleResponse);
  },
  uploadCatalog(data) {
    return fetch(`${BASE}/catalogs`, {
      method: 'POST',
      body: data,
    }).then(handleResponse);
  },
  deleteCatalog(id) {
    return fetch(`${BASE}/catalogs/${id}`, {
      method: 'DELETE',
    }).then(handleResponse);
  },
};
