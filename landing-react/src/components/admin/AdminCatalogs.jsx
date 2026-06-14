import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';

export default function AdminCatalogs() {
  const [catalogs, setCatalogs] = useState([]);
  const fileRef = useRef(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => { api.getCatalogs().then(setCatalogs).catch(() => {}); };
  useEffect(load, []);

  const handleUpload = async () => {
    if (!title || !fileRef.current?.files[0]) return;
    setUploading(true);
    const fd = new FormData(); fd.append('title', title); fd.append('file', fileRef.current.files[0]);
    try { await api.uploadCatalog(fd); setTitle(''); fileRef.current.value = ''; load(); }
    catch (e) { alert('Error al subir: ' + e.message); }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este catálogo?')) return;
    await api.deleteCatalog(id); load();
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Catálogos PDF</h1>
        <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Gestiona tus catálogos descargables</p>
      </div>

      <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8 mb-8">
        <h2 className="font-headline text-lg text-[var(--color-near-black)] mb-6">Subir Catálogo</h2>
        <div className="flex flex-wrap gap-5 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Catálogo Verano 2024"
              className="w-full px-4 py-3 border border-[var(--color-warm-gray)] font-inter text-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/30 transition-all" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Archivo</label>
            <input type="file" ref={fileRef} accept=".pdf,.jpg,.jpeg,.png"
              className="w-full font-inter text-sm text-[var(--color-on-surface)] file:mr-4 file:px-4 file:py-2 file:border-0 file:text-[10px] file:uppercase file:tracking-[0.12em] file:bg-[var(--color-ivory)] file:text-[var(--color-near-black)] hover:file:bg-[var(--color-gold)] hover:file:text-white transition-all file:cursor-pointer cursor-pointer" />
          </div>
          <button onClick={handleUpload} disabled={uploading}
            className="px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.15em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all disabled:opacity-50 flex items-center gap-2">
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-warm-gray)]/40 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-warm-gray)]/40">
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Título</th>
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Archivo</th>
              <th className="text-left p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Subido</th>
              <th className="text-right p-5 font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {catalogs.map(cat => (
              <tr key={cat.id} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                <td className="p-5 font-headline text-sm text-[var(--color-near-black)]">{cat.title}</td>
                <td className="p-5">
                  <a href={cat.url} target="_blank" rel="noopener noreferrer" className="font-inter text-sm text-[var(--color-gold)] hover:underline">{cat.filename || cat.url}</a>
                </td>
                <td className="p-5 font-inter text-xs text-[var(--color-on-surface-variant)]">{new Date(cat.uploaded_at).toLocaleDateString()}</td>
                <td className="p-5 text-right">
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-[var(--color-on-surface-variant)] hover:text-red-500 transition-colors" title="Eliminar">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {catalogs.length === 0 && (
              <tr><td colSpan={4} className="p-16 text-center font-inter text-sm text-[var(--color-on-surface-variant)]">No hay catálogos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
