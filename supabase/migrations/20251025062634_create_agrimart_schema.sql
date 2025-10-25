/*
  # AgriMart - Agricultural E-Commerce Database Schema

  ## Overview
  Complete database schema for a farmers' agricultural marketplace with crops, 
  fertilizers, shopping cart, and order management.

  ## New Tables

  ### 1. `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `description` (text) - Detailed product description
  - `category` (text) - Either 'crops' or 'fertilizers'
  - `price` (numeric) - Product price
  - `unit` (text) - Unit of measurement (kg, liter, quintal, etc.)
  - `stock` (integer) - Available quantity
  - `image_url` (text) - Product image URL
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. `cart_items`
  - `id` (uuid, primary key) - Unique cart item identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `product_id` (uuid) - Reference to products table
  - `quantity` (integer) - Quantity in cart
  - `created_at` (timestamptz) - When item was added to cart

  ### 3. `orders`
  - `id` (uuid, primary key) - Unique order identifier
  - `user_id` (uuid) - Reference to authenticated user
  - `total_amount` (numeric) - Total order amount
  - `status` (text) - Order status (pending, processing, completed, cancelled)
  - `shipping_address` (text) - Delivery address
  - `phone` (text) - Contact phone number
  - `created_at` (timestamptz) - Order creation timestamp

  ### 4. `order_items`
  - `id` (uuid, primary key) - Unique order item identifier
  - `order_id` (uuid) - Reference to orders table
  - `product_id` (uuid) - Reference to products table
  - `quantity` (integer) - Quantity ordered
  - `price` (numeric) - Price at time of order
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Products: Public read access, admin only for modifications
  - Cart items: Users can only access their own cart
  - Orders: Users can only access their own orders
  - Order items: Users can only access items from their own orders

  ## Sample Data
  - Pre-populated with sample crops and fertilizers for demonstration
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('crops', 'fertilizers')),
  price numeric NOT NULL CHECK (price >= 0),
  unit text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  shipping_address text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Cart items policies
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample products
INSERT INTO products (name, description, category, price, unit, stock, image_url) VALUES
('Organic Wheat Seeds', 'Premium quality organic wheat seeds for high yield farming. Disease resistant and suitable for all soil types.', 'crops', 850, 'per kg', 500, 'https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg'),
('Basmati Rice Seeds', 'Authentic basmati rice seeds with excellent aroma and long grain characteristics.', 'crops', 1200, 'per kg', 300, 'https://images.pexels.com/photos/1537169/pexels-photo-1537169.jpeg'),
('Corn Seeds (Hybrid)', 'High yielding hybrid corn seeds suitable for commercial farming.', 'crops', 650, 'per kg', 450, 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg'),
('Tomato Seeds', 'Fresh tomato seeds for greenhouse and open field cultivation.', 'crops', 2500, 'per 100g', 200, 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg'),
('Cotton Seeds', 'BT cotton seeds with excellent fiber quality and pest resistance.', 'crops', 750, 'per kg', 600, 'https://images.pexels.com/photos/6129002/pexels-photo-6129002.jpeg'),
('Potato Seeds', 'Certified potato seeds for high yield production.', 'crops', 900, 'per kg', 350, 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg'),
('NPK Fertilizer', 'Balanced NPK 19-19-19 fertilizer for all crops. Promotes healthy growth and maximum yield.', 'fertilizers', 1200, 'per 50kg bag', 400, 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg'),
('Urea Fertilizer', 'High nitrogen content urea fertilizer for leafy growth and greening.', 'fertilizers', 850, 'per 50kg bag', 500, 'https://images.pexels.com/photos/4505171/pexels-photo-4505171.jpeg'),
('Organic Compost', '100% organic compost made from farm waste. Improves soil health naturally.', 'fertilizers', 450, 'per 40kg bag', 300, 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg'),
('Phosphate Fertilizer', 'Single super phosphate for root development and flowering.', 'fertilizers', 950, 'per 50kg bag', 350, 'https://images.pexels.com/photos/4503270/pexels-photo-4503270.jpeg'),
('Potash Fertilizer', 'Muriate of potash for fruit quality and disease resistance.', 'fertilizers', 1100, 'per 50kg bag', 280, 'https://images.pexels.com/photos/4505170/pexels-photo-4505170.jpeg'),
('Bio-Fertilizer', 'Microbial bio-fertilizer for sustainable farming and soil enrichment.', 'fertilizers', 650, 'per 25kg bag', 250, 'https://images.pexels.com/photos/4503268/pexels-photo-4503268.jpeg')
ON CONFLICT DO NOTHING;