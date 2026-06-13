import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.deleteProduct(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Productos</h2>
        <button className="btn-primary" onClick={() => setEditing({})}>
          + Nuevo Producto
        </button>
      </div>

      {editing && (
        <ProductForm
          initial={editing}
          onSave={async (data) => {
            try {
              if (editing.id) {
                await api.updateProduct(editing.id, data);
              } else {
                await api.createProduct(data);
              }
              setEditing(null);
              load();
            } catch (e) {
              alert(e.message);
            }
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>ID</th>
              <th style={{ padding: 12 }}>Imagen</th>
              <th style={{ padding: 12 }}>Nombre</th>
              <th style={{ padding: 12 }}>Precio</th>
              <th style={{ padding: 12 }}>Categoría</th>
              <th style={{ padding: 12 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: 12 }}>{p.id}</td>
                <td style={{ padding: 12 }}>
                  {p.image_url && (
                    <img src={p.image_url} alt="" style={{ width: 50, height: 66, objectFit: 'cover' }} />
                  )}
                </td>
                <td style={{ padding: 12 }}>{p.name}</td>
                <td style={{ padding: 12 }}>${p.price?.toLocaleString('es-CO')}</td>
                <td style={{ padding: 12 }}>{p.category}</td>
                <td style={{ padding: 12 }}>
                  <button
                    onClick={() => setEditing(p)}
                    style={{ marginRight: 8, padding: '6px 16px', cursor: 'pointer', background: '#1A1A1A', color: '#fff', border: 'none' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ padding: '6px 16px', cursor: 'pointer', background: '#c0392b', color: '#fff', border: 'none' }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#999' }}>No hay productos</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    price: initial.price || '',
    currency: initial.currency || '$',
    description: initial.description || '',
    image_url: initial.image_url || '',
    category: initial.category || '',
  });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setForm((f) => ({ ...f, image_url: result.url }));
    } catch (err) {
      alert('Error al subir imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: Number(form.price),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#f9f9f9', padding: 32, marginBottom: 32, borderRadius: 4,
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 700,
    }}>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Nombre</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 2 }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Precio (COP)</label>
        <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 2 }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Categoría</label>
        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 2 }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Moneda</label>
        <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 2 }} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Descripción</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 2 }} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Imagen</label>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <input placeholder="URL de imagen" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 2 }} />
          <span style={{ color: '#999' }}>o</span>
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          {uploading && <span style={{ color: '#999' }}>Subiendo...</span>}
        </div>
        {form.image_url && (
          <img src={form.image_url} alt="preview" style={{ marginTop: 8, width: 100, height: 133, objectFit: 'cover' }} />
        )}
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, marginTop: 8 }}>
        <button type="submit" className="btn-primary" style={{ padding: '12px 36px' }}>
          {initial.id ? 'Actualizar' : 'Crear'}
        </button>
        <button type="button" onClick={onCancel}
          style={{ padding: '12px 36px', background: 'transparent', border: '1px solid #1A1A1A', cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
