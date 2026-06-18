import pool from '../db.js';

function dateBounds(from, to) {
  return {
    from: from || '1970-01-01',
    to: to || new Date().toISOString().slice(0, 10),
  };
}

// ── Sales ──────────────────────────────────────────────

export async function salesByPeriod(period = 'daily', from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  let trunc;
  if (period === 'weekly') trunc = "DATE_TRUNC('week', created_at)";
  else if (period === 'monthly') trunc = "DATE_TRUNC('month', created_at)";
  else if (period === 'annual') trunc = "DATE_TRUNC('year', created_at)";
  else trunc = 'DATE(created_at)';

  const { rows } = await pool.query(`
    SELECT ${trunc} AS date,
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY date ORDER BY date ASC
  `, [f, t]);
  return rows;
}

export async function salesByDayOfWeek(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const { rows } = await pool.query(`
    SELECT
      TO_CHAR(created_at, 'Day') AS day_name,
      EXTRACT(DOW FROM created_at)::int AS dow,
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY day_name, dow
    ORDER BY dow
  `, [f, t]);
  return rows;
}

export async function salesByHour(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const { rows } = await pool.query(`
    SELECT
      EXTRACT(HOUR FROM created_at)::int AS hour,
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY hour
    ORDER BY hour
  `, [f, t]);
  return rows;
}

export async function averageOrderValueTrend(period = 'monthly', from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  let trunc;
  if (period === 'weekly') trunc = "DATE_TRUNC('week', created_at)";
  else if (period === 'daily') trunc = 'DATE(created_at)';
  else trunc = "DATE_TRUNC('month', created_at)";

  const { rows } = await pool.query(`
    SELECT ${trunc} AS date,
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue,
      COALESCE(ROUND(AVG(total), 0), 0) AS avg_order_value
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY date ORDER BY date ASC
  `, [f, t]);
  return rows;
}

export async function monthOverMonth(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const { rows } = await pool.query(`
    WITH monthly AS (
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
      GROUP BY month
    )
    SELECT
      TO_CHAR(month, 'YYYY-MM') AS label,
      month,
      orders,
      revenue,
      LAG(orders) OVER (ORDER BY month) AS prev_orders,
      LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
      CASE WHEN LAG(revenue) OVER (ORDER BY month) > 0
        THEN ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month) * 100, 1)
        ELSE NULL
      END AS growth_pct
    FROM monthly
    ORDER BY month DESC
  `, [f, t]);
  return rows;
}

export async function yearOverYear() {
  const { rows } = await pool.query(`
    WITH yearly AS (
      SELECT
        EXTRACT(YEAR FROM created_at)::int AS year,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      GROUP BY year
    )
    SELECT
      year,
      orders,
      revenue,
      LAG(orders) OVER (ORDER BY year) AS prev_orders,
      LAG(revenue) OVER (ORDER BY year) AS prev_revenue,
      CASE WHEN LAG(revenue) OVER (ORDER BY year) > 0
        THEN ROUND((revenue - LAG(revenue) OVER (ORDER BY year)) / LAG(revenue) OVER (ORDER BY year) * 100, 1)
        ELSE NULL
      END AS growth_pct
    FROM yearly
    ORDER BY year DESC
  `);
  return rows;
}

export async function salesByCategory(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const { rows } = await pool.query(`
    WITH product_sales AS (
      SELECT
        COALESCE((item->>'id')::int, 0) AS pid,
        SUM((item->>'qty')::int) AS total_qty,
        SUM((item->>'qty')::int * (item->>'price')::numeric) AS total_revenue
      FROM orders,
      LATERAL jsonb_array_elements(items) AS item
      WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
        AND (item->>'id') IS NOT NULL
      GROUP BY pid
    )
    SELECT
      COALESCE(p.category, 'Sin categoría') AS name,
      SUM(ps.total_qty) AS count,
      SUM(ps.total_revenue) AS revenue
    FROM product_sales ps
    LEFT JOIN products p ON p.id = ps.pid
    GROUP BY p.category
    ORDER BY revenue DESC
  `, [f, t]);
  return rows;
}

