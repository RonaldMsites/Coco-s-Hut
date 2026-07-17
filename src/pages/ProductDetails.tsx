import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { useStore } from '../store';
import { Star, Shield, CheckCircle, Video } from 'lucide-react';
import clsx from 'clsx';
import { t } from '../i18n';

export default function ProductDetails() {
  const { id } = useParams();
  const { role, addToCart, addViewedKeywords, language } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then((data: Product) => {
        setProduct(data);
        if (data.variants.length > 0) {
          setSelectedColor(data.variants[0].color);
          setSelectedSize(data.variants[0].size);
        }
        // Add to browsing history
        if (data.seoKeywords) {
          addViewedKeywords(data.seoKeywords);
        }
      });
  }, [id, addViewedKeywords]);

  if (!product) return <div className="p-20 text-center">Loading...</div>;

  const desc = product.descriptions[language] || product.descriptions['en'] || '';
  const colors = Array.from(new Set(product.variants.map(v => v.color)));
  const sizes = Array.from(new Set(product.variants.filter(v => v.color === selectedColor).map(v => v.size)));
  const currentVariant = product.variants.find(v => v.color === selectedColor && v.size === selectedSize);
  const inStock = currentVariant ? currentVariant.inventory > 0 : false;

  const handleAddToCart = () => {
    if (currentVariant && inStock) {
      addToCart({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity,
        variant: { color: selectedColor, size: selectedSize },
        image: product.images[0]
      });
      alert('Added to cart!');
    }
  };

  const toggleAdminProp = (prop: 'isBestSeller' | 'isFeatured' | 'isTrending') => {
    const updated = { ...product, [prop]: !product[prop] };
    setProduct(updated);
    fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {role === 'admin' && (
        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-800">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Admin Controls</span>
          </div>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={product.isBestSeller} onChange={() => toggleAdminProp('isBestSeller')} className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium">Best Seller</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={product.isFeatured} onChange={() => toggleAdminProp('isFeatured')} className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium">Featured</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={product.isTrending} onChange={() => toggleAdminProp('isTrending')} className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium">Trending</span>
            </label>
            <button onClick={() => setAdminMode(!adminMode)} className="text-sm text-indigo-600 underline font-medium">
              Edit SEO
            </button>
          </div>
        </div>
      )}

      {adminMode && (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-4">Edit SEO Keywords (Comma separated)</h3>
          <textarea 
            className="w-full border-gray-300 rounded-lg shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            defaultValue={product.seoKeywords.join(', ')}
            onBlur={(e) => {
              const keys = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              const updated = { ...product, seoKeywords: keys };
              setProduct(updated);
              fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
              });
            }}
          />
          <p className="text-xs text-gray-500 mt-2">Keywords help this product appear in search and recommendations.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Media */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden relative">
            {product.video ? (
              <video src={product.video} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            )}
            {product.video && (
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-2 rounded-full">
                <Video className="w-5 h-5" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
             <div className="grid grid-cols-4 gap-4">
               {product.images.slice(1).map((img, i) => (
                 <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                   <img src={img} className="w-full h-full object-cover" />
                 </div>
               ))}
             </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-sm font-medium text-indigo-600 mb-2">{product.category}</span>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">{product.title}</h1>
          <div className="text-2xl font-medium text-gray-900 mb-6">${product.price.toFixed(2)}</div>
          
          <div className="flex items-center space-x-2 mb-8">
            <div className="flex items-center text-yellow-400">
              {[1,2,3,4,5].map(star => (
                <Star key={star} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviews.length} reviews)</span>
          </div>

          <p className="text-base text-gray-600 mb-10 leading-relaxed">{desc}</p>

          <div className="space-y-8 mb-10">
            {/* Colors */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">{t(language, 'color')}</h3>
              <div className="flex items-center space-x-3">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setSelectedSize(''); }}
                    className={clsx(
                      "px-4 py-2 border rounded-full text-sm font-medium transition-all",
                      selectedColor === color ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-900 hover:border-gray-900"
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {selectedColor && sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">{t(language, 'size')}</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {sizes.map(size => {
                    const v = product.variants.find(v => v.color === selectedColor && v.size === size);
                    const isAvail = v && v.inventory > 0;
                    return (
                      <button
                        key={size}
                        disabled={!isAvail}
                        onClick={() => setSelectedSize(size)}
                        className={clsx(
                          "py-3 border rounded-xl text-sm font-medium flex items-center justify-center transition-all",
                          selectedSize === size ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 text-gray-900",
                          !isAvail && "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-100"
                        )}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 mt-auto">
            <div className="flex items-center border border-gray-200 rounded-full bg-white">
              <button 
                className="px-5 py-3 text-gray-600 hover:text-gray-900"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button 
                className="px-5 py-3 text-gray-600 hover:text-gray-900"
                onClick={() => setQuantity(quantity + 1)}
              >+</button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!inStock || !selectedSize}
              className={clsx(
                "flex-1 rounded-full py-4 px-8 font-semibold text-lg transition-all flex items-center justify-center space-x-2",
                inStock && selectedSize ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <span>{inStock ? (selectedSize ? t(language, 'addToCart') : t(language, 'selectSize')) : t(language, 'outOfStock')}</span>
            </button>
          </div>

          <div className="mt-8 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{t(language, 'freeShipping')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{t(language, 'returns')}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews */}
      <div className="mt-24 pt-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold mb-8">{t(language, 'customerReviews')}</h2>
        {product.reviews.length === 0 ? (
          <p className="text-gray-500">{t(language, 'noReviews')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.reviews.map(r => (
              <div key={r.id} className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="font-bold text-gray-900">{r.author}</div>
                  <div className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</div>
                </div>
                <div className="flex text-yellow-400 mb-3">
                   {Array.from({length: 5}).map((_, i) => (
                     <Star key={i} className={clsx("w-4 h-4", i < r.rating ? "fill-current" : "text-gray-300")} />
                   ))}
                </div>
                <p className="text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
