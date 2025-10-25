import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    await onAddToCart(product.id, quantity);
    setAdding(false);
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative h-56 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            product.category === 'crops'
              ? 'bg-amber-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            {product.category === 'crops' ? 'Crops' : 'Fertilizers'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-green-600">
              ₹{product.price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">{product.unit}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">
              In Stock: {product.stock}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{adding ? 'Adding...' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
