import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const DEFAULT_KEYS = ['site_logo_url', 'site_logo_alt', 'hero_bg_image_url', 'hero_bg_image_alt', 'about_image_url', 'about_image_alt'];

function PreviewCard({ label, imageUrl, alt, onImageClick, onRemove, type }) {
  return (
    <div className="group relative bg-white border border-[var(--color-warm-gray)]/40 overflow-hidden">
      <button onClick={onImageClick} className="block w-full h-40 lg:h-52 relative overflow-hidden bg-[var(--color-ivory-dark)]">
        {imageUrl ? (
          <img src={imageUrl} alt={alt || label}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <span className="material-symbols-outlined text-3xl text-[var(--color-warm-gray-dark)] mb-2">{type === 'logo' ? 'image' : 'add_photo_alternate'}</span>
            <span className="font-inter text-xs text-[var(--color-on-surface-variant)]">Haz clic para cargar</span>
          </div>
        )}
        {imageUrl && (
          <div className="absolute inset-0 bg-[var(--color-near-black)]/0 group-hover:bg-[var(--color-near-black)]/30 transition-all duration-500 flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 material-symbols-outlined text-3xl">camera_alt</span>
          </div>
        )}
      </button>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-gold)] font-medium mb-1">{label}</p>
            {imageUrl ? (
              <p className="font-inter text-xs text-[var(--color-on-surface-variant)] truncate">{alt || 'Sin descripción'}</p>
            ) : (
              <p className="font-inter text-xs text-[var(--color-warm-gray-dark)] italic">Sin imagen</p>
            )}
          </div>
          {imageUrl && (
            <button onClick={onRemove} className="shrink-0 w-7 h-7 flex items-center justify-center hover:bg-red-50 rounded-full transition-colors" title="Eliminar">
              <span className="material-symbols-outlined text-[16px] text-red-400">close</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSiteDesign() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadsBusy, setUploadsBusy] = useState({});
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);

  const handleFileSelect = (target) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

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

  const setKey = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const k of DEFAULT_KEYS) await api.updateSetting(k, settings[k] ?? '');
      addToast('Diseño del sitio guardado correctamente');
    } catch { addToast('Error al guardar diseño'); }
    finally { setSaving(false); }
  };

  const handleUpload = async () => {
    const el = fileInputRef.current;
    if (!el || !el.files?.[0] || !uploadTarget) return;
    const file = el.files[0];
    const formData = new FormData();
    formData.append('image', file);
    const kind = uploadTarget;
    try {
      setUploadsBusy(b => ({ ...b, [kind]: true }));
      const res = await api.uploadCatalog(formData);
      setKey(kind === 'logo' ? 'site_logo_url' : kind === 'hero' ? 'hero_bg_image_url' : 'about_image_url', res.url);
      addToast('Imagen subida correctamente');
    } catch { addToast('Error subiendo la imagen'); }
    finally {
      setUploadsBusy(b => ({ ...b, [kind]: false }));
      setUploadTarget(null);
      el.value = '';
    }
  };

  const sections = useMemo(() => [
    {
      id: 'logo',
      title: 'Logo',
      desc: 'Logo de la tienda que aparece en el Header de la landing page.',
      label: 'Logo',
      urlKey: 'site_logo_url',
      altKey: 'site_logo_alt',
      type: 'logo',
      preview: settings.site_logo_url,
    },
    {
      id: 'hero',
      title: 'Portada (Hero)',
      desc: 'Imagen de fondo grande en la sección principal de la landing page.',
      label: 'Hero Background',
      urlKey: 'hero_bg_image_url',
      altKey: 'hero_bg_image_alt',
      type: 'hero',
      preview: settings.hero_bg_image_url,
    },
    {
      id: 'about',
      title: 'Historia (About)',
      desc: 'Imagen lateral en la sección "Nuestra Historia" de la landing page.',
      label: 'About Image',
      urlKey: 'about_image_url',
      altKey: 'about_image_alt',
      type: 'about',
      preview: settings.about_image_url,
    },
  ], [settings]);

  useEffect(() => {
    if (fileInputRef.current && uploadTarget) handleUpload();
  }, [settings]); // trigger when file input changes indirectly

  const handleFileChange = () => {
    if (fileInputRef.current?.files?.[0] && uploadTarget) {
      handleUpload();
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Diseño del sitio</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Cargando configuraciones...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-[var(--color-warm-gray)]/40 overflow-hidden">
              <div className="h-40 lg:h-52 skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-24 skeleton rounded" />
                <div className="h-3 w-40 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Diseño del sitio</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Personaliza la apariencia de tu tienda online</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300 disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {sections.map(section => (
          <PreviewCard
            key={section.id}
            label={section.title}
            imageUrl={section.preview}
            alt={settings[section.altKey]}
            type={section.type}
            onImageClick={() => handleFileSelect(section.type)}
            onRemove={() => {
              setKey(section.urlKey, '');
              setKey(section.altKey, '');
            }}
          />
        ))}
      </div>

      <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8 lg:p-10">
        <h2 className="font-headline text-xl text-[var(--color-near-black)] mb-8">Configuración avanzada</h2>
        <div className="space-y-10">
          {sections.map(section => (
            <div key={section.id} className="pb-8 border-b border-[var(--color-warm-gray)]/20 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 flex items-center justify-center border border-[var(--color-gold)]/30 text-[var(--color-gold)]">
                  <span className="material-symbols-outlined text-[16px]">{section.id === 'logo' ? 'image' : section.id === 'hero' ? 'wallpaper' : 'photo_library'}</span>
                </div>
                <div>
                  <h3 className="font-headline text-base text-[var(--color-near-black)]">{section.title}</h3>
                  <p className="font-inter text-xs text-[var(--color-on-surface-variant)]">{section.desc}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="admin-label mb-2 block">URL de la imagen</label>
                  <input value={settings[section.urlKey] ?? ''} onChange={e => setKey(section.urlKey, e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" placeholder="https://ejemplo.com/imagen.jpg" />
                  <p className="font-inter text-xs text-[var(--color-on-surface-variant)] mt-2">Pega una URL externa o sube una imagen local.</p>
                </div>
                <div>
                  <label className="admin-label mb-2 block">Texto alternativo (alt)</label>
                  <input value={settings[section.altKey] ?? ''} onChange={e => setKey(section.altKey, e.target.value)}
                    className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" placeholder="Descripción de la imagen" />
                </div>
              </div>
              <div className="mt-4">
                <button type="button" disabled={uploadsBusy[section.type]}
                  onClick={() => handleFileSelect(section.type)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--color-warm-gray)] text-[var(--color-on-surface-variant)] font-inter text-[10px] uppercase tracking-[0.12em] hover:border-[var(--color-near-black)] transition-all disabled:opacity-50">
                  <span className="material-symbols-outlined text-[14px]">upload</span>
                  {uploadsBusy[section.type] ? 'Subiendo...' : 'Subir imagen local'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-inter text-xs text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
          Los cambios se reflejan en la landing page después de guardar y recargar.
        </p>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300 disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
