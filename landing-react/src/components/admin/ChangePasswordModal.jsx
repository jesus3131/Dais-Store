import { useState } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function ChangePasswordModal({ onClose }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return addToast('Las contraseñas nuevas no coinciden', 'error');
    if (form.newPassword.length < 6) return addToast('La contraseña debe tener al menos 6 caracteres', 'error');
    setSaving(true);
    try {
      await api.changePassword(form.currentPassword, form.newPassword);
      addToast('Contraseña actualizada exitosamente');
      onClose();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-headline text-xl text-[var(--color-near-black)]">Cambiar Contraseña</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors rounded">
            <span className="material-symbols-outlined text-gray-400 text-[18px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="text-xs font-inter text-gray-500 mb-1.5 block">Contraseña Actual</label>
            <input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
              className="w-full border border-gray-100 rounded px-4 py-2.5 text-sm font-inter focus:outline-none focus:border-gray-300" required />
          </div>
          <div>
            <label className="text-xs font-inter text-gray-500 mb-1.5 block">Nueva Contraseña</label>
            <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
              className="w-full border border-gray-100 rounded px-4 py-2.5 text-sm font-inter focus:outline-none focus:border-gray-300" required minLength={6} />
          </div>
          <div>
            <label className="text-xs font-inter text-gray-500 mb-1.5 block">Confirmar Nueva Contraseña</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              className="w-full border border-gray-100 rounded px-4 py-2.5 text-sm font-inter focus:outline-none focus:border-gray-300" required minLength={6} />
          </div>
          <div className="flex justify-end gap-4 pt-2">
            <button type="button" onClick={onClose}
              className="text-sm font-inter text-gray-500 px-5 py-2 border border-gray-100 rounded hover:border-gray-200 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="text-sm font-inter text-white bg-[var(--color-near-black)] px-6 py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