export async function discountAnalysis(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) AS total_orders,
      COUNT(*) FILTER (WHERE discount > 0 OR discount IS NOT NULL) AS discounted_orders,
      COALESCE(SUM(COALESCE(discount, 0)), 0) AS total_discounts,
      COALESCE(ROUND(AVG(COALESCE(discount, 0)), 0), 0) AS avg_discount,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE discount > 0 OR discount IS NOT NULL)::numeric / COUNT(*) * 100, 1)
        ELSE 0
      END AS pct_discounted
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
  `, [f, t]);
  return rows[0];
}

// ── Products ───────────────────────────────────────────

export async function topProducts(limit = 10, from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const { rows } = await pool.query(`
    SELECT
      item->>'name' AS name,
      SUM((item->>'qty')::int) AS total_qty,
      SUM((item->>'qty')::int * (item->>'price')::numeric) AS total_revenue
    FROM orders,
    LATERAL jsonb_array_elements(items) AS item
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY item->>'name'
    ORDER BY total_revenue DESC
    LIMIT $3
  `, [f, t, limit]);
  return rows;
}

export async function productCategoryDistribution() {
  const { rows } = await pool.query(`
    SELECT COALESCE(category, 'Sin categoría') AS name,
      COUNT(*) AS count
    FROM products WHERE active = true
    GROUP BY category ORDER BY count DESC
  `);
  return rows;
}

export async function priceDistribution() {
  const { rows } = await pool.query(`
    SELECT
      CASE
        WHEN price < 10000 THEN '< $10K'
        WHEN price < 30000 THEN '$10K - $30K'
        WHEN price < 50000 THEN '$30K - $50K'
        WHEN price < 100000 THEN '$50K - $100K'
        ELSE '$100K+'
      END AS range,
      COUNT(*) AS count
    FROM products WHERE active = true
    GROUP BY range ORDER BY MIN(price)
  `);
  return rows;
}

// ── Orders ─────────────────────────────────────────────

export async function ordersByStatus(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const { rows } = await pool.query(`
    SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY status ORDER BY count DESC
  `, [f, t]);
  return rows;
}

export async function orderValueDistribution() {
  const { rows } = await pool.query(`
    SELECT
      CASE
        WHEN total < 50000 THEN '< $50K'
        WHEN total < 100000 THEN '$50K - $100K'
        WHEN total < 200000 THEN '$100K - $200K'
        WHEN total < 500000 THEN '$200K - $500K'
        ELSE '$500K+'
      END AS range,
      COUNT(*) AS count,
      COALESCE(SUM(total), 0) AS revenue
    FROM orders
    GROUP BY range ORDER BY MIN(total)
  `);
  return rows;
}

// ── Customers ──────────────────────────────────────────

export async function customerStats(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const total = await pool.query('SELECT COUNT(*) AS count FROM customers');
  const newCustomers = await pool.query(`
    SELECT DATE(created_at) AS date, COUNT(*) AS count
    FROM customers
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY DATE(created_at) ORDER BY date ASC
  `, [f, t]);
  return {
    total: parseInt(total.rows[0].count),
    newByDay: newCustomers.rows,
  };
}

export async function topCustomers(limit = 10) {
  const { rows } = await pool.query(`
    SELECT
      c.id, c.name, c.email, c.phone, c.city,
      c.total_orders, c.total_spent, c.last_order_date
    FROM customers c
    ORDER BY c.total_spent DESC NULLS LAST
    LIMIT $1
  `, [limit]);
  return rows;
}

export async function repeatPurchaseRate() {
  const { rows } = await pool.query(`
    WITH customer_orders AS (
      SELECT
        COALESCE(email, '') AS email_clean,
        COUNT(*) AS order_count
      FROM orders
      GROUP BY email_clean
    )
    SELECT
      COUNT(*) AS total_customers,
      COUNT(*) FILTER (WHERE order_count >= 2) AS repeat_customers,
      COUNT(*) FILTER (WHERE order_count = 1) AS one_time_customers,
      CASE WHEN COUNT(*) > 0
        THEN ROUND(COUNT(*) FILTER (WHERE order_count >= 2)::numeric / COUNT(*) * 100, 1)
        ELSE 0
      END AS repeat_rate
    FROM customer_orders
    WHERE email_clean != ''
  `);
  return rows[0];
}

export async function customersByCity() {
  const { rows } = await pool.query(`
    SELECT
      COALESCE(NULLIF(city, ''), 'Sin ciudad') AS name,
      COUNT(*) AS count,
      COALESCE(SUM(total_spent), 0) AS revenue
    FROM customers
    GROUP BY city
    ORDER BY count DESC
  `);
  return rows;
}

// ── Inventory ──────────────────────────────────────────

export async function inventorySummary() {
  const categories = await pool.query(`
    SELECT
      COALESCE(p.category, 'Sin categoría') AS category,
      COUNT(p.id) AS products,
      COALESCE(SUM(i.quantity), 0) AS total_stock,
      COALESCE(SUM(p.price * i.quantity), 0) AS stock_value
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    WHERE p.active = true
    GROUP BY p.category ORDER BY stock_value DESC
  `);
  const lowStock = await pool.query(`
    SELECT COUNT(*) AS count
    FROM inventory i JOIN products p ON p.id = i.product_id
    WHERE i.quantity <= i.min_stock
  `);
  const stockValue = await pool.query(`
    SELECT
      COALESCE(SUM(p.price * i.quantity), 0) AS total_value,
      COALESCE(SUM(i.quantity), 0) AS total_items,
      COUNT(p.id) FILTER (WHERE i.quantity > 0) AS products_with_stock,
      COUNT(p.id) FILTER (WHERE i.quantity IS NULL OR i.quantity = 0) AS out_of_stock
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    WHERE p.active = true
  `);
  return {
    categories: categories.rows,
    lowStockCount: parseInt(lowStock.rows[0].count),
    totalValue: parseFloat(stockValue.rows[0].total_value),
    totalItems: parseInt(stockValue.rows[0].total_items),
    productsWithStock: parseInt(stockValue.rows[0].products_with_stock),
    outOfStock: parseInt(stockValue.rows[0].out_of_stock),
  };
}

export async function inventoryValueByProduct(limit = 10) {
  const { rows } = await pool.query(`
    SELECT
      p.id, p.name, p.category, p.price,
      COALESCE(i.quantity, 0) AS stock,
      COALESCE(p.price * i.quantity, 0) AS stock_value
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    WHERE p.active = true
    ORDER BY stock_value DESC
    LIMIT $1
  `, [limit]);
  return rows;
}

// ── Summary KPIs ───────────────────────────────────────

export async function kpiSummary(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total), 0) AS total_revenue,
      COALESCE(ROUND(AVG(total), 0), 0) AS avg_order_value,
      COALESCE(SUM(COALESCE(discount, 0)), 0) AS total_discounts,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
      COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_orders
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
  `, [f, t]);
  return rows[0];
}

