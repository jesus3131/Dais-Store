import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getSiteSettings() {
  const { rows } = await pool.query('SELECT key, value FROM site_settings');
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

function formatCurrency(n) {
  return `$${Number(n || 0).toLocaleString('es-CO')}`;
}

export async function generateQuotationPdf(quotation) {
  const settings = await getSiteSettings();
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));

  const GOLD = '#c9a84b';
  const DARK = '#1c1b1b';
  const GRAY = '#6b7280';
  const WHITE = '#ffffff';

  const logoUrl = settings.site_logo_url;
  let logoPath = null;
  if (logoUrl) {
    if (!logoUrl.startsWith('http')) {
      const candidate = path.join(__dirname, '../../uploads', path.basename(logoUrl));
      if (fs.existsSync(candidate)) logoPath = candidate;
    }
  }

  // Header
  if (logoPath) {
    doc.image(logoPath, 50, 45, { width: 110 });
    doc.fontSize(10).fillColor(GOLD)
      .text('COTIZACIÓN', 50, 130, { align: 'right' });
  } else {
    doc.font('Helvetica-Bold').fontSize(22).fillColor(DARK)
      .text(settings.site_name || 'DAIS STORE', 50, 45);
    doc.fontSize(10).fillColor(GOLD)
      .text('COTIZACIÓN', 50, 75, { align: 'right' });
  }

  // Company info
  const headerBottom = logoPath ? 160 : 110;
  const companyLines = [
    settings.site_name || 'DAIS STORE',
    settings.site_address || '',
    settings.site_phone ? `Tel: ${settings.site_phone}` : '',
    settings.site_email ? `Email: ${settings.site_email}` : '',
  ].filter(Boolean);
  companyLines.forEach((line, i) => {
    doc.font('Helvetica').fontSize(8).fillColor(GRAY)
      .text(line, 50, headerBottom + i * 11);
  });

  // Quotation metadata
  const metaStartY = headerBottom;
  const metaX = 330;
  const metaItems = [
    { label: 'No. Cotización:', value: quotation.number || `COT-${String(quotation.id).padStart(6, '0')}` },
    { label: 'Fecha Emisión:', value: new Date(quotation.created_at).toLocaleDateString('es-CO') },
    { label: 'Válida hasta:', value: quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString('es-CO') : '—' },
    { label: 'Estado:', value: quotation.status ? quotation.status.toUpperCase() : '—' },
  ];
  metaItems.forEach((m, i) => {
    const y = metaStartY + i * 14;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(DARK)
      .text(m.label, metaX, y);
    doc.font('Helvetica').fillColor(GRAY)
      .text(m.value, metaX + 85, y);
  });

  // Divider
  const dividerY = metaStartY + metaItems.length * 14 + 10;
  doc.moveTo(50, dividerY).lineTo(545, dividerY).strokeColor('#e5e7eb').stroke();

  // Client info
  const clientY = dividerY + 20;
  doc.rect(50, clientY - 4, 240, 62).fillColor('#fafafa').fill();
  doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD).text('DATOS DEL CLIENTE', 56, clientY + 2);
  doc.font('Helvetica').fontSize(8).fillColor(DARK);
  const clientInfo = [
    quotation.client_name || '—',
    quotation.client_document ? `Doc: ${quotation.client_document}` : null,
    `Email: ${quotation.client_email || '—'}`,
    `Tel: ${quotation.client_phone || '—'}`,
  ].filter(Boolean);
  clientInfo.forEach((line, i) => doc.text(line, 56, clientY + 16 + i * 10));

  // Table header
  const tableTop = clientY + 75;
  const cols = [
    { x: 50, w: 30, align: 'center' },
    { x: 80, w: 140, align: 'left' },
    { x: 220, w: 100, align: 'left' },
    { x: 320, w: 50, align: 'center' },
    { x: 370, w: 70, align: 'right' },
    { x: 440, w: 105, align: 'right' },
  ];
  const headers = ['#', 'Producto', 'Descripción', 'Cant.', 'Precio', 'Total'];

  doc.rect(48, tableTop - 6, 498, 18).fillColor(GOLD).fill();
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8);
  headers.forEach((h, i) => doc.text(h, cols[i].x, tableTop, { width: cols[i].w, align: cols[i].align }));

  // Table rows
  const items = quotation.items || [];
  let rowY = tableTop + 20;
  let rowCount = 0;

  items.forEach((item) => {
    const qty = parseInt(item.quantity) || 1;
    const price = parseFloat(item.unit_price) || 0;
    const total = qty * price;

    if (rowY > 700) { doc.addPage(); rowY = 50; }

    if (rowCount % 2 === 1) {
      doc.rect(48, rowY - 2, 498, 16).fillColor('#f9fafb').fill();
    }

    const rowData = [
      String(rowCount + 1),
      item.product_name || '—',
      item.description || '',
      String(qty),
      formatCurrency(price),
      formatCurrency(total),
    ];
    doc.fillColor(DARK).font('Helvetica').fontSize(8);
    rowData.forEach((val, i) => doc.text(val, cols[i].x, rowY, { width: cols[i].w, align: cols[i].align }));

    rowY += 16;
    rowCount++;
  });

  // Empty rows filler
  if (rowCount < 3) {
    for (let i = rowCount; i < 4; i++) {
      if (rowCount % 2 === (i % 2)) {
        doc.rect(48, rowY - 2, 498, 16).fillColor('#f9fafb').fill();
      }
      rowY += 16;
    }
  }

  // Totals
  const totalsStartY = Math.max(rowY + 8, 540);
  const subtotal = parseFloat(quotation.subtotal) || 0;
  const discount = parseFloat(quotation.discount) || 0;
  const tax = parseFloat(quotation.tax) || 0;
  const total = subtotal - discount + tax;

  doc.rect(340, totalsStartY - 4, 208, 78).fillColor(DARK).fill();
  doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(9);
  doc.text('RESUMEN', 350, totalsStartY + 2);

  const totalLines = [
    { label: 'Subtotal:', value: formatCurrency(subtotal), bold: false, color: '#d1d5db' },
    { label: 'Descuento:', value: formatCurrency(discount), bold: false, color: '#d1d5db' },
    { label: 'IVA (19%):', value: formatCurrency(tax), bold: false, color: '#d1d5db' },
    { label: 'TOTAL:', value: formatCurrency(total), bold: true, color: GOLD },
  ];
  totalLines.forEach((t, i) => {
    const ty = totalsStartY + 16 + i * 15;
    doc.font(t.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(t.bold ? 10 : 8)
      .fillColor(t.color).text(t.label, 350, ty, { width: 90 });
    doc.text(t.value, 440, ty, { width: 100, align: 'right' });
  });

  // Terms
  let termsY = totalsStartY + 90;
  if (quotation.terms) {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD).text('TÉRMINOS Y CONDICIONES', 50, termsY);
    doc.font('Helvetica').fontSize(8).fillColor(GRAY);
    const termLines = doc.heightOfString(quotation.terms, { width: 495 });
    doc.text(quotation.terms, 50, termsY + 12, { width: 495 });
    termsY += 12 + termLines + 10;
  }

  // Notes
  if (quotation.notes) {
    const notesY = Math.max(termsY + 10, 530);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD).text('NOTAS', 50, notesY);
    doc.font('Helvetica').fontSize(8).fillColor(GRAY).text(quotation.notes, 50, notesY + 12, { width: 495 });
  }

  // Footer
  const footerY = 750;
  doc.moveTo(50, footerY - 10).lineTo(545, footerY - 10).strokeColor('#e5e7eb').stroke();
  doc.fontSize(7).fillColor(GRAY).font('Helvetica');
  doc.text(`${settings.site_name || 'DAIS Store'} · ${settings.site_address || ''} · ${settings.site_phone || ''}`.trim(), 50, footerY, { align: 'center' });
  doc.text(`Cotización generada el ${new Date().toLocaleString('es-CO')}`, 50, footerY + 10, { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
