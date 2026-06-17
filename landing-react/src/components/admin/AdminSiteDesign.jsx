import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerFloatingNotification } from '../ui/FloatingSaleNotification.jsx';

const IMAGE_KEYS = ['site_logo_url', 'site_logo_alt', 'hero_bg_image_url', 'hero_bg_image_alt', 'about_image_url', 'about_image_2_url', 'about_image_alt'];

const COLOR_KEYS = [
  { key: 'color-gold', label: 'Dorado', default: '#e8cfa6' },
  { key: 'color-gold-light', label: 'Dorado claro', default: '#f5e8d0' },
  { key: 'color-gold-dark', label: 'Dorado oscuro', default: '#c9a84b' },
  { key: 'color-pastel-pink', label: 'Rosado pastel', default: '#fdf0f3' },
  { key: 'color-pastel-pink-dark', label: 'Rosado pastel oscuro', default: '#fce4ea' },
  { key: 'color-pastel-white', label: 'Blanco pastel', default: '#fffbfc' },
  { key: 'color-near-black', label: 'Texto negro', default: '#1c1b1b' },
  { key: 'color-on-surface-variant', label: 'Texto gris', default: '#4a4440' },
  { key: 'color-warm-gray', label: 'Gris bordes', default: '#f0e0e4' },
  { key: 'color-ivory', label: 'Fondo marfil', default: '#fdf0f3' },
];

const SETTINGS_SECTIONS = [
  {
    id: 'brand',
    title: 'Identidad de marca',
    icon: 'brand_awareness',
    fields: [
      { key: 'site_name', label: 'Nombre de la tienda', type: 'text', placeholder: 'DAIS' },
      { key: 'site_tagline', label: 'Eslogan', type: 'text', placeholder: 'Luxury Beauty & Skincare' },
      { key: 'site_description', label: 'Descripción', type: 'textarea', placeholder: 'Distribuidora mayorista de productos de belleza premium.' },
    ],
  },
  {
    id: 'contact',
    title: 'Información de contacto',
    icon: 'contact_phone',
    fields: [
      { key: 'address', label: 'Dirección', type: 'text', placeholder: 'Montería, Córdoba, Colombia' },
      { key: 'phone', label: 'Teléfono', type: 'text', placeholder: '+57 300 000 0000' },
      { key: 'email', label: 'Correo electrónico', type: 'text', placeholder: 'info@daisstore.co' },
      { key: 'whatsapp', label: 'WhatsApp (número)', type: 'text', placeholder: '573000000000' },
    ],
  },
  {
    id: 'social',
    title: 'Redes sociales',
    icon: 'public',
    fields: [
      { key: 'social_instagram', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/dais_store' },
      { key: 'social_facebook', label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/daisstore' },
      { key: 'social_tiktok', label: 'TikTok URL', type: 'text', placeholder: 'https://tiktok.com/@dais_store' },
    ],
  },
  {
    id: 'footer',
    title: 'Footer',
    icon: 'call_to_action',
    fields: [
      { key: 'footer_tagline', label: 'Texto del footer', type: 'text', placeholder: 'Distribuidora mayorista de productos de belleza premium.' },
      { key: 'business_hours', label: 'Horario de atención', type: 'text', placeholder: 'Lun - Sáb: 8:00 AM - 6:00 PM' },
    ],
  },
];

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

function ColorInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block font-inter text-[9px] uppercase tracking-[0.1em] text-gray-500 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={onChange}
          className="w-10 h-10 p-0.5 border border-gray-200 rounded cursor-pointer" />
        <input type="text" value={value} onChange={onChange}
          className="flex-1 px-2 py-1.5 border border-[var(--color-warm-gray)] font-inter text-xs focus:outline-none focus:border-[var(--color-gold)] transition-all" />
      </div>
    </div>
  );
}

