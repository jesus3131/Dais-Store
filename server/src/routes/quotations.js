import { Router } from 'express';
import * as Quotation from '../models/Quotation.js';
import { generateQuotationPdf } from '../models/QuotationPdf.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const quotations = await Quotation.getAll();
    res.json(quotations);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const q = await Quotation.getById(Number(req.params.id));
    if (!q) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const q = await Quotation.create(req.body, userId);
    res.status(201).json(q);
  } catch (err) {
    if (err.message?.includes('obligatorio')) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const q = await Quotation.update(Number(req.params.id), req.body);
    if (!q) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const ok = await Quotation.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json({ message: 'Cotización eliminada' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Estado inválido' });
    const q = await Quotation.updateStatus(Number(req.params.id), status);
    if (!q) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const q = await Quotation.getById(Number(req.params.id));
    if (!q) return res.status(404).json({ error: 'Cotización no encontrada' });

    if (typeof q.items === 'string') q.items = JSON.parse(q.items);

    const pdf = await generateQuotationPdf(q);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${(q.number || `COT-${String(q.id).padStart(6, '0')}`).replace(/\//g, '-')}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
