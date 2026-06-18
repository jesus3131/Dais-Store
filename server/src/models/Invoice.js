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

export async function generateInvoice(order) {
  const settings = await getSiteSettings();
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const chunks = [];
  doc.on('data', chunk => chunks.push(chunk));
  doc.on('end', () => {});

  const logoUrl = settings.site_logo_url;
  const logoPath = logoUrl
    ? path.join(__dirname, '../../uploads', path.basename(logoUrl))
    : null;

  // Header with logo
  if (logoPath && fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 120 });
  } else {
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#1c1b1b')
      .text(settings.site_name || 'DAIS STORE', 50, 50);
  }

  // Invoice title
  doc.fontSize(10).fillColor('#6366f1')
    .text('FACTURA DE VENTA', 50, logoPath && fs.existsSync(logoPath) ? 100 : 80, { align: 'right' });

  // Company info
  const companyY = logoPath && fs.existsSync(logoPath) ? 130 : 110;
  doc.fontSize(8).fillColor('#6b7280').font('Helvetica');
  const companyInfo = [
    settings.site_name || 'DAIS STORE',
    settings.site_address || '',
    settings.site_phone || '',
    settings.site_email || '',
  ].filter(Boolean);
  companyInfo.forEach((line, i) => {
    doc.text(line, 50, companyY + i * 12);
  });

  // Invoice metadata
  const metaX = 320;
  const meta = [
    { label: 'No. Factura:', value: `INV-${String(order.id).padStart(6, '0')}` },
    { label: 'Fecha:', value: new Date(order.created_at).toLocaleDateString('es-CO') },
    { label: 'Estado:', value: (order.status || 'pending').toUpperCase() },
  ];
  meta.forEach((m, i) => {
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#374151')
      .text(m.label, metaX, companyY + i * 14);
    doc.font('Helvetica').fillColor('#6b7280')
      .text(m.value, metaX + 70, companyY + i * 14);
  });

  // Divider
  const dividerY = companyY + 50;
  doc.moveTo(50, dividerY).lineTo(545, dividerY).strokeColor('#e5e7eb').stroke();

  // Client info
  const clientY = dividerY + 20;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#374151').text('DATOS DEL CLIENTE', 50, clientY);
  doc.font('Helvetica').fontSize(8).fillColor('#6b7280');
  const clientLines = [
    `Nombre: ${order.customer_name || '—'}`,
    `Email: ${order.customer_email || order.email || '—'}`,
    `Teléfono: ${order.customer_phone || order.phone || '—'}`,
    `Dirección: ${order.shipping_address || '—'}`,
  ];
  clientLines.forEach((line, i) => doc.text(line, 50, clientY + 14 + i * 11));

  // Table header
  const tableTop = clientY + 65;
  const colWidths = [30, 200, 70, 70, 70, 100];
  const colStarts = [50, 80, 280, 350, 420, 490];
  const headers = ['#', 'Producto', 'Cant.', 'Precio', 'Desc.', 'Total'];

  doc.rect(48, tableTop - 6, 500, 18).fillColor('#6366f1').fill();
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
  headers.forEach((h, i) => doc.text(h, colStarts[i], tableTop, { width: colWidths[i], align: i === 0 ? 'center' : i > 2 ? 'right' : 'left' }));

  // Table rows
  const items = order.items || [];
  let rowY = tableTop + 20;
  doc.font('Helvetica').fontSize(8).fillColor('#374151');

  items.forEach((item, idx) => {
    const qty = parseInt(item.qty) || 1;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const total = (qty * price) - discount;
    const row = [
      String(idx + 1),
      item.name || '—',
      String(qty),
      formatCurrency(price),
      formatCurrency(discount),
      formatCurrency(total),
    ];
    if (rowY > 700) {
      doc.addPage();
      rowY = 50;
    }
    row.forEach((val, i) => {
      doc.text(val, colStarts[i], rowY, { width: colWidths[i], align: i === 0 ? 'center' : i > 2 ? 'right' : 'left' });
    });
    rowY += 16;
  });

  // Totals
  const totalsY = Math.max(rowY + 10, 580);
  const subtotal = parseFloat(order.total) || 0;
  const discount = parseFloat(order.discount) || 0;
  const total = subtotal - discount;

  doc.rect(350, totalsY - 4, 198, 60).fillColor('#f9fafb').fill();
  const totals = [
    { label: 'Subtotal:', value: formatCurrency(subtotal), bold: false },
    { label: 'Descuento:', value: formatCurrency(discount), bold: false },
    { label: 'TOTAL:', value: formatCurrency(total), bold: true },
  ];
  totals.forEach((t, i) => {
    const ty = totalsY + i * 18;
    doc.font(t.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(t.bold ? 10 : 9)
      .fillColor(t.bold ? '#1c1b1b' : '#6b7280')
      .text(t.label, 360, ty, { width: 80 });
    doc.font(t.bold ? 'Helvetica-Bold' : 'Helvetica')
      .fillColor(t.bold ? '#6366f1' : '#374151')
      .text(t.value, 440, ty, { width: 100, align: 'right' });
  });

  // Notes
  if (order.notes) {
    const notesY = totalsY + 75;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#374151').text('NOTAS:', 50, notesY);
    doc.font('Helvetica').fontSize(8).fillColor('#6b7280').text(order.notes, 50, notesY + 12);
  }

  // Footer
  const footerY = 740;
  doc.fontSize(7).fillColor('#9ca3af').font('Helvetica');
  doc.text(`Generado el ${new Date().toLocaleString('es-CO')} · DAIS Store`, 50, footerY, { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
