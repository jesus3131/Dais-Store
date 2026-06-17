CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  city VARCHAR(100),
  department VARCHAR(100),
  address TEXT,
  notes TEXT,
  total_orders INTEGER DEFAULT 1,
  total_spent NUMERIC DEFAULT 0,
  last_order_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
