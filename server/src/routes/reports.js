import { Router } from 'express';
import * as Report from '../models/Report.js';

const router = Router();

router.get('/kpi-summary', async (req, res) => {
  try { res.json(await Report.kpiSummary(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/sales', async (req, res) => {
  try { res.json(await Report.salesByPeriod(req.query.period, req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/sales-by-day', async (req, res) => {
  try { res.json(await Report.salesByDayOfWeek(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/sales-by-hour', async (req, res) => {
  try { res.json(await Report.salesByHour(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/sales-by-category', async (req, res) => {
  try { res.json(await Report.salesByCategory(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/aov-trend', async (req, res) => {
  try { res.json(await Report.averageOrderValueTrend(req.query.period, req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/month-over-month', async (req, res) => {
  try { res.json(await Report.monthOverMonth(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/year-over-year', async (_req, res) => {
  try { res.json(await Report.yearOverYear()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/discount-analysis', async (req, res) => {
  try { res.json(await Report.discountAnalysis(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/top-products', async (req, res) => {
  try { res.json(await Report.topProducts(parseInt(req.query.limit) || 10, req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/product-categories', async (_req, res) => {
  try { res.json(await Report.productCategoryDistribution()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/price-distribution', async (_req, res) => {
  try { res.json(await Report.priceDistribution()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/orders-by-status', async (req, res) => {
  try { res.json(await Report.ordersByStatus(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/order-value-distribution', async (_req, res) => {
  try { res.json(await Report.orderValueDistribution()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/customer-stats', async (req, res) => {
  try { res.json(await Report.customerStats(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/top-customers', async (req, res) => {
  try { res.json(await Report.topCustomers(parseInt(req.query.limit) || 10)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/repeat-purchase-rate', async (_req, res) => {
  try { res.json(await Report.repeatPurchaseRate()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/customers-by-city', async (_req, res) => {
  try { res.json(await Report.customersByCity()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/inventory-summary', async (_req, res) => {
  try { res.json(await Report.inventorySummary()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/inventory-value', async (req, res) => {
  try { res.json(await Report.inventoryValueByProduct(parseInt(req.query.limit) || 10)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Detail endpoints ──────────────────────────────────

router.get('/sales-detail', async (req, res) => {
  try { res.json(await Report.salesDetail(req.query.period, req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/product-detail', async (req, res) => {
  try { res.json(await Report.productDetail(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/customer-detail', async (req, res) => {
  try { res.json(await Report.customerDetail(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/inventory-detail', async (_req, res) => {
  try { res.json(await Report.inventoryDetail()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/order-detail', async (req, res) => {
  try { res.json(await Report.orderDetail(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/financial-detail', async (req, res) => {
  try { res.json(await Report.financialDetail(req.query.from, req.query.to)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
