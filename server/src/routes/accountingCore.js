import { Router } from 'express';
import * as Core from '../models/AccountingCore.js';

const router = Router();

// Journal Entries
router.get('/journal-entries', async (req, res) => {
  try { res.json(await Core.getJournalEntries(req.query)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/journal-entries/:id', async (req, res) => {
  try {
    const entry = await Core.getJournalEntry(Number(req.params.id));
    if (!entry) return res.status(404).json({ error: 'No encontrado' });
    res.json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/journal-entries', async (req, res) => {
  try { res.status(201).json(await Core.createJournalEntry(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/journal-entries/:id/status', async (req, res) => {
  try {
    const entry = await Core.updateJournalEntryStatus(Number(req.params.id), req.body.status);
    if (!entry) return res.status(404).json({ error: 'No encontrado' });
    res.json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Invoices
router.get('/invoices', async (req, res) => {
  try { res.json(await Core.getInvoices(req.query)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/invoices/:id', async (req, res) => {
  try {
    const inv = await Core.getInvoice(Number(req.params.id));
    if (!inv) return res.status(404).json({ error: 'No encontrada' });
    res.json(inv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/invoices', async (req, res) => {
  try { res.status(201).json(await Core.createInvoice(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/invoices/:id/status', async (req, res) => {
  try {
    const inv = await Core.updateInvoiceStatus(Number(req.params.id), req.body.status);
    if (!inv) return res.status(404).json({ error: 'No encontrada' });
    res.json(inv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Receivable / Payable
router.get('/receivable-payable', async (req, res) => {
  try { res.json(await Core.getReceivablePayable(req.query)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/receivable-payable', async (req, res) => {
  try { res.status(201).json(await Core.createReceivablePayable(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Bank Reconciliation
router.get('/bank-reconciliation', async (req, res) => {
  try {
    const data = await Core.getReconciliations(req.query.bank_account_id);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/bank-reconciliation', async (req, res) => {
  try { res.status(201).json(await Core.createReconciliation(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