// ── Detailed reports ──────────────────────────────────

export async function salesDetail(period = 'monthly', from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  let trunc;
  if (period === 'weekly') trunc = "DATE_TRUNC('week', created_at)";
  else if (period === 'daily') trunc = 'DATE(created_at)';
  else if (period === 'annual') trunc = "DATE_TRUNC('year', created_at)";
  else trunc = "DATE_TRUNC('month', created_at)";

  const chartData = await pool.query(`
    SELECT ${trunc} AS date,
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY date ORDER BY date ASC
  `, [f, t]);

  const summary = await pool.query(`
    SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total), 0) AS total_revenue,
      COALESCE(ROUND(AVG(total), 0), 0) AS avg_order_value,
      COALESCE(MIN(total), 0) AS min_order,
      COALESCE(MAX(total), 0) AS max_order,
      COALESCE(SUM(total) / NULLIF(COUNT(*), 0), 0) AS revenue_per_order,
      COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_count
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
  `, [f, t]);

  const bestDay = await pool.query(`
    SELECT DATE(created_at) AS date, SUM(total) AS revenue, COUNT(*) AS orders
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY DATE(created_at) ORDER BY revenue DESC LIMIT 1
  `, [f, t]);

  return {
    chartData: chartData.rows,
    summary: summary.rows[0],
    bestDay: bestDay.rows[0] || null,
  };
}

export async function productDetail(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const totalRev = await pool.query(`
    SELECT COALESCE(SUM(total), 0) AS total FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
  `, [f, t]);
  const grandTotal = parseFloat(totalRev.rows[0].total) || 1;

  const products = await pool.query(`
    SELECT
      item->>'name' AS name,
      SUM((item->>'qty')::int) AS total_qty,
      SUM((item->>'qty')::int * (item->>'price')::numeric) AS total_revenue,
      ROUND(AVG((item->>'price')::numeric), 0) AS avg_price,
      ROUND(SUM((item->>'qty')::int * (item->>'price')::numeric) / $3 * 100, 1) AS revenue_pct,
      COUNT(*) AS order_count
    FROM orders,
    LATERAL jsonb_array_elements(items) AS item
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY item->>'name'
    ORDER BY total_revenue DESC
    LIMIT 20
  `, [f, t, grandTotal]);

  return {
    products: products.rows,
    totalRevenue: grandTotal,
    productCount: products.rows.length,
  };
}

