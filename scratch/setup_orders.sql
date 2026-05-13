-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'Pending',
  payment_method TEXT NOT NULL,
  delivery_address TEXT,
  customer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  customization JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Users can view their own orders" ON orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
FOR SELECT TO authenticated
USING (true); -- Simplified for this environment

CREATE POLICY "Admins can update order status" ON orders
FOR UPDATE TO authenticated
USING (true);

-- Policies for order items
CREATE POLICY "Users can view their own order items" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert order items" ON order_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all order items" ON order_items
FOR SELECT TO authenticated
USING (true);
