import pool from '../db.js';

/* ===== JOURNAL ENTRIES (double-entry) ===== */
export async function getJournalEntries(filters = {}) {
  let sql = `SELECT je.*, tp.name AS third_party_name
    FROM journal_entries je LEFT JOIN third_parties tp ON tp.id = je.third_party_id WHERE 1=1`;
  const params = []; let idx = 1;
  if (filters.status) { sql += ` AND je.status = $${idx++}`; params.push(filters.status); }
  if (filters.from) { sql += ` AND je.entry_date >= $${idx++}`; params.push(filters.from); }
  if (filters.to) { sql += ` AND je.entry_date <= $${idx++}`; params.push(filters.to); }
  sql += ' ORDER BY je.entry_date DESC, je.id DESC';
  const { rows } = await pool.query(sql, params);

  for (const entry of rows) {
    const { rows: lines } = await pool.query(
      `SELECT jel.*, ac.code AS account_code, ac.name AS account_name
       FROM journal_entry_lines jel JOIN account_charts ac ON ac.id = jel.account_chart_id
       WHERE jel.journal_entry_id = $1 ORDER BY jel.id`,
      [entry.id],
    );
    entry.lines = lines;
    entry.debit_total = lines.reduce((s, l) => s + parseFloat(l.debit || 0), 0);
    entry.credit_total = lines.reduce((s, l) => s + parseFloat(l.credit || 0), 0);
  }
  return rows;
}

export async function getJournalEntry(id) {
  const { rows } = await pool.query(
    `SELECT je.*, tp.name AS third_party_name FROM journal_entries je
     LEFT JOIN third_parties tp ON tp.id = je.third_party_id WHERE je.id = $1`, [id]);
  if (!rows[0]) return null;
  const { rows: lines } = await pool.query(
    `SELECT jel.*, ac.code AS account_code, ac.name AS account_name
     FROM journal_entry_lines jel JOIN account_charts ac ON ac.id = jel.account_chart_id
     WHERE jel.journal_entry_id = $1 ORDER BY jel.id`, [id]);
  rows[0].lines = lines;
  rows[0].debit_total = lines.reduce((s, l) => s + parseFloat(l.debit || 0), 0);
  rows[0].credit_total = lines.reduce((s, l) => s + parseFloat(l.credit || 0), 0);
  return rows[0];
}

