import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const DEFAULT_KEYS = ['site_logo_url', 'site_logo_alt', 'hero_bg_image_url', 'hero_bg_image_alt', 'about_image_url', 'about_image_alt'];

export default function AdminSiteDesign() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadsBusy, setUploadsBusy] = useState({ hero: false, about: false, logo: false });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getSettings()
      .then((s) => {
        if (!mounted) return;
        const base = {};
        for (const k of DEFAULT_KEYS) base[k] = s[k] ?? '';
        setSettings({ ...base, ...s });
      })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const rows = useMemo(() => [
    { label: 'Logo (URL)', key: 'site_logo_url', type: 'image' },
    { label: 'Hero Fondo (URL)', key: 'hero_bg_image_url', type: 'image' },
    { label: 'Historia Fondo (URL)', key: 'about_image_url', type: 'image' },
  ], []);

  const setKey = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const handleSave = async () => {
    try {
      for (const k of DEFAULT_KEYS) await api.updateSetting(k, settings[k] ?? '');
      addToast('Diseño del sitio guardado');
    } catch { addToast('Error al guardar diseño'); }
  };

  const handleUpload = async (kind, key) => {
    const inputId = kind === 'logo' ? 'file-logo' : kind === 'hero' ? 'file-hero' : 'file-about';
    const el = document.getElementById(inputId);
    if (!el || !('files' in el) || !el.files || !el.files[0]) return;
    const file = el.files[0];
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploadsBusy(b => ({ ...b, [kind]: true }));
      const res = await api.uploadCatalog(formData);
      setKey(key, res.url);
      addToast('Imagen subida correctamente');
    } catch { addToast('Error subiendo la imagen'); }
    finally { setUploadsBusy(b => ({ ...b, [kind]: false })); }
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="mb-10"><h1 className="font-headline text-3xl text-[var(--color-near-black)]">Diseño del sitio</h1><p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Cargando...</p></div>
        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8 font-inter text-sm text-[var(--color-on-surface-variant)]">Cargando configuraciones...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Diseño del sitio</h1>
        <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Cambia logo, portada (Hero) y foto de la historia.</p>
      </div>

      <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8">
        <div className="space-y-10">
          <div className="space-y-5">
            <h2 className="font-inter text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] font-medium">1) Logo</h2>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Logo URL (Header)</label>
                <input value={settings.site_logo_url ?? ''} onChange={e => setKey('site_logo_url', e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" />
                <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-2">Pega una URL o sube una imagen.</p>
              </div>
              <div className="space-y-4">
                <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium block">Subir logo</label>
                <div className="flex items-center gap-3">
                  <input id="file-logo" type="file" accept="image/*" className="text-sm font-inter" />
                  <button type="button" disabled={uploadsBusy.logo} onClick={() => handleUpload('logo', 'site_logo_url')}
                    className="px-4 py-2.5 border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] font-inter text-[10px] uppercase tracking-[0.12em] hover:border-[var(--color-near-black)] transition-all disabled:opacity-50">
                    {uploadsBusy.logo ? 'Subiendo...' : 'Subir'}
                  </button>
                </div>
                <div className="h-24 flex items-center justify-center border border-[var(--color-warm-gray)]/40 overflow-hidden">
                  {settings.site_logo_url ? (
                    <img src={settings.site_logo_url} alt="Logo" className="h-full w-auto object-contain" />
                  ) : (
                    <span className="font-inter text-xs text-[var(--color-on-surface-variant)]">Vista previa</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="font-inter text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] font-medium">2) Imagen de portada (Hero)</h2>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Hero URL (fondo)</label>
                <input value={settings.hero_bg_image_url ?? ''} onChange={e => setKey('hero_bg_image_url', e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" />
              </div>
              <div className="space-y-4">
                <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium block">Subir imagen</label>
                <div className="flex items-center gap-3">
                  <input id="file-hero" type="file" accept="image/*" className="text-sm font-inter" />
                  <button type="button" disabled={uploadsBusy.hero} onClick={() => handleUpload('hero', 'hero_bg_image_url')}
                    className="px-4 py-2.5 border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] font-inter text-[10px] uppercase tracking-[0.12em] hover:border-[var(--color-near-black)] transition-all disabled:opacity-50">
                    {uploadsBusy.hero ? 'Subiendo...' : 'Subir'}
                  </button>
                </div>
                <div className="h-24 flex items-center justify-center border border-[var(--color-warm-gray)]/40 overflow-hidden">
                  {settings.hero_bg_image_url ? (
                    <img src={settings.hero_bg_image_url} alt="Hero" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-inter text-xs text-[var(--color-on-surface-variant)]">Vista previa</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="font-inter text-[11px] uppercase tracking-[0.18em] text-[var(--color-gold)] font-medium">3) Imagen de la historia (About)</h2>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Historia URL (imagen derecha)</label>
                <input value={settings.about_image_url ?? ''} onChange={e => setKey('about_image_url', e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" />
              </div>
              <div className="space-y-4">
                <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium block">Subir imagen</label>
                <div className="flex items-center gap-3">
                  <input id="file-about" type="file" accept="image/*" className="text-sm font-inter" />
                  <button type="button" disabled={uploadsBusy.about} onClick={() => handleUpload('about', 'about_image_url')}
                    className="px-4 py-2.5 border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] font-inter text-[10px] uppercase tracking-[0.12em] hover:border-[var(--color-near-black)] transition-all disabled:opacity-50">
                    {uploadsBusy.about ? 'Subiendo...' : 'Subir'}
                  </button>
                </div>
                <div className="h-24 flex items-center justify-center border border-[var(--color-warm-gray)]/40 overflow-hidden">
                  {settings.about_image_url ? (
                    <img src={settings.about_image_url} alt="Historia" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-inter text-xs text-[var(--color-on-surface-variant)]">Vista previa</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-2">
            <button type="button" onClick={handleSave}
              className="px-8 py-3.5 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>

      <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-6">* Para que aparezcan bien los cambios, actualiza la página de la tienda.</p>
    </div>
  );
}
