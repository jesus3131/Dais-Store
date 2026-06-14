import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const { addToast } = useToast();

  const load = () => { api.getMessages().then(setMessages).catch(() => {}); };
  useEffect(load, []);

  const toggleRead = async (msg) => {
    if (msg.is_read) { await api.markUnread(msg.id); } else { await api.markRead(msg.id); }
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    await api.deleteMessage(id); addToast('Mensaje eliminado', 'info'); load();
  };

  const openReply = (msg) => { setReplyModal(msg); setReplyText(msg.reply || ''); };

  const handleSendReply = async () => {
    if (!replyText.trim()) { addToast('Escribe una respuesta', 'error'); return; }
    setSending(true);
    try { await api.replyMessage(replyModal.id, replyText.trim()); addToast('Respuesta guardada'); setReplyModal(null); load(); }
    catch { addToast('Error al guardar respuesta', 'error'); }
    finally { setSending(false); }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Mensajes</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{messages.length} mensajes · {messages.filter(m => !m.is_read).length} sin leer</p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`bg-white border border-[var(--color-warm-gray)]/40 ${!msg.is_read ? 'border-l-[3px] border-l-[var(--color-gold)]' : ''} transition-all`}>
            <div className="p-6">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-headline text-base text-[var(--color-near-black)]">{msg.name}</h3>
                    {!msg.is_read && (
                      <span className="px-2.5 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-inter text-[9px] uppercase tracking-[0.12em] font-medium">Nuevo</span>
                    )}
                  </div>
                  <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mb-4">
                    <span className="material-symbols-outlined text-[12px] align-text-bottom">mail</span> {msg.email}
                    {msg.phone && <> · <span className="material-symbols-outlined text-[12px] align-text-bottom">call</span> {msg.phone}</>}
                    {' · '}{new Date(msg.created_at).toLocaleString('es-CO')}
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
                  <button onClick={() => openReply(msg)} className="p-2.5 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 transition-colors" title="Responder">
                    <span className="material-symbols-outlined text-[20px]">reply</span>
                  </button>
                  <button onClick={() => toggleRead(msg)} className="p-2.5 text-[var(--color-on-surface-variant)] hover:text-blue-500 hover:bg-blue-50 transition-colors" title={msg.is_read ? 'Marcar no leído' : 'Marcar leído'}>
                    <span className="material-symbols-outlined text-[20px]">{msg.is_read ? 'mark_email_unread' : 'mark_email_read'}</span>
                  </button>
                  <button onClick={() => handleDelete(msg.id)} className="p-2.5 text-[var(--color-on-surface-variant)] hover:text-red-500 hover:bg-red-50 transition-colors" title="Eliminar">
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

      {replyModal && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setReplyModal(null)}>
          <div className="bg-white w-full max-w-xl mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[var(--color-warm-gray)]/40 flex items-center justify-between">
              <div>
                <h2 className="font-headline text-xl text-[var(--color-near-black)]">Responder a {replyModal.name}</h2>
                <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-1">{replyModal.email} {replyModal.phone ? `· ${replyModal.phone}` : ''}</p>
              </div>
              <button onClick={() => setReplyModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-warm-gray)]/30 transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-8">
              <div className="mb-5 p-5 bg-[var(--color-ivory)] font-inter text-sm text-[var(--color-on-surface)] leading-relaxed">{replyModal.message}</div>
              <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Tu respuesta</label>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escribe tu respuesta..." rows={5}
                className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all resize-none" autoFocus />
            </div>
            <div className="p-8 border-t border-[var(--color-warm-gray)]/40 flex justify-end gap-4">
              <button onClick={() => setReplyModal(null)} className="px-6 py-3 border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] font-inter text-xs uppercase tracking-[0.15em] hover:border-[var(--color-near-black)] transition-all">Cancelar</button>
              <button onClick={handleSendReply} disabled={sending || !replyText.trim()}
                className="px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.15em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all disabled:opacity-50 flex items-center gap-2">
                {sending ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