export async function createJournalEntry(data) {
  const number = await nextEntryNumber();
  const { rows } = await pool.query(
    `INSERT INTO journal_entries (entry_number, entry_date, description, third_party_id, cost_center_id, status)
     VALUES ($1,$2,$3,$4,$5,'draft') RETURNING *`,
    [number, data.entry_date || new Date(), data.description, data.third_party_id || null, data.cost_center_id || null],
  );
  const entry = rows[0];
  if (data.lines && data.lines.length) {
    for (const line of data.lines) {
      await pool.query(
        `INSERT INTO journal_entry_lines (journal_entry_id, account_chart_id, description, debit, credit, third_party_id, cost_center_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [entry.id, line.account_chart_id, line.description || '', line.debit || 0, line.credit || 0, line.third_party_id || null, line.cost_center_id || null],
      );
    }
  }
  return getJournalEntry(entry.id);
}

export async function updateJournalEntryStatus(id, status) {
  const { rows } = await pool.query(
    'UPDATE journal_entries SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *',
    [status, id],
  );
  return rows[0] || null;
}

async function nextEntryNumber() {
  const year = new Date().getFullYear();
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM journal_entries WHERE EXTRACT(YEAR FROM created_at) = $1`, [year]);
  const n = parseInt(rows[0].cnt) + 1;
  return `C-${year}-${String(n).padStart(4, '0')}`;
}

/* ===== INVOICES ===== */
export async function getInvoices(filters = {}) {
  let sql = `SELECT inv.*, tp.name AS third_party_name
    FROM invoices inv JOIN third_parties tp ON tp.id = inv.third_party_id WHERE 1=1`;
  const params = []; let idx = 1;
  if (filters.status) { sql += ` AND inv.status = $${idx++}`; params.push(filters.status); }
  if (filters.type) { sql += ` AND inv.invoice_type = $${idx++}`; params.push(filters.type); }
  sql += ' ORDER BY inv.issue_date DESC, inv.id DESC';
  const { rows } = await pool.query(sql, params);
  for (const inv of rows) {
    const { rows: items } = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id', [inv.id]);
    inv.items = items;
  }
  return rows;
}

export async function getInvoice(id) {
  const { rows } = await pool.query(
    `SELECT inv.*, tp.name AS third_party_name FROM invoices inv JOIN third_parties tp ON tp.id = inv.third_party_id WHERE inv.id = $1`, [id]);
  if (!rows[0]) return null;
  const { rows: items } = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id', [id]);
  rows[0].items = items;
  return rows[0];
}

export async function createInvoice(data) {
  const number = await nextInvoiceNumber(data.invoice_type);
  const subtotal = data.items ? data.items.reduce((s, it) => s + it.quantity * it.unit_price, 0) : 0;
  const tax = data.items ? data.items.reduce((s, it) => s + (it.quantity * it.unit_price * it.tax_rate / 100), 0) : 0;
  const total = subtotal + tax;
  const { rows } = await pool.query(
    `INSERT INTO invoices (invoice_number, invoice_type, third_party_id, issue_date, due_date, subtotal, tax_amount, total, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft') RETURNING *`,
    [number, data.invoice_type, data.third_party_id, data.issue_date || new Date(), data.due_date || null, subtotal, tax, total],
  );
  const inv = rows[0];
  if (data.items) {
    for (const it of data.items) {
      const itemTotal = it.quantity * it.unit_price * (1 + it.tax_rate / 100);
      await pool.query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, total) VALUES ($1,$2,$3,$4,$5,$6)`,
        [inv.id, it.description, it.quantity, it.unit_price, it.tax_rate || 0, itemTotal],
      );
    }
  }
  return getInvoice(inv.id);
}

export async function updateInvoiceStatus(id, status) {
  const { rows } = await pool.query('UPDATE invoices SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
  return rows[0] || null;
}

async function nextInvoiceNumber(type) {
  const prefix = type === 'sales' ? 'FE' : type === 'purchase' ? 'FC' : 'NC';
  const year = new Date().getFullYear();
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS cnt FROM invoices WHERE EXTRACT(YEAR FROM issue_date) = $1 AND invoice_type = $2`, [year, type]);
  const n = parseInt(rows[0].cnt) + 1;
  return `${prefix}-${year}-${String(n).padStart(5, '0')}`;
}

/* ===== CUENTAS POR COBRAR/PAGAR ===== */
export async function getReceivablePayable(filters = {}) {
  let sql = `SELECT arp.*, tp.name AS third_party_name, inv.invoice_number
    FROM accounts_receivable_payable arp
    JOIN third_parties tp ON tp.id = arp.third_party_id
    LEFT JOIN invoices inv ON inv.id = arp.invoice_id
    WHERE 1=1`;
  const params = []; let idx = 1;
  if (filters.type) { sql += ` AND arp.type = $${idx++}`; params.push(filters.type); }
  if (filters.status) { sql += ` AND arp.status = $${idx++}`; params.push(filters.status); }
  sql += ' ORDER BY arp.due_date ASC';
  const { rows } = await pool.query(sql, params);
  return rows.map(r => ({ ...r, days_overdue: r.due_date ? Math.max(0, Math.floor((Date.now() - new Date(r.due_date).getTime()) / 86400000)) : 0 }));
}

export async function createReceivablePayable(data) {
  const { rows } = await pool.query(
    `INSERT INTO accounts_receivable_payable (type, third_party_id, invoice_id, journal_entry_id, original_amount, balance, due_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.type, data.third_party_id, data.invoice_id || null, data.journal_entry_id || null, data.amount, data.amount, data.due_date, 'pending'],
  );
  return rows[0];
}

/* ===== BANK RECONCILIATION ===== */
export async function getReconciliations(bankAccountId) {
  const { rows } = await pool.query(
    'SELECT * FROM bank_reconciliation WHERE bank_account_id = $1 ORDER BY reconciliation_date DESC', [bankAccountId]);
  return rows;
}

export async function createReconciliation(data) {
  const diff = parseFloat(data.bank_balance) - parseFloat(data.system_balance);
  const { rows } = await pool.query(
    `INSERT INTO bank_reconciliation (bank_account_id, reconciliation_date, bank_balance, system_balance, difference, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.bank_account_id, data.reconciliation_date, data.bank_balance, data.system_balance, diff, diff === 0 ? 'matched' : 'unmatched', data.notes || ''],
  );
  return rows[0];
}
