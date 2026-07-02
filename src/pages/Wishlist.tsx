import { useStore } from '../store';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Product } from '../types';

export default function Wishlist() {
  const { userEmail, wishlists } = useStore();
  const [wishlistedProducts, setWishlistedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const userWishlist = userEmail ? wishlists[userEmail] || [] : [];

  useEffect(() => {
    if (!userEmail) return;
    
    if (userWishlist.length === 0) {
      setWishlistedProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/products?ids=${userWishlist.join(',')}`)
      .then(res => res.json())
      .then(data => {
        setWishlistedProducts(data);
        setLoading(false);
      });
  }, [userEmail, wishlists]);

  if (!userEmail) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Wishlist</h1>
      </div>

      {loading ? (
        <div className="py-20 text-center">Loading...</div>
      ) : wishlistedProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
