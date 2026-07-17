import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useStore } from '../store';
import { t } from '../i18n';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useStore();

  const CATEGORIES = [
    "Electronics",
    "Home & Furniture",
    "Clothing (Men's wear)",
    "Clothing (Women's wear)",
    "Jewelry",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Toys & Games",
    "Groceries",
    "Other"
  ];

  useEffect(() => {
    setLoading(true);
    let url = `/api/products?q=${encodeURIComponent(query)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      });
  }, [query, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
        {query ? `${t(language, 'searchResults')} "${query}"` : category ? category : t(language, 'allProducts')}
      </h1>
      <p className="text-gray-500 mb-6">{results.length} {t(language, 'productsFound')}</p>

      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.delete('category');
            setSearchParams(params);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!category ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('category', c);
              setSearchParams(params);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                  <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">{t(language, 'noProductsFound')}</p>
        </div>
      )}
    </div>
  );
}
