import { Router } from 'express';
import * as MasterData from '../models/MasterData.js';

const router = Router();

// Plan de Cuentas
router.get('/account-charts', async (_req, res) => {
  try { res.json(await MasterData.getAccounts()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/account-charts', async (req, res) => {
  try { res.status(201).json(await MasterData.createAccount(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/account-charts/:id', async (req, res) => {
  try {
    const acct = await MasterData.updateAccount(Number(req.params.id), req.body);
    if (!acct) return res.status(404).json({ error: 'No encontrada' });
    res.json(acct);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Terceros
router.get('/third-parties', async (req, res) => {
  try { res.json(await MasterData.getThirdParties(req.query)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/third-parties/:id', async (req, res) => {
  try {
    const tp = await MasterData.getThirdParty(Number(req.params.id));
    if (!tp) return res.status(404).json({ error: 'No encontrado' });
    res.json(tp);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/third-parties', async (req, res) => {
  try { res.status(201).json(await MasterData.createThirdParty(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/third-parties/:id', async (req, res) => {
  try {
    const tp = await MasterData.updateThirdParty(Number(req.params.id), req.body);
    if (!tp) return res.status(404).json({ error: 'No encontrado' });
    res.json(tp);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Centros de Costo
router.get('/cost-centers', async (_req, res) => {
  try { res.json(await MasterData.getCostCenters()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/cost-centers', async (req, res) => {
  try { res.status(201).json(await MasterData.createCostCenter(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Cuentas Bancarias
router.get('/bank-accounts', async (_req, res) => {
  try { res.json(await MasterData.getBankAccounts()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/bank-accounts', async (req, res) => {
  try { res.status(201).json(await MasterData.createBankAccount(req.body)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
