import { Router } from 'express';
import * as Order from '../models/Order.js';
import { generateInvoice } from '../models/Invoice.js';

const router = Router();

router.get('/orders/:id/invoice', async (req, res) => {
  try {
    const order = await Order.getById(Number(req.params.id));
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    const pdf = await generateInvoice(order);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="factura-${String(order.id).padStart(6, '0')}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
