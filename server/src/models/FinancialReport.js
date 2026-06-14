import pool from '../db.js';

export async function getTrialBalance(from, to) {
  const { rows } = await pool.query(`
    SELECT ac.id, ac.code, ac.name, ac.type,
      COALESCE(SUM(jel.debit), 0) AS total_debit,
      COALESCE(SUM(jel.credit), 0) AS total_credit
    FROM account_charts ac
    LEFT JOIN journal_entry_lines jel ON jel.account_chart_id = ac.id
    LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id AND je.status = 'posted'
      AND je.entry_date >= $1 AND je.entry_date <= $2
    GROUP BY ac.id, ac.code, ac.name, ac.type
    ORDER BY ac.code
  `, [from, to]);
  return rows;
}

export async function getIncomeStatement(from, to) {
  const { rows } = await pool.query(`
    SELECT ac.id, ac.code, ac.name, ac.type,
      COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0) AS balance
    FROM account_charts ac
    LEFT JOIN journal_entry_lines jel ON jel.account_chart_id = ac.id
    LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id AND je.status = 'posted'
      AND je.entry_date >= $1 AND je.entry_date <= $2
    WHERE ac.type IN ('income', 'expense')
    GROUP BY ac.id, ac.code, ac.name, ac.type
    ORDER BY ac.type, ac.code
  `, [from, to]);

  const income = rows.filter(r => r.type === 'income');
  const expenses = rows.filter(r => r.type === 'expense');
  const totalIncome = income.reduce((s, r) => s + parseFloat(r.balance || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + parseFloat(Math.abs(r.balance || 0)), 0);
  const netIncome = totalIncome - totalExpenses;

  return { income, expenses, totalIncome, totalExpenses, netIncome };
}

export async function getBalanceSheet(asOf) {
  const assets = await pool.query(`
    SELECT ac.id, ac.code, ac.name,
      COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0) AS balance
    FROM account_charts ac
    LEFT JOIN journal_entry_lines jel ON jel.account_chart_id = ac.id
    LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id AND je.status = 'posted' AND je.entry_date <= $1
    WHERE ac.type = 'asset'
    GROUP BY ac.id, ac.code, ac.name ORDER BY ac.code
  `, [asOf]);

  const liabilities = await pool.query(`
    SELECT ac.id, ac.code, ac.name,
      COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0) AS balance
    FROM account_charts ac
    LEFT JOIN journal_entry_lines jel ON jel.account_chart_id = ac.id
    LEFT JOIN journal_entries je ON je.id = jel.journal_entry_id AND je.status = 'posted' AND je.entry_date <= $1
    WHERE ac.type IN ('liability', 'equity')
    GROUP BY ac.id, ac.code, ac.name ORDER BY ac.code
  `, [asOf]);

  const totalAssets = assets.rows.reduce((s, r) => s + parseFloat(r.balance || 0), 0);
  const totalLiabilitiesEquity = liabilities.rows.reduce((s, r) => s + parseFloat(Math.abs(r.balance || 0)), 0);

  return {
    assets: assets.rows,
    liabilities: liabilities.rows.filter(r => r.code.startsWith('2')),
    equity: liabilities.rows.filter(r => !r.code.startsWith('2')),
    totalAssets,
    totalLiabilitiesEquity,
  };
}
