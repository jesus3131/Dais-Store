export class CartService {
  constructor(eventBus) {
    this._items = [];
    this._eventBus = eventBus;
  }

  on(event, callback) {
    return this._eventBus.on(event, callback);
  }

  addItem(product) {
    const data = typeof product.toJSON === 'function' ? product.toJSON() : product;
    const existing = this._items.find(item => item.id === data.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this._items.push({ ...data, quantity: 1 });
    }
    this._eventBus.emit('cart:updated', this.getSummary());
  }

  removeItem(productId) {
    this._items = this._items.filter(item => item.id !== productId);
    this._eventBus.emit('cart:updated', this.getSummary());
  }

  getItems() {
    return [...this._items];
  }

  getTotal() {
    return this._items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getItemCount() {
    return this._items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSummary() {
    return {
      items: this.getItems(),
      total: this.getTotal(),
      count: this.getItemCount(),
    };
  }

  clear() {
    this._items = [];
    this._eventBus.emit('cart:updated', this.getSummary());
  }
}
