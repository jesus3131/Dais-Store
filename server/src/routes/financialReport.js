import { Router } from 'express';
import * as FR from '../models/FinancialReport.js';

const router = Router();

router.get('/trial-balance', async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await FR.getTrialBalance(from || '1900-01-01', to || '2099-12-31');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/income-statement', async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await FR.getIncomeStatement(from || '1900-01-01', to || '2099-12-31');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/balance-sheet', async (req, res) => {
  try {
    const asOf = req.query.as_of || new Date().toISOString().slice(0, 10);
    const data = await FR.getBalanceSheet(asOf);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
