import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);

  const load = () => {
    api.getMessages().then(setMessages).catch(() => {});
  };

  useEffect(load, []);

  const toggleRead = async (msg) => {
    if (msg.is_read) {
      await api.markUnread(msg.id);
    } else {
      await api.markRead(msg.id);
    }
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    await api.deleteMessage(id);
    load();
  };

  return (
    <div>
      <h1 className="font-headline text-2xl text-[var(--color-on-surface)] mb-6">Mensajes</h1>
      <div className="space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`bg-white rounded-xl luxury-shadow p-5 transition-all ${!msg.is_read ? 'border-l-4 border-[var(--color-primary)]' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-manrope font-semibold text-[var(--color-on-surface)]">{msg.name}</h3>
                  {!msg.is_read && <span className="px-2 py-0.5 bg-[var(--color-primary-container)] text-[var(--color-primary)] text-[10px] rounded-full font-semibold">Nuevo</span>}
                </div>
                <p className="font-manrope text-xs text-[var(--color-outline)] mb-2">
                  {msg.email} {msg.phone ? `· ${msg.phone}` : ''} · {new Date(msg.created_at).toLocaleString()}
                </p>
                <p className="font-manrope text-sm text-[var(--color-on-surface-variant)]">{msg.message}</p>
              </div>
              <div className="flex gap-1 ml-4 flex-shrink-0">
                <button onClick={() => toggleRead(msg)} className="p-2 text-[var(--color-outline)] hover:text-[var(--color-primary)] transition-colors" title={msg.is_read ? 'Marcar no leído' : 'Marcar leído'}>
                  <span className="material-symbols-outlined">{msg.is_read ? 'mark_email_unread' : 'mark_email_read'}</span>
                </button>
                <button onClick={() => handleDelete(msg.id)} className="p-2 text-[var(--color-outline)] hover:text-red-500 transition-colors" title="Eliminar">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-[var(--color-outline-variant)] mb-4">mail_outline</span>
            <p className="font-manrope text-[var(--color-on-surface-variant)]">No hay mensajes</p>
          </div>
        )}
      </div>
    </div>
  );
}
