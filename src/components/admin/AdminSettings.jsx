import { useState, useEffect } from 'react';
import { api } from '../../services/api';

const FIELDS = [
  { key: 'brand_name', label: 'Nombre de marca' },
  { key: 'tagline', label: 'Eslogan' },
  { key: 'hero_headline', label: 'Título del Hero' },
  { key: 'hero_description', label: 'Descripción del Hero' },
  { key: 'cta_text', label: 'Texto del botón CTA' },
  { key: 'footer_title', label: 'Título del Footer' },
  { key: 'footer_description', label: 'Descripción del Footer' },
  { key: 'contact_email', label: 'Email de contacto' },
  { key: 'contact_location', label: 'Ubicación' },
];

export function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key) => {
    try {
      await api.updateSetting(key, settings[key]);
      alert('Guardado');
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Cargando...</p>;

  return (
    <div style={{ padding: '0 24px 40px', maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: 32 }}>Configuración del Sitio</h2>
      {FIELDS.map(({ key, label }) => (
        <div key={key} style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>{label}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={settings[key] || ''}
              onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 2 }}
            />
            <button onClick={() => handleSave(key)}
              style={{ padding: '10px 24px', background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Guardar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
