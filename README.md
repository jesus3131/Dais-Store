# Dais Store 🛍️

Distribuidora Mayorista de productos de belleza y cuidado personal. Landing page moderna construida con React + Vite + Tailwind CSS v4.

## 📦 Stack

| Capa       | Tecnología                                           |
| ---------- | ---------------------------------------------------- |
| Frontend   | React 18, Vite 6, Tailwind CSS v4                    |
| Backend    | Node.js, Express                                     |
| Base datos | PostgreSQL                                           |
| Fuentes    | Playfair Display (títulos), Manrope (textos)         |
| Iconos     | Google Material Symbols                              |

## 🚀 Inicio rápido

```bash
# Clonar
git clone https://github.com/jesus3131/Dais-Store.git
cd Dais-Store

# Frontend (landing page)
cd landing-react
npm install
npm run dev          # http://localhost:5173

# Backend (API)
cd server
npm install
node start.js        # http://localhost:4000
```

## 📁 Estructura

```
Dais-Store/
├── landing-react/          # Landing page (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # Header, Footer, CartDrawer
│   │   │   └── sections/   # Hero, About, Catalog, FAQ, etc.
│   │   ├── context/        # CartContext (carrito + WhatsApp)
│   │   ├── App.jsx
│   │   └── index.css       # Tailwind v4 @theme personalizado
│   └── package.json
├── server/                 # API REST (Express + PostgreSQL)
│   ├── src/
│   │   ├── routes/         # CRUD products, orders, messages, etc.
│   │   ├── models/         # Consultas a base de datos
│   │   ├── db.js           # Conexión PostgreSQL
│   │   └── index.js        # Entry point
│   └── start.js            # spawn wrapper (Windows safe)
└── README.md
```

## 🧩 Componentes

| Componente       | Descripción                                         |
| ---------------- | --------------------------------------------------- |
| `<Header />`     | Navbar sticky con badge del carrito y scroll suave  |
| `<Hero />`       | Full-screen hero con CTAs y logos de marca          |
| `<AboutUs />`    | Sección historia con estadísticas                   |
| `<HowItWorks />` | 4 pasos para comprar                                |
| `<Catalog />`    | Grid de productos con add-to-cart                   |
| `<Testimonials />` | 4 tarjetas de clientes                            |
| `<FAQ />`        | Acordeón de preguntas frecuentes                    |
| `<InstagramFeed />` | Grid de photos placeholder                      |
| `<Branding />`   | Logos de marcas asociadas                           |
| `<Newsletter />` | Formulario de suscripción por email                 |
| `<Footer />`     | Logo dorado itálico, enlaces, contacto Montería     |
| `<CartDrawer />` | Drawer lateral con items, subtotal, WhatsApp        |

## 🛒 Carrito de compras

- Estado local con `useState` via `CartContext`
- Drawer animado con backdrop
- Suma/resta/eliminación de productos
- Subtotal calculado automáticamente
- Botón **WhatsApp** que genera mensaje con resumen del pedido
- Enlace directo: `https://wa.me/573000000000?text=...`

## 🐳 Despliegue

```bash
# Build producción
cd landing-react && npm run build   # → dist/

# Servidor
cd server && node start.js
```

## 📄 Licencia

MIT