export default function AdminSiteDesign() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState({});
  const [tokens, setTokens] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('images');
  const [uploadsBusy, setUploadsBusy] = useState({});
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);

  const handleFileSelect = (target) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getSettings().catch(() => ({})),
      api.getDesignTokens().catch(() => ({})),
    ]).then(([s, t]) => {
      if (!mounted) return;
      const base = {};
      for (const k of IMAGE_KEYS) base[k] = s[k] ?? '';
      for (const sec of SETTINGS_SECTIONS) {
        for (const f of sec.fields) base[f.key] = s[f.key] ?? '';
      }
      setSettings({ ...base, ...s });
      const tokenDefaults = {};
      for (const ck of COLOR_KEYS) tokenDefaults[ck.key] = t[ck.key] || ck.default;
      setTokens({ ...tokenDefaults, ...t });
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const setKey = (key, value) => setSettings(s => ({ ...s, [key]: value }));
  const setToken = (key, value) => setTokens(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = [];
      for (const k of IMAGE_KEYS) promises.push(api.updateSetting(k, settings[k] ?? ''));
      for (const sec of SETTINGS_SECTIONS) {
        for (const f of sec.fields) {
          promises.push(api.updateSetting(f.key, settings[f.key] ?? ''));
        }
      }
      await Promise.all(promises);
      const tokenArr = Object.entries(tokens).map(([token_name, token_value]) => ({
        token_name, token_value, category: 'color',
      }));
      await api.bulkUpdateDesignTokens(tokenArr);
      addToast('Diseño del sitio guardado correctamente');
      triggerFloatingNotification({ name: 'Diseño sitio', product: 'cambios guardados', icon: 'palette', time: 'recién' });
    } catch {
      addToast('Error al guardar diseño');
    } finally { setSaving(false); }
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
      const res = await api.uploadImage(formData);
      const keyMap = { logo: 'site_logo_url', hero: 'hero_bg_image_url', about: 'about_image_url', about2: 'about_image_2_url' };
      setKey(keyMap[kind] || 'about_image_url', res.url);
      addToast('Imagen subida correctamente');
      triggerFloatingNotification({ name: 'Imagen subida', product: kind, icon: 'image', time: 'recién' });
    } catch { addToast('Error subiendo la imagen'); }
    finally {
      setUploadsBusy(b => ({ ...b, [kind]: false }));
      setUploadTarget(null);
      el.value = '';
    }
  };

  const imageSections = useMemo(() => [
    {
      id: 'logo', title: 'Logo', desc: 'Logo de la tienda que aparece en el Header.',
      label: 'Logo', urlKey: 'site_logo_url', altKey: 'site_logo_alt', type: 'logo',
      preview: settings.site_logo_url,
    },
    {
      id: 'hero', title: 'Portada (Hero)', desc: 'Imagen de fondo en la sección principal.',
      label: 'Hero Background', urlKey: 'hero_bg_image_url', altKey: 'hero_bg_image_alt', type: 'hero',
      preview: settings.hero_bg_image_url,
    },
    {
      id: 'about', title: 'Nosotros (About)', desc: 'Imágenes laterales en la sección "Nuestra Historia".',
      label: 'About Image 1', urlKey: 'about_image_url', altKey: 'about_image_alt', type: 'about',
      preview: settings.about_image_url,
    },
    {
      id: 'about2', title: 'Nosotros (About) 2', desc: 'Segunda imagen para la sección "Nuestra Historia".',
      label: 'About Image 2', urlKey: 'about_image_2_url', altKey: 'about_image_alt', type: 'about2',
      preview: settings.about_image_2_url,
    },
  ], [settings]);

  const handleFileChange = () => {
    if (fileInputRef.current?.files?.[0] && uploadTarget) handleUpload();
  };

  const TABS = [
    { id: 'images', label: 'Imágenes', icon: 'image' },
    { id: 'brand', label: 'Marca', icon: 'brand_awareness' },
    { id: 'colors', label: 'Colores', icon: 'palette' },
    { id: 'contact', label: 'Contacto', icon: 'contact_phone' },
    { id: 'social', label: 'Redes', icon: 'public' },
    { id: 'footer', label: 'Footer', icon: 'call_to_action' },
  ];

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
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Diseño del sitio</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Personaliza la apariencia global de tu tienda</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.18em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all duration-300 disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="flex gap-1 mb-8 border-b border-[var(--color-warm-gray)]/40 overflow-x-auto pb-px">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-5 py-3 font-inter text-[11px] uppercase tracking-[0.1em] transition-all whitespace-nowrap border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[var(--color-near-black)] text-[var(--color-near-black)] font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'images' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {imageSections.map(section => (
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
            <h2 className="font-headline text-xl text-[var(--color-near-black)] mb-8">Configuración de imágenes</h2>
            <div className="space-y-10">
              {imageSections.map(section => (
                <div key={section.id} className="pb-8 border-b border-[var(--color-warm-gray)]/20 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 flex items-center justify-center border border-[var(--color-gold)]/30 text-[var(--color-gold)]">
                      <span className="material-symbols-outlined text-[16px]">{section.id === 'logo' ? 'image' : section.id === 'hero' ? 'wallpaper' : section.id.startsWith('about') ? 'auto_stories' : 'photo_library'}</span>
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
        </div>
      )}

      {activeTab === 'colors' && (
        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 flex items-center justify-center border border-[var(--color-gold)]/30 text-[var(--color-gold)]">
              <span className="material-symbols-outlined text-[16px]">palette</span>
            </div>
            <div>
              <h2 className="font-headline text-xl text-[var(--color-near-black)]">Colores del tema</h2>
              <p className="font-inter text-xs text-[var(--color-on-surface-variant)]">Personaliza la paleta de colores de la tienda</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {COLOR_KEYS.map(ck => (
              <ColorInput key={ck.key} label={ck.label}
                value={tokens[ck.key] || ck.default}
                onChange={e => setToken(ck.key, e.target.value)} />
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-[var(--color-warm-gray)]/20">
            <p className="font-inter text-[11px] text-[var(--color-on-surface-variant)] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Los colores se aplican como variables CSS en toda la landing page.
            </p>
          </div>
        </div>
      )}

      {['brand', 'contact', 'social', 'footer'].includes(activeTab) && (
        <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8 lg:p-10">
          {SETTINGS_SECTIONS.filter(s => s.id === activeTab).map(sec => (
            <div key={sec.id}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 flex items-center justify-center border border-[var(--color-gold)]/30 text-[var(--color-gold)]">
                  <span className="material-symbols-outlined text-[16px]">{sec.icon}</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl text-[var(--color-near-black)]">{sec.title}</h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {sec.fields.map(f => (
                  <div key={f.key} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="admin-label mb-2 block">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea value={settings[f.key] ?? ''} onChange={e => setKey(f.key, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all resize-none" placeholder={f.placeholder} />
                    ) : (
                      <input value={settings[f.key] ?? ''} onChange={e => setKey(f.key, e.target.value)}
                        className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" placeholder={f.placeholder} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
