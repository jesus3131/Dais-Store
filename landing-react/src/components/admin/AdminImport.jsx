import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerFloatingNotification } from '../ui/FloatingSaleNotification.jsx';

export default function AdminImport() {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const { addToast } = useToast();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      setPreview(data.slice(0, 10));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (preview.length === 0) { addToast('No hay datos para importar', 'error'); return; }
    setImporting(true);
    try {
      const wb = XLSX.read(await fileRef.current.files[0].arrayBuffer(), { type: 'array' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const result = await api.importProducts(data);
      addToast(`${result.count || data.length} productos importados`);
      triggerFloatingNotification({ name: 'Importación', product: `${result.count || data.length} productos`, icon: 'upload_file', time: 'recién' });
      setPreview([]);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) { addToast('Error al importar: ' + (e.message || e), 'error'); }
    finally { setImporting(false); }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-10">
        <h1 className="font-headline text-3xl text-[var(--color-near-black)]">Importar Excel</h1>
        <p className="font-inter text-sm text-[var(--color-on-surface-variant)] mt-1">Carga masiva de productos desde archivo Excel</p>
      </div>

      <div className="bg-white border border-[var(--color-warm-gray)]/40 p-8 mb-8">
        <h2 className="font-headline text-lg text-[var(--color-near-black)] mb-6">Subir archivo</h2>
        <div className="flex flex-wrap items-end gap-5">
          <div className="flex-1 min-w-[280px]">
            <label className="font-inter text-[10px] uppercase tracking-[0.15em] text-[var(--color-on-surface-variant)] font-medium mb-2 block">Archivo Excel (.xlsx, .xls)</label>
            <input type="file" ref={fileRef} accept=".xlsx,.xls" onChange={handleFile}
              className="w-full font-inter text-sm text-[var(--color-on-surface)] file:mr-4 file:px-4 file:py-2.5 file:border-0 file:text-[10px] file:uppercase file:tracking-[0.12em] file:bg-[var(--color-ivory)] file:text-[var(--color-near-black)] hover:file:bg-[var(--color-gold)] hover:file:text-white transition-all file:cursor-pointer cursor-pointer" />
          </div>
          <button onClick={handleImport} disabled={importing || preview.length === 0}
            className="px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.15em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all disabled:opacity-50 flex items-center gap-2">
            {importing ? 'Importando...' : 'Importar Productos'}
          </button>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-white border border-[var(--color-warm-gray)]/40 overflow-x-auto">
          <div className="p-6 border-b border-[var(--color-warm-gray)]/40 flex items-center justify-between">
            <h2 className="font-headline text-sm text-[var(--color-near-black)]">Vista previa ({preview.length} filas)</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-warm-gray)]/40">
                {Object.keys(preview[0] || {}).map(key => (
                  <th key={key} className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)]">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="p-4 font-inter text-sm text-[var(--color-on-surface)]">{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
