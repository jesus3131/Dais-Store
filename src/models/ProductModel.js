export class ProductModel {
  constructor({ id, name, price, currency, description, image, category }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.currency = currency || '$';
    this.description = description;
    this.image = image;
    this.category = category || 'general';
  }

  getFormattedPrice() {
    const formatter = new Intl.NumberFormat('es-CO');
    return `${this.currency}${formatter.format(this.price)}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      formattedPrice: this.getFormattedPrice(),
      description: this.description,
      image: this.image,
      category: this.category,
    };
  }
}
