import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminSettings() {
  const [keys, setKeys] = useState({});
  const { addToast } = useToast();

  useEffect(() => {
    api.getSettings().then(s => setKeys(Object.keys(s).reduce((acc, k) => ({ ...acc, [k]: s[k] }), {}))).catch(() => {});
  }, []);

  const handleSave = async (key) => {
    await api.updateSetting(key, keys[key]);
    addToast(`"${key}" actualizado correctamente`);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Configuración</h1>
        <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Ajustes del sitio</p>
      </div>

      <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8">
        <div className="space-y-6">
          {Object.entries(keys).map(([key, value]) => (
            <div key={key} className="flex items-center gap-5">
              <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium w-44 flex-shrink-0">{key.replace(/_/g, ' ')}</label>
              <input value={value} onChange={e => setKeys(k => ({ ...k, [key]: e.target.value }))}
                className="flex-1 px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" />
              <button onClick={() => handleSave(key)}
                className="px-5 py-3 bg-[var(--color-near-black)] text-white font-inter text-[10px] uppercase tracking-[0.15em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all whitespace-nowrap">Guardar</button>
            </div>
          ))}
          {Object.keys(keys).length === 0 && (
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)] text-center py-8">No hay configuraciones disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}
