import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = () => {
    setLoading(true);
    api.getMessages().then(setMessages).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRead = async (id, read) => {
    try {
      read ? await api.markMessageRead(id) : await api.markMessageUnread(id);
      load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.deleteMessage(id);
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: 32 }}>Mensajes de Clientes</h2>

      {detail && (
        <div style={{ background: '#f9f9f9', padding: 24, marginBottom: 24, borderRadius: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)' }}>{detail.name}</h3>
            <button onClick={() => setDetail(null)} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>✕</button>
          </div>
          <p><strong>Email:</strong> {detail.email || '—'}</p>
          <p><strong>Teléfono:</strong> {detail.phone || '—'}</p>
          <p><strong>Fecha:</strong> {new Date(detail.created_at).toLocaleString('es-CO')}</p>
          <div style={{ marginTop: 16, padding: 16, background: '#fff', borderRadius: 4, borderLeft: '3px solid #1A1A1A' }}>
            {detail.message}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            {!detail.is_read && (
              <button onClick={() => { handleRead(detail.id, true); setDetail({ ...detail, is_read: true }); }}
                style={{ padding: '8px 20px', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Marcar como leído
              </button>
            )}
            <button onClick={() => handleDelete(detail.id)}
              style={{ padding: '8px 20px', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Eliminar
            </button>
          </div>
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m) => (
            <div key={m.id} onClick={() => setDetail(m)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 20px', background: m.is_read ? '#fff' : '#fce4ec', border: '1px solid #eee',
                cursor: 'pointer', borderRadius: 4, transition: 'background 0.2s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <strong>{m.name}</strong>
                  {!m.is_read && <span style={{ background: '#e74c3c', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem' }}>Nuevo</span>}
                </div>
                <div style={{ color: '#777', fontSize: '0.85rem', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 600 }}>
                  {m.message}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#999' }}>
                <div>{new Date(m.created_at).toLocaleDateString('es-CO')}</div>
                <div style={{ marginTop: 4 }}>{m.email}</div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>No hay mensajes</p>
          )}
        </div>
      )}
    </div>
  );
}
