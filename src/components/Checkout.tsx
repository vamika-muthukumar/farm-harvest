import { useState } from 'react';
import { X, CreditCard, MapPin, Phone, Loader2, User, Mail } from 'lucide-react';
import { CartItem } from '../lib/supabase';

interface CheckoutProps {
  cartItems: CartItem[];
  total: number;
  onClose: () => void;
  onPlaceOrder: (name: string, email: string, address: string, phone: string) => Promise<void>;
}

export default function Checkout({ cartItems, total, onClose, onPlaceOrder }: CheckoutProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onPlaceOrder(name, email, address, phone);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.products.name} x {item.quantity}
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{(item.products.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t border-green-300 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-600">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4" />
              <span>Shipping Address</span>
            </label>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Enter your complete delivery address with village/city, district, state, and pincode"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4" />
              <span>Contact Number</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="[0-9]{10}"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="10-digit mobile number"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span>Payment Method</span>
            </h4>
            <div className="bg-white rounded-lg p-3 border border-blue-300">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  checked
                  readOnly
                  className="h-4 w-4 text-green-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Cash on Delivery</div>
                  <div className="text-xs text-gray-500">Pay when you receive your order</div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Placing Order...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Place Order - ₹{total.toLocaleString()}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
