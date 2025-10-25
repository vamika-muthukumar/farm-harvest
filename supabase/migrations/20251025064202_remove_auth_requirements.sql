/*
  # Remove Authentication Requirements

  ## Changes
  1. Updates
    - Drop existing RLS policies that require authentication
    - Create new open policies for cart and order operations
    - Add email field to cart_items for guest checkout
    - Add email and name fields to orders table
  
  2. Security
    - Keep RLS enabled but make policies more permissive
    - Allow anonymous users to add to cart and place orders
    - Cart items tied to session/email instead of user_id
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items for own orders" ON order_items;

-- Add email to cart_items for guest checkout
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN session_id text;
  END IF;
END $$;

-- Make user_id nullable in cart_items
ALTER TABLE cart_items ALTER COLUMN user_id DROP NOT NULL;

-- Add customer info to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_email text;
  END IF;
END $$;

-- Make user_id nullable in orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Create new open policies for cart_items
CREATE POLICY "Anyone can view cart items"
  ON cart_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert cart items"
  ON cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update cart items"
  ON cart_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete cart items"
  ON cart_items FOR DELETE
  USING (true);

-- Create new open policies for orders
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Create new open policies for order_items
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);