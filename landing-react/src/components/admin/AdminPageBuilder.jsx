import { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

const SECTION_TYPES = [
  { type: 'hero', label: 'Hero (Portada)', icon: 'wallpaper' },
  { type: 'how-it-works', label: 'Cómo funciona', icon: 'menu_book' },
  { type: 'categories', label: 'Categorías', icon: 'category' },
  { type: 'catalog', label: 'Catálogo', icon: 'inventory_2' },
  { type: 'testimonials', label: 'Testimonios', icon: 'star' },
  { type: 'branding', label: 'Marcas', icon: 'spa' },
  { type: 'about', label: 'Nosotros', icon: 'info' },
  { type: 'faq', label: 'FAQ', icon: 'help' },
  { type: 'instagram-feed', label: 'Instagram', icon: 'camera' },
  { type: 'newsletter', label: 'Newsletter', icon: 'mail' },
  { type: 'prefooter', label: 'Pre Footer', icon: 'contact_page' },
];

function SectionEditor({ section, onChange }) {
  const c = section.content || {};
  const set = (key, val) => onChange(section.id, { content: { ...c, [key]: val } });
  const setNested = (key, idx, field, val) => {
    const arr = [...(c[key] || [])];
    if (!arr[idx]) arr[idx] = {};
    arr[idx] = { ...arr[idx], [field]: val };
    onChange(section.id, { content: { ...c, [key]: arr } });
  };
  const addNested = (key, empty) => onChange(section.id, { content: { ...c, [key]: [...(c[key] || []), empty] } });
  const removeNested = (key, idx) => onChange(section.id, { content: { ...c, [key]: (c[key] || []).filter((_, i) => i !== idx) } });

  switch (section.type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <Field label="Badge" val={c.badge} onChange={v => set('badge', v)} />
          <Field label="Título (usa \\n para saltos)" val={c.title} onChange={v => set('title', v)} textarea />
          <Field label="Subtítulo" val={c.subtitle} onChange={v => set('subtitle', v)} textarea />
          <Field label="Botón primario" val={c.btnPrimary} onChange={v => set('btnPrimary', v)} />
          <Field label="Botón secundario" val={c.btnSecondary} onChange={v => set('btnSecondary', v)} />
          <Field label="URL imagen fondo" val={c.bgImage} onChange={v => set('bgImage', v)} />
        </div>
      );
    case 'how-it-works':
      return (
        <div className="space-y-4">
          {(c.steps || []).map((step, i) => (
            <div key={i} className="p-4 border border-[var(--color-warm-gray)] relative">
              <button onClick={() => removeNested('steps', i)} className="absolute top-2 right-2 text-red-400 material-symbols-outlined text-[16px]">close</button>
              <p className="font-inter text-[10px] uppercase tracking-[0.1em] text-gray-400 mb-3">Paso {i + 1}</p>
              <Field label="Icono" val={step.icon} onChange={v => setNested('steps', i, 'icon', v)} />
              <Field label="Título" val={step.title} onChange={v => setNested('steps', i, 'title', v)} />
              <Field label="Descripción" val={step.desc} onChange={v => setNested('steps', i, 'desc', v)} textarea />
            </div>
          ))}
          <button onClick={() => addNested('steps', { icon: 'favorite', title: '', desc: '' })}
            className="text-[var(--color-gold)] font-inter text-xs uppercase tracking-[0.12em] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">add</span> Agregar paso
          </button>
        </div>
      );
    case 'categories':
      return (
        <div className="space-y-4">
          {(c.categories || []).map((cat, i) => (
            <div key={i} className="p-4 border border-[var(--color-warm-gray)] relative">
              <button onClick={() => removeNested('categories', i)} className="absolute top-2 right-2 text-red-400 material-symbols-outlined text-[16px]">close</button>
              <Field label="Nombre" val={cat.name} onChange={v => setNested('categories', i, 'name', v)} />
              <Field label="URL imagen" val={cat.image} onChange={v => setNested('categories', i, 'image', v)} />
            </div>
          ))}
          <button onClick={() => addNested('categories', { name: '', image: '' })}
            className="text-[var(--color-gold)] font-inter text-xs uppercase tracking-[0.12em] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">add</span> Agregar categoría
          </button>
        </div>
      );
    case 'testimonials':
      return (
        <div className="space-y-4">
          {(c.items || []).map((item, i) => (
            <div key={i} className="p-4 border border-[var(--color-warm-gray)] relative">
              <button onClick={() => removeNested('items', i)} className="absolute top-2 right-2 text-red-400 material-symbols-outlined text-[16px]">close</button>
              <Field label="Nombre" val={item.name} onChange={v => setNested('items', i, 'name', v)} />
              <Field label="Rol" val={item.role} onChange={v => setNested('items', i, 'role', v)} />
              <Field label="Texto" val={item.text} onChange={v => setNested('items', i, 'text', v)} textarea />
              <Field label="Rating (1-5)" val={String(item.rating || 5)} onChange={v => setNested('items', i, 'rating', Number(v) || 5)} />
            </div>
          ))}
          <button onClick={() => addNested('items', { name: '', role: '', text: '', rating: 5 })}
            className="text-[var(--color-gold)] font-inter text-xs uppercase tracking-[0.12em] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">add</span> Agregar testimonio
          </button>
        </div>
      );
    case 'branding':
      return (
        <div className="space-y-4">
          {(c.brands || []).map((brand, i) => (
            <div key={i} className="p-4 border border-[var(--color-warm-gray)] relative">
              <button onClick={() => removeNested('brands', i)} className="absolute top-2 right-2 text-red-400 material-symbols-outlined text-[16px]">close</button>
              <Field label="Nombre" val={brand.name} onChange={v => setNested('brands', i, 'name', v)} />
              <Field label="Icono" val={brand.icon} onChange={v => setNested('brands', i, 'icon', v)} />
            </div>
          ))}
          <button onClick={() => addNested('brands', { name: '', icon: 'spa' })}
            className="text-[var(--color-gold)] font-inter text-xs uppercase tracking-[0.12em] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">add</span> Agregar marca
          </button>
        </div>
      );
    case 'about':
      return (
        <div className="space-y-4">
          <Field label="Texto (usa \\n\\n para párrafos)" val={c.text} onChange={v => set('text', v)} textarea rows={6} />
          {(c.stats || []).map((stat, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Field label="Número" val={stat.number} onChange={v => setNested('stats', i, 'number', v)} />
              <Field label="Label" val={stat.label} onChange={v => setNested('stats', i, 'label', v)} />
              <button onClick={() => removeNested('stats', i)} className="text-red-400 material-symbols-outlined text-[16px] mt-6">close</button>
            </div>
          ))}
          <button onClick={() => addNested('stats', { number: '', label: '' })}
            className="text-[var(--color-gold)] font-inter text-xs uppercase tracking-[0.12em] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">add</span> Agregar estadística
          </button>
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-4">
          {(c.items || []).map((item, i) => (
            <div key={i} className="p-4 border border-[var(--color-warm-gray)] relative">
              <button onClick={() => removeNested('items', i)} className="absolute top-2 right-2 text-red-400 material-symbols-outlined text-[16px]">close</button>
              <Field label="Pregunta" val={item.q} onChange={v => setNested('items', i, 'q', v)} />
              <Field label="Respuesta" val={item.a} onChange={v => setNested('items', i, 'a', v)} textarea />
            </div>
          ))}
          <button onClick={() => addNested('items', { q: '', a: '' })}
            className="text-[var(--color-gold)] font-inter text-xs uppercase tracking-[0.12em] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">add</span> Agregar pregunta
          </button>
        </div>
      );
    case 'newsletter':
      return (
        <div className="space-y-4">
          <Field label="Título" val={c.title} onChange={v => set('title', v)} />
          <Field label="Subtítulo" val={c.subtitle} onChange={v => set('subtitle', v)} textarea />
          <Field label="Texto botón" val={c.btnText} onChange={v => set('btnText', v)} />
        </div>
      );
    case 'prefooter':
      return (
        <div className="space-y-4">
          <Field label="Dirección" val={c.address} onChange={v => set('address', v)} />
          <Field label="Teléfono" val={c.phone} onChange={v => set('phone', v)} />
          <Field label="Email" val={c.email} onChange={v => set('email', v)} />
        </div>
      );
    default:
      return <p className="font-inter text-xs text-gray-400 italic">Sin campos editables para esta sección.</p>;
  }
}

