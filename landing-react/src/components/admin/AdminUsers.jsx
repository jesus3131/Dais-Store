import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'products', label: 'Productos', icon: 'inventory_2' },
  { id: 'orders', label: 'Pedidos', icon: 'receipt_long' },
  { id: 'customers', label: 'Clientes', icon: 'people' },
  { id: 'coupons', label: 'Cupones', icon: 'confirmation_number' },
  { id: 'inventory', label: 'Inventario', icon: 'shelf_auto' },
  { id: 'accounting', label: 'Contabilidad', icon: 'account_balance' },
  { id: 'reports', label: 'Reportes', icon: 'bar_chart' },
  { id: 'settings', label: 'Configuración', icon: 'settings' },
  { id: 'users', label: 'Usuarios', icon: 'manage_accounts' },
  { id: 'page-builder', label: 'Constructor', icon: 'dashboard_customize' },
  { id: 'site-design', label: 'Diseño del Sitio', icon: 'palette' },
  { id: 'catalogs', label: 'Catálogos PDF', icon: 'description' },
  { id: 'messages', label: 'Mensajes', icon: 'mail' },
];

const emptyForm = { username: '', password: '', email: '', full_name: '', role: 'worker', modules: [], is_active: true };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    api.getUsers().then(setUsers).catch(() => addToast('Error al cargar usuarios', 'error')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (u) => {
    setForm({
      username: u.username, password: '', email: u.email || '', full_name: u.full_name || '',
      role: u.role || 'worker', modules: u.modules || [], is_active: u.is_active,
    });
    setModal({ type: 'edit', id: u.id });
  };

  const toggleModule = (modId) => {
    setForm(f => ({
      ...f,
      modules: f.modules.includes(modId) ? f.modules.filter(m => m !== modId) : [...f.modules, modId],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.username) { addToast('El usuario es obligatorio', 'error'); return; }
    if (modal === 'create' && !form.password) { addToast('La contraseña es obligatoria', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (modal.type === 'edit') { await api.updateUser(modal.id, payload); addToast('Usuario actualizado'); }
      else { await api.createUser(payload); addToast('Usuario creado'); }
      setModal(null); load();
    } catch (err) { addToast(err.message || 'Error al guardar', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`¿Eliminar al usuario "${username}"?`)) return;
    try { await api.deleteUser(id); addToast('Usuario eliminado', 'info'); load(); }
    catch (err) { addToast(err.message || 'Error al eliminar', 'error'); }
  };

  return (
    <div className="max-w-6xl">
      <div className="admin-section-header">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Usuarios</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">{users.length} usuario{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="admin-btn-primary">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--color-warm-gray)] border-t-[var(--color-gold)] rounded-full" />
        </div>
      ) : (
        <div className="bg-white border border-[rgba(0,0,0,0.04)] overflow-x-auto">
          <table className="w-full admin-table-modern">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Módulos</th>
                <th className="text-center">Activo</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><span className="font-headline text-sm text-[var(--color-near-black)]">{u.username}</span></td>
                  <td><span className="font-inter text-xs text-[var(--color-on-surface)]">{u.full_name || '—'}</span></td>
                  <td><span className="font-inter text-xs text-[var(--color-on-surface-variant)]">{u.email || '—'}</span></td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded ${
                      u.role === 'admin' ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)]' : 'bg-[rgba(0,0,0,0.04)] text-[var(--color-on-surface-variant)]'
                    }`}>{u.role}</span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(u.modules || []).includes('*')
                        ? <span className="text-[10px] text-[var(--color-on-surface-variant)]">Todos</span>
                        : (u.modules || []).slice(0, 3).map(m => (
                            <span key={m} className="px-1.5 py-0.5 bg-[rgba(0,0,0,0.03)] text-[9px] uppercase tracking-wider rounded">{m}</span>
                          ))
                      }
                      {(u.modules || []).length > 3 && <span className="text-[9px] text-[var(--color-on-surface-variant)]">+{u.modules.length - 3}</span>}
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`w-2 h-2 inline-block rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-300'}`} />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-gold)] transition-colors rounded hover:bg-[rgba(232,207,166,0.08)]" title="Editar">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(u.id, u.username)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors rounded hover:bg-red-50" title="Eliminar">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">
                  No hay usuarios registrados
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-[var(--color-near-black)]/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between">
              <h2 className="font-headline text-xl text-[var(--color-near-black)]">
                {modal.type === 'edit' ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[rgba(0,0,0,0.04)] transition-colors rounded">
                <span className="material-symbols-outlined text-[var(--color-near-black)] text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Usuario <span className="text-red-400">*</span></label>
                    <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      className="admin-input" required disabled={modal.type === 'edit'} />
                  </div>
                  <div>
                    <label className="admin-label">Contraseña {modal === 'create' && <span className="text-red-400">*</span>}</label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      className="admin-input" placeholder={modal.type === 'edit' ? 'Dejar vacío para no cambiar' : ''} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="admin-label">Nombre Completo</label>
                    <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="admin-input" />
                  </div>
                  <div>
                    <label className="admin-label">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="admin-input" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="admin-label mb-0">Rol</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="admin-input w-auto">
                    <option value="worker">Trabajador</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer ml-4">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-[var(--color-gold)]" />
                    <span className="font-inter text-xs text-[var(--color-on-surface-variant)]">Activo</span>
                  </label>
                </div>

                {form.role === 'worker' && (
                  <div>
                    <label className="admin-label">Módulos permitidos</label>
                    <p className="font-inter text-[11px] text-[var(--color-on-surface-variant)] mb-4">Selecciona los módulos a los que este usuario podrá acceder</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {MODULES.map(m => (
                        <label key={m.id} className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                          form.modules.includes(m.id) ? 'border-[var(--color-gold)] bg-[rgba(232,207,166,0.06)]' : 'border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.15)]'
                        }`}>
                          <input type="checkbox" checked={form.modules.includes(m.id)} onChange={() => toggleModule(m.id)}
                            className="w-4 h-4 accent-[var(--color-gold)]" />
                          <span className="material-symbols-outlined text-[16px] text-[var(--color-on-surface-variant)]">{m.icon}</span>
                          <span className="font-inter text-xs text-[var(--color-near-black)]">{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {form.role === 'admin' && (
                  <div className="p-4 bg-[rgba(232,207,166,0.08)] border border-[var(--color-gold)]/20 rounded">
                    <p className="font-inter text-xs text-[var(--color-on-surface-variant)]">
                      <span className="material-symbols-outlined text-[14px] align-text-bottom">info</span>
                      Los administradores tienen acceso a todos los módulos.
                    </p>
                  </div>
                )}
              </div>
              <div className="p-8 border-t border-[rgba(0,0,0,0.04)] flex justify-end gap-4">
                <button type="button" onClick={() => setModal(null)} className="admin-btn-outline">Cancelar</button>
                <button type="submit" disabled={saving} className="admin-btn">
                  {saving ? 'Guardando...' : modal.type === 'edit' ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
