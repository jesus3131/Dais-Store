CREATE TABLE IF NOT EXISTS accounting_entries (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'transferencia',
  reference VARCHAR(200) DEFAULT '',
  is_tax_deductible BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accounting_type ON accounting_entries(type);
CREATE INDEX IF NOT EXISTS idx_accounting_date ON accounting_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_accounting_category ON accounting_entries(category);
