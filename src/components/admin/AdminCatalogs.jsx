import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export function AdminCatalogs() {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    api.getCatalogs().then(setCatalogs).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (file) {
        const form = new FormData();
        form.append('title', title);
        form.append('file', file);
        await api.uploadCatalog(form);
      } else {
        await api.uploadCatalog(new URLSearchParams({ title, url }));
      }
      setShowForm(false);
      setTitle('');
      setUrl('');
      setFile(null);
      load();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este catálogo?')) return;
    try {
      await api.deleteCatalog(id);
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Subir Catálogo</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Catálogo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: 32, marginBottom: 32, borderRadius: 4, maxWidth: 600 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Título del catálogo</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 2 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Archivo (PDF o imagen)</label>
            <input type="file" accept=".pdf,.jpg,.png,.webp" onChange={(e) => { setFile(e.target.files[0]); setUrl(''); }}
              style={{ width: '100%', padding: '8px 0' }} />
            <div style={{ textAlign: 'center', margin: '8px 0', color: '#999' }}>— o —</div>
            <input placeholder="URL del catálogo" value={url} onChange={(e) => { setUrl(e.target.value); setFile(null); }}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 2 }} />
          </div>
          <button type="submit" disabled={uploading} className="btn-primary" style={{ padding: '12px 36px' }}>
            {uploading ? 'Subiendo...' : 'Subir Catálogo'}
          </button>
        </form>
      )}

      {loading ? <p>Cargando...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {catalogs.map((c) => (
            <div key={c.id} style={{ border: '1px solid #eee', padding: 20, borderRadius: 4 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: 16 }}>{c.filename || 'URL externa'} &middot; {new Date(c.uploaded_at).toLocaleDateString('es-CO')}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={c.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: '8px 20px', background: '#1A1A1A', color: '#fff', textDecoration: 'none', fontSize: '0.85rem' }}>
                  Ver
                </a>
                <button onClick={() => handleDelete(c.id)}
                  style={{ padding: '8px 20px', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {catalogs.length === 0 && (
            <p style={{ color: '#999', gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>No hay catálogos</p>
          )}
        </div>
      )}
    </div>
  );
}
