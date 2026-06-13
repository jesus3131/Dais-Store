import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api.js';

export default function AdminCatalogs() {
  const [catalogs, setCatalogs] = useState([]);
  const fileRef = useRef(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = () => {
    api.getCatalogs().then(setCatalogs).catch(() => {});
  };

  useEffect(load, []);

  const handleUpload = async () => {
    if (!title || !fileRef.current?.files[0]) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('file', fileRef.current.files[0]);
    try {
      await api.uploadCatalog(fd);
      setTitle('');
      fileRef.current.value = '';
      load();
    } catch (e) {
      alert('Error al subir: ' + e.message);
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este catálogo?')) return;
    await api.deleteCatalog(id);
    load();
  };

  return (
    <div>
      <h1 className="font-headline text-2xl text-[var(--color-on-surface)] mb-6">Catálogos PDF</h1>

      <div className="bg-white rounded-xl luxury-shadow p-6 mb-6">
        <h2 className="font-headline text-lg text-[var(--color-on-surface)] mb-4">Subir Catálogo</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block font-manrope text-xs text-[var(--color-outline)] mb-1">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Catálogo Verano 2024"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-outline-variant)] font-manrope text-sm focus:outline-none focus:border-[var(--color-primary)]" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block font-manrope text-xs text-[var(--color-outline)] mb-1">Archivo PDF</label>
            <input type="file" ref={fileRef} accept=".pdf,.jpg,.jpeg,.png"
              className="w-full font-manrope text-sm text-[var(--color-on-surface)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-[var(--color-primary-container)] file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)] hover:file:text-white transition-all" />
          </div>
          <button onClick={handleUpload} disabled={uploading}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-manrope text-sm rounded-full hover:bg-[var(--color-on-tertiary-container)] transition-all disabled:opacity-50 flex items-center gap-2">
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl luxury-shadow overflow-x-auto">
        <table className="w-full font-manrope text-sm">
          <thead>
            <tr className="border-b border-[var(--color-outline-variant)]">
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Título</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Archivo</th>
              <th className="text-left p-4 text-[var(--color-outline)] font-semibold">Subido</th>
              <th className="text-right p-4 text-[var(--color-outline)] font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {catalogs.map(cat => (
              <tr key={cat.id} className="border-b border-[var(--color-outline-variant)] last:border-0">
                <td className="p-4 text-[var(--color-on-surface)] font-semibold">{cat.title}</td>
                <td className="p-4">
                  <a href={cat.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:underline">
                    {cat.filename || cat.url}
                  </a>
                </td>
                <td className="p-4 text-[var(--color-outline)] text-xs">{new Date(cat.uploaded_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-[var(--color-outline)] hover:text-red-500 transition-colors" title="Eliminar">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {catalogs.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-[var(--color-outline)]">No hay catálogos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
