import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerFloatingNotification } from '../ui/FloatingSaleNotification.jsx';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const replyRef = useRef();

  const load = () => {
    setLoading(true);
    api.getMessages().then(setMessages).catch(() => addToast('Error al cargar mensajes', 'error'))
    .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleRead = async (msg) => {
    try {
      if (msg.is_read) { await api.markUnread(msg.id); } else { await api.markRead(msg.id); }
      load();
    } catch (err) { addToast(err.message || 'Error al cambiar estado', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.deleteMessage(id); addToast('Mensaje eliminado', 'info'); load();
    } catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
  };

  const openReply = (msg) => { setReplyModal(msg); setReplyText(msg.reply || ''); setTimeout(() => replyRef.current?.focus(), 100); };

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) { addToast('Escribe una respuesta', 'error'); return; }
    setSending(true);
    try { await api.replyMessage(replyModal.id, replyText.trim()); addToast('Respuesta guardada'); triggerFloatingNotification({ name: 'Mensaje respondido', product: replyModal.name, icon: 'mail', time: 'recién' }); setReplyModal(null); load(); }
    catch (err) { addToast(err.message || 'Error al guardar respuesta', 'error'); }
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setReplyModal(null);
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSendReply(e);
  };

  return (
    <div className="max-w-5xl">
      <div className="admin-section-header">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Mensajes</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{messages.length} mensajes · {messages.filter(m => !m.is_read).length} sin leer</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-warm-gray)] border-t-[var(--color-gold)] rounded-full" />
        </div>
      ) : (
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`bg-white border border-[rgba(0,0,0,0.04)] ${!msg.is_read ? 'border-l-[3px] border-l-[var(--color-gold)]' : ''} transition-all`}>
            <div className="p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-headline text-base text-[var(--color-near-black)]">{msg.name}</h3>
                    {!msg.is_read && (
                      <span className="px-2.5 py-1 bg-[rgba(232,207,166,0.1)] text-[var(--color-gold)] font-inter text-[9px] uppercase tracking-[0.12em] font-medium rounded">Nuevo</span>
                    )}
                    <span className="font-inter text-[10px] text-[var(--color-on-surface-variant)] ml-auto">{new Date(msg.created_at).toLocaleString('es-CO')}</span>
                  </div>
                  <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mb-4">
                    <span className="material-symbols-outlined text-[12px] align-text-bottom">mail</span> {msg.email}
                    {msg.phone && <> · <span className="material-symbols-outlined text-[12px] align-text-bottom">call</span> {msg.phone}</>}
                  </p>
                  <p className="font-inter text-sm text-[var(--color-on-surface)] leading-relaxed">{msg.message}</p>
                  {msg.reply && (
                    <div className="mt-5 pl-5 border-l-2 border-[var(--color-gold)]">
                      <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-gold)] font-medium mb-1.5">Tu respuesta</p>
                      <p className="font-inter text-sm text-[var(--color-on-surface-variant)]">{msg.reply}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openReply(msg)} className="p-2.5 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] hover:bg-[rgba(232,207,166,0.08)] transition-colors rounded" title="Responder">
                    <span className="material-symbols-outlined text-[20px]">reply</span>
                  </button>
                  <button onClick={() => toggleRead(msg)} className="p-2.5 text-[var(--color-on-surface-variant)] hover:text-blue-500 hover:bg-blue-50 transition-colors rounded" title={msg.is_read ? 'Marcar no leído' : 'Marcar leído'}>
                    <span className="material-symbols-outlined text-[20px]">{msg.is_read ? 'mark_email_unread' : 'mark_email_read'}</span>
                  </button>
                  <button onClick={() => handleDelete(msg.id)} className="p-2.5 text-[var(--color-on-surface-variant)] hover:text-red-500 hover:bg-red-50 transition-colors rounded" title="Eliminar">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-[var(--color-warm-gray)] mb-4">mail_outline</span>
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)]">No hay mensajes</p>
          </div>
        )}
      </div>
      )}

      {replyModal && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setReplyModal(null)}>
          <div className="bg-white w-full max-w-xl mx-4 animate-scale-in" onClick={e => e.stopPropagation()} onKeyDown={handleKeyDown}>
            <form onSubmit={handleSendReply}>
              <div className="p-8 border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-xl text-[var(--color-near-black)]">Responder a {replyModal.name}</h2>
                  <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-1">{replyModal.email} {replyModal.phone ? `· ${replyModal.phone}` : ''}</p>
                </div>
                <button type="button" onClick={() => setReplyModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,0,0,0.04)] transition-colors rounded">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <div className="p-8">
                <div className="mb-5 p-5 bg-[var(--color-ivory)] font-inter text-sm text-[var(--color-on-surface)] leading-relaxed rounded">{replyModal.message}</div>
                <label className="admin-label">Tu respuesta <span className="text-red-400">*</span></label>
                <textarea ref={replyRef} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escribe tu respuesta..." rows={5} maxLength={2000}
                  className="admin-input resize-none" required />
              </div>
              <div className="p-8 border-t border-[rgba(0,0,0,0.04)] flex items-center justify-between">
                <p className="font-inter text-[10px] text-[var(--color-on-surface-variant)]">Ctrl+Enter para enviar</p>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setReplyModal(null)} className="admin-btn-outline">Cancelar</button>
                  <button type="submit" disabled={sending || !replyText.trim()}
                    className="admin-btn flex items-center gap-2">
                    {sending ? 'Enviando...' : 'Enviar Respuesta'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
