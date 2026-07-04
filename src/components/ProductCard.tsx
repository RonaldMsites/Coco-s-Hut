import React from "react";
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useStore } from '../store';
import { Heart } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { language, userEmail, setAuthModalOpen, wishlists, toggleWishlist, setPendingWishlistId } = useStore();
  const desc = product.descriptions[language] || product.descriptions['en'] || '';

  const isWishlisted = userEmail ? (wishlists[userEmail] || []).includes(product.id) : false;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userEmail) {
      setPendingWishlistId(product.id);
      setAuthModalOpen(true);
    } else {
      toggleWishlist(userEmail, product.id);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group flex flex-col gap-3 relative">
      <div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden">
        <img 
          src={product.images[0]} 
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 z-10">
          <button 
            onClick={handleWishlistClick} 
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={clsx("w-4 h-4 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600")} />
          </button>
        </div>
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isBestSeller && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Best Seller
            </span>
          )}
          {product.isTrending && (
            <span className="bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Trending
            </span>
          )}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-gray-900 line-clamp-1">{product.title}</h3>
          <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{desc}</p>
      </div>
    </Link>
  );
}
