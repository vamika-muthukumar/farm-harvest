import { useEffect, useState } from 'react';
import { supabase, Product, CartItem, getSessionId } from './lib/supabase';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { Loader2, Sprout, Leaf } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crops' | 'fertilizers'>('all');
  const [sessionId] = useState(getSessionId());

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
    setLoading(false);
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (data) setProducts(data);
  };

  const fetchCartItems = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('session_id', sessionId);
    if (data) setCartItems(data);
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    const existingItem = cartItems.find(item => item.product_id === productId);

    if (existingItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({
          session_id: sessionId,
          product_id: productId,
          quantity,
        });
    }

    fetchCartItems();
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);
    fetchCartItems();
  };

  const handleRemoveItem = async (itemId: string) => {
    await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
    fetchCartItems();
  };

  const handlePlaceOrder = async (name: string, email: string, address: string, phone: string) => {
    if (cartItems.length === 0) return;

    const total = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: name,
        customer_email: email,
        total_amount: total,
        status: 'pending',
        shipping_address: address,
        phone,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
    }));

    await supabase.from('order_items').insert(orderItems);

    await supabase
      .from('cart_items')
      .delete()
      .eq('session_id', sessionId);

    fetchCartItems();
    setShowCart(false);

    alert(`Thank you for your order, ${name}! Your order has been placed successfully. We'll contact you at ${email} for confirmation.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
      </div>
    );
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar
        cartCount={cartItems.length}
        onCartClick={() => setShowCart(true)}
      />

      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 animate-pulse">
            <Sprout className="h-32 w-32" />
          </div>
          <div className="absolute bottom-10 right-10 animate-pulse delay-150">
            <Leaf className="h-40 w-40" />
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to AgriMart</h1>
          <p className="text-xl text-green-100 mb-8">
            Premium Quality Seeds, Fertilizers & Agricultural Products
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setSelectedCategory('crops')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedCategory === 'crops'
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              Crops & Seeds
            </button>
            <button
              onClick={() => setSelectedCategory('fertilizers')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedCategory === 'fertilizers'
                  ? 'bg-white text-green-700 shadow-lg'
                  : 'bg-green-700 text-white hover:bg-green-800'
              }`}
            >
              Fertilizers
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedCategory === 'all' ? 'All Products' :
             selectedCategory === 'crops' ? 'Crops & Seeds' : 'Fertilizers'}
          </h2>
          <p className="text-gray-600">
            {filteredProducts.length} products available
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>

      {showCart && (
        <Cart
          cartItems={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
        />
      )}

      {showCheckout && (
        <Checkout
          cartItems={cartItems}
          total={cartTotal}
          onClose={() => setShowCheckout(false)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
}

export default App;