export async function customerDetail(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const total = await pool.query('SELECT COUNT(*) AS count FROM customers');
  const period = await pool.query(`
    SELECT
      COUNT(*) AS total_orders,
      COUNT(DISTINCT COALESCE(email, '')) AS unique_customers,
      COUNT(*) FILTER (WHERE email IN (
        SELECT email FROM orders WHERE email != '' AND created_at < $1 GROUP BY email HAVING COUNT(*) >= 2
      )) AS returning_orders
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
  `, [f, t]);

  const top = await pool.query(`
    SELECT c.name, c.email, c.total_orders, c.total_spent, c.last_order_date, c.city
    FROM customers c
    ORDER BY c.total_spent DESC NULLS LAST LIMIT 10
  `);

  return {
    totalCustomers: parseInt(total.rows[0].count),
    periodOrders: parseInt(period.rows[0].total_orders),
    uniqueCustomers: parseInt(period.rows[0].unique_customers),
    returningOrders: parseInt(period.rows[0].returning_orders),
    topCustomers: top.rows,
  };
}

export async function inventoryDetail() {
  const summary = await pool.query(`
    SELECT
      COALESCE(SUM(p.price * i.quantity), 0) AS total_value,
      COALESCE(SUM(i.quantity), 0) AS total_items,
      COUNT(p.id) AS total_products,
      COUNT(p.id) FILTER (WHERE i.quantity > 0) AS products_with_stock,
      COUNT(p.id) FILTER (WHERE i.quantity IS NULL OR i.quantity = 0) AS out_of_stock,
      COUNT(p.id) FILTER (WHERE i.quantity <= i.min_stock AND i.quantity > 0) AS low_stock
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    WHERE p.active = true
  `);

  const categories = await pool.query(`
    SELECT
      COALESCE(p.category, 'Sin categoría') AS category,
      COUNT(p.id) AS products,
      COALESCE(SUM(i.quantity), 0) AS total_stock,
      COALESCE(SUM(p.price * i.quantity), 0) AS stock_value,
      ROUND(COALESCE(SUM(p.price * i.quantity), 0) / NULLIF((SELECT COALESCE(SUM(p2.price * i2.quantity), 0) FROM products p2 LEFT JOIN inventory i2 ON i2.product_id = p2.id WHERE p2.active = true), 0) * 100, 1) AS value_pct
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    WHERE p.active = true
    GROUP BY p.category ORDER BY stock_value DESC
  `);

  const lowStockItems = await pool.query(`
    SELECT p.name, p.category, p.price, i.quantity, i.min_stock,
      ROUND((i.quantity::numeric / NULLIF(i.min_stock, 0) - 1) * 100, 0) AS stock_status_pct
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    WHERE i.quantity <= i.min_stock
    ORDER BY (i.quantity::numeric / NULLIF(i.min_stock, 1)) ASC
    LIMIT 20
  `);

  return {
    summary: summary.rows[0],
    categories: categories.rows,
    lowStockItems: lowStockItems.rows,
  };
}

export async function orderDetail(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const byStatus = await pool.query(`
    SELECT status, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue,
      ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1) AS pct
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY status ORDER BY count DESC
  `, [f, t]);

  const timeline = await pool.query(`
    SELECT DATE(created_at) AS date,
      COUNT(*) AS orders,
      COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY DATE(created_at) ORDER BY date ASC
  `, [f, t]);

  return {
    byStatus: byStatus.rows,
    timeline: timeline.rows,
  };
}

export async function financialDetail(from, to) {
  const { from: f, to: t } = dateBounds(from, to);
  const revenue = await pool.query(`
    SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(total), 0) AS gross_revenue,
      COALESCE(SUM(COALESCE(discount, 0)), 0) AS total_discounts,
      COALESCE(SUM(total) - SUM(COALESCE(discount, 0)), 0) AS net_revenue,
      COALESCE(ROUND(AVG(total), 0), 0) AS avg_order_value,
      COALESCE(ROUND(AVG(COALESCE(discount, 0)), 0), 0) AS avg_discount
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
  `, [f, t]);

  const orderValues = await pool.query(`
    SELECT
      CASE
        WHEN total < 50000 THEN '< $50K'
        WHEN total < 100000 THEN '$50K - $100K'
        WHEN total < 200000 THEN '$100K - $200K'
        WHEN total < 500000 THEN '$200K - $500K'
        ELSE '$500K+'
      END AS range,
      COUNT(*) AS count,
      COALESCE(SUM(total), 0) AS revenue,
      ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1) AS pct
    FROM orders
    WHERE created_at >= $1 AND created_at <= ($2::date + interval '1 day')
    GROUP BY range ORDER BY MIN(total)
  `, [f, t]);

  return {
    revenue: revenue.rows[0],
    orderValues: orderValues.rows,
  };
}
