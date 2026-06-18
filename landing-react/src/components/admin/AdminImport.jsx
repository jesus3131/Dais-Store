import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { triggerFloatingNotification } from '../ui/FloatingSaleNotification.jsx';

const TEMPLATE_FIELDS = ['name', 'price', 'old_price', 'wholesale_price', 'stock', 'category', 'description', 'image_url', 'sku'];

export default function AdminImport() {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [allData, setAllData] = useState([]);
  const { addToast } = useToast();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        setAllData(data);
        setPreview(data.slice(0, 10));
        addToast(`${data.length} filas detectadas`, 'info');
      } catch { addToast('Error al leer el archivo. Verifica el formato.', 'error'); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (allData.length === 0) { addToast('No hay datos para importar', 'error'); return; }
    setImporting(true);
    try {
      const result = await api.importProducts(allData);
      const count = result.count || allData.length;
      addToast(`${count} productos importados correctamente`);
      triggerFloatingNotification({ name: 'Importación', product: `${count} productos`, icon: 'upload_file', time: 'recién' });
      setPreview([]);
      setAllData([]);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) { addToast('Error al importar: ' + (e.message || e), 'error'); }
    finally { setImporting(false); }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([TEMPLATE_FIELDS.reduce((acc, f) => ({ ...acc, [f]: '' }), {})]);
    XLSX.utils.sheet_add_aoa(ws, [TEMPLATE_FIELDS], { origin: 'A1' });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'plantilla_productos.xlsx');
  };

  const clearFile = () => {
    setPreview([]);
    setAllData([]);
    if (fileRef.current) fileRef.current.value = '';
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
          <div className="flex gap-3">
            <button onClick={downloadTemplate}
              className="px-5 py-3 border border-[var(--color-warm-gray)] font-inter text-[10px] uppercase tracking-[0.15em] hover:bg-[var(--color-ivory)] transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">download</span>
              Plantilla
            </button>
            {preview.length > 0 && (
              <button onClick={clearFile}
                className="px-5 py-3 border border-red-200 text-red-500 font-inter text-[10px] uppercase tracking-[0.15em] hover:bg-red-50 transition-all">
                Limpiar
              </button>
            )}
            <button onClick={handleImport} disabled={importing || allData.length === 0}
              className="px-6 py-3 bg-[var(--color-near-black)] text-white font-inter text-xs uppercase tracking-[0.15em] hover:bg-[var(--color-gold)] hover:text-[var(--color-near-black)] transition-all disabled:opacity-50 flex items-center gap-2">
              {importing ? (
                <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Importando...</>
              ) : 'Importar Productos'}
            </button>
          </div>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-white border border-[var(--color-warm-gray)]/40 overflow-x-auto">
          <div className="p-6 border-b border-[var(--color-warm-gray)]/40 flex items-center justify-between">
            <h2 className="font-headline text-sm text-[var(--color-near-black)]">Vista previa ({allData.length} filas — mostrando primeras {preview.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--color-warm-gray)]/40">
                  {Object.keys(preview[0] || {}).map(key => (
                    <th key={key} className="text-left p-4 font-inter text-[10px] uppercase tracking-[0.12em] text-[var(--color-on-surface-variant)] font-medium bg-[var(--color-ivory)] whitespace-nowrap">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--color-warm-gray)]/20 hover:bg-[var(--color-ivory)]/50 transition-colors">
                    {Object.keys(preview[0]).map((key, j) => (
                      <td key={j} className="p-4 font-inter text-sm text-[var(--color-on-surface)] whitespace-nowrap max-w-[200px] truncate">{String(row[key] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
