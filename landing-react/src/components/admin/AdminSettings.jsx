import { useState, useEffect } from 'react';
import { api } from '../../services/api.js';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [keys, setKeys] = useState({});

  useEffect(() => {
    api.getSettings().then(s => {
      setSettings(s);
      setKeys(Object.keys(s).reduce((acc, k) => ({ ...acc, [k]: s[k] }), {}));
    }).catch(() => {});
  }, []);

  const handleSave = async (key) => {
    await api.updateSetting(key, keys[key]);
    const updated = await api.getSettings();
    setSettings(updated);
  };

  return (
    <div>
      <h1 className="font-headline text-2xl text-[var(--color-on-surface)] mb-6">Configuración</h1>
      <div className="bg-white rounded-xl luxury-shadow p-6 max-w-2xl">
        <div className="space-y-4">
          {Object.entries(keys).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <label className="font-manrope text-sm text-[var(--color-on-surface-variant)] w-40 capitalize">{key.replace(/_/g, ' ')}</label>
              <input
                value={value}
                onChange={e => setKeys(k => ({ ...k, [key]: e.target.value }))}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button onClick={() => handleSave(key)}
                className="px-4 py-2 bg-[var(--color-primary)] text-white font-manrope text-xs rounded-full hover:bg-[var(--color-on-tertiary-container)] transition-all">
                Guardar
              </button>
            </div>
          ))}
        </div>
        {Object.keys(keys).length === 0 && (
          <p className="font-manrope text-[var(--color-outline)]">No hay configuraciones disponibles</p>
        )}
      </div>
    </div>
  );
}