function Field({ label, val, onChange, textarea, rows }) {
  const Tag = textarea ? 'textarea' : 'input';
  const cls = "w-full px-3 py-2 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] transition-all";
  return (
    <div>
      <label className="block font-inter text-[10px] uppercase tracking-[0.1em] text-gray-500 mb-1">{label}</label>
      <Tag className={cls} value={val || ''} onChange={e => onChange(e.target.value)} rows={rows || 3} />
    </div>
  );
}

export default function AdminPageBuilder() {
  const { addToast } = useToast();
  const [sections, setSections] = useState([]);
  const [tokens, setTokens] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([api.getPageSections(), api.getDesignTokens()]);
      setSections(s);
      setTokens(t);
    } catch { addToast('Error al cargar datos del page builder', 'error'); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const updateSection = (id, data) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const moveSection = (id, dir) => {
    const idx = sections.findIndex(s => s.id === id);
    if (idx < 0) return;
    const arr = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setSections(arr.map((s, i) => ({ ...s, sort_order: i })));
  };

  const addSection = async (type) => {
    const label = SECTION_TYPES.find(s => s.type === type)?.label || type;
    const emptyContent = {};
    try {
      const s = await api.createPageSection({ type, title: label, content: emptyContent, sort_order: sections.length });
      setSections(prev => [...prev, s]);
      setExpanded(s.id);
      setShowAddPanel(false);
      addToast(`Sección "${label}" agregada`);
    } catch { addToast('Error al crear sección'); }
  };

  const toggleVisibility = async (id) => {
    const s = sections.find(x => x.id === id);
    if (!s) return;
    updateSection(id, { visible: !s.visible });
    try { await api.updatePageSection(id, { visible: !s.visible }); }
    catch { updateSection(id, { visible: s.visible }); addToast('Error al actualizar', 'error'); }
  };

  const deleteSection = async (id) => {
    const s = sections.find(x => x.id === id);
    if (!s) return;
    if (!window.confirm(`¿Eliminar la sección "${s.title}"?`)) return;
    setSections(prev => prev.filter(x => x.id !== id));
    try { await api.deletePageSection(id); addToast(`"${s.title}" eliminada`); }
    catch { setSections(prev => [...prev, s].sort((a, b) => a.sort_order - b.sort_order)); addToast('Error al eliminar', 'error'); }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const s of sections) {
        await api.updatePageSection(s.id, {
          title: s.title,
          content: s.content,
          sort_order: sections.indexOf(s),
          visible: s.visible,
        });
      }
      addToast('Todas las secciones guardadas');
    } catch { addToast('Error al guardar secciones', 'error'); }
    finally { setSaving(false); }
  };

  const handleSaveTokens = async () => {
    setSaving(true);
    try {
      const arr = Object.entries(tokens).map(([token_name, token_value]) => ({ token_name, token_value, category: 'color' }));
      await api.bulkUpdateDesignTokens(arr);
      addToast('Colores guardados — recarga la página para ver cambios');
    } catch { addToast('Error al guardar colores', 'error'); }
    finally { setSaving(false); }
  };

  const setToken = (name, value) => setTokens(prev => ({ ...prev, [name]: value }));

  const COLOR_KEYS = [
    { key: 'color-gold', label: 'Dorado' },
    { key: 'color-gold-light', label: 'Dorado claro' },
    { key: 'color-gold-dark', label: 'Dorado oscuro' },
    { key: 'color-pastel-pink', label: 'Rosado pastel' },
    { key: 'color-pastel-pink-dark', label: 'Rosado pastel oscuro' },
    { key: 'color-pastel-white', label: 'Blanco pastel' },
    { key: 'color-near-black', label: 'Texto negro' },
    { key: 'color-on-surface-variant', label: 'Texto gris' },
    { key: 'color-warm-gray', label: 'Gris bordes' },
    { key: 'color-ivory', label: 'Fondo marfil' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-warm-gray)] border-t-[var(--color-gold)] rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Constructor de página</h1>
          <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Arrastra, edita y organiza cada sección de tu tienda</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddPanel(!showAddPanel)}
            className="admin-btn-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Añadir sección
          </button>
          <button onClick={handleSaveAll} disabled={saving}
            className="admin-btn-primary">
            {saving ? 'Guardando...' : 'Guardar todo'}
          </button>
        </div>
      </div>

      {showAddPanel && (
        <div className="bg-white border border-[var(--color-warm-gray)] p-6 mb-10">
          <h3 className="font-inter text-xs uppercase tracking-[0.12em] text-gray-500 mb-4">Selecciona tipo de sección</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SECTION_TYPES.map(st => (
              <button key={st.type} onClick={() => addSection(st.type)}
                className="flex items-center gap-3 p-4 border border-[var(--color-warm-gray)] hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 transition-all text-left">
                <span className="material-symbols-outlined text-[var(--color-gold)]">{st.icon}</span>
                <span className="font-inter text-sm text-[var(--color-near-black)]">{st.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={section.id} className={`bg-white border border-[var(--color-warm-gray)] transition-all ${!section.visible ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpanded(expanded === section.id ? null : section.id)}>
              <div className="flex items-center gap-4">
                <span className="font-inter text-[10px] text-gray-400 w-6">{idx + 1}</span>
                <div>
                  <h3 className="font-headline text-sm text-[var(--color-near-black)]">{section.title || section.type}</h3>
                  <span className="font-inter text-[10px] uppercase tracking-[0.1em] text-gray-400">{section.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => moveSection(section.id, -1)} disabled={idx === 0}
                  className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-20" title="Mover arriba">
                  <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                </button>
                <button onClick={() => moveSection(section.id, 1)} disabled={idx === sections.length - 1}
                  className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-20" title="Mover abajo">
                  <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                </button>
                <button onClick={() => toggleVisibility(section.id)}
                  className="p-1.5 hover:bg-gray-100 rounded" title={section.visible ? 'Ocultar' : 'Mostrar'}>
                  <span className="material-symbols-outlined text-[16px]">{section.visible ? 'visibility' : 'visibility_off'}</span>
                </button>
                <button onClick={() => deleteSection(section.id)}
                  className="p-1.5 hover:bg-red-50 rounded text-red-400" title="Eliminar">
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
                <span className={`material-symbols-outlined text-[16px] text-gray-400 transition-transform ${expanded === section.id ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
            </div>
            {expanded === section.id && (
              <div className="px-5 pb-6 border-t border-[var(--color-warm-gray)] pt-5">
                <div className="mb-4">
                  <Field label="Título de sección" val={section.title} onChange={v => updateSection(section.id, { title: v })} />
                </div>
                <SectionEditor section={section} onChange={(id, data) => updateSection(id, data)} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white border border-[var(--color-warm-gray)] p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-headline text-xl text-[var(--color-near-black)]">Colores del tema</h2>
            <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Personaliza la paleta de colores de la tienda</p>
          </div>
          <button onClick={handleSaveTokens} disabled={saving}
            className="admin-btn-primary">
            Guardar colores
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {COLOR_KEYS.map(ck => (
            <div key={ck.key}>
              <label className="block font-inter text-[9px] uppercase tracking-[0.1em] text-gray-500 mb-2">{ck.label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={tokens[ck.key] || '#000000'}
                  onChange={e => setToken(ck.key, e.target.value)}
                  className="w-10 h-10 p-0.5 border border-gray-200 rounded cursor-pointer" />
                <input value={tokens[ck.key] || ''}
                  onChange={e => setToken(ck.key, e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-[var(--color-warm-gray)] font-inter text-xs focus:outline-none focus:border-[var(--color-gold)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="font-inter text-xs text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
          Después de guardar, recarga la página principal para ver los cambios aplicados.
        </p>
      </div>
    </div>
  );
}
