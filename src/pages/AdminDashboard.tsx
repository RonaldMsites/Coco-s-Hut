import React from "react";
import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Order, Product } from '../types';
import { Package, Truck, ExternalLink, Edit2, Trash2, Plus, X } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

function ProductEditorModal({ product, onClose, onSave }: { product?: Product | null, onClose: () => void, onSave: (p: Partial<Product>) => void }) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    price: product?.price || 0,
    category: product?.category || 'Electronics',
    discountPrice: product?.discountPrice || '',
    shippingCost: product?.shippingCost || '',
    seoKeywords: product?.seoKeywords?.join(', ') || '',
    descriptionEn: product?.descriptions?.en || '',
  });

  const [images, setImages] = useState<string[]>(product?.images || []);
  const [video, setVideo] = useState<string>(product?.video || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (images.length + files.length > 5) {
        alert("You can only upload up to 5 images.");
        return;
      }
      Array.from(files).forEach(file => {
        if (file.size > 2 * 1024 * 1024) {
          alert(`File ${file.name} is too large (max 2MB)`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => {
            if (prev.length < 5) {
              return [...prev, reader.result as string];
            }
            return prev;
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert(`Video ${file.name} is too large (max 3MB for Vercel demo)`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    onSave({
      title: formData.title,
      price: Number(formData.price),
      category: formData.category,
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
      shippingCost: formData.shippingCost ? Number(formData.shippingCost) : undefined,
      images: images,
      video: video || undefined,
      seoKeywords: formData.seoKeywords.split(',').map(s => s.trim()).filter(Boolean),
      descriptions: { ...product?.descriptions, en: formData.descriptionEn }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors z-10 bg-white rounded-full">
          <X className="w-5 h-5" />
        </button>
        <div className="p-8 overflow-y-auto flex-1">
          <h2 className="text-2xl font-bold mb-6">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Category</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Price ($) (Optional)</label>
                <input type="number" step="0.01" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Cost ($) (Optional)</label>
                <input type="number" step="0.01" value={formData.shippingCost} onChange={e => setFormData({...formData, shippingCost: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Images (Up to 5)</label>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                {images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded overflow-hidden">
                        <img src={img} className="object-cover w-full h-full" />
                        <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 m-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Video (Optional)</label>
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                {video && (
                  <div className="mt-2 relative w-32 h-32 rounded overflow-hidden">
                    <video src={video} className="object-cover w-full h-full" muted />
                    <button type="button" onClick={() => setVideo('')} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 m-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">SEO Keywords (comma separated)</label>
                <input value={formData.seoKeywords} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description (English)</label>
                <textarea required rows={3} value={formData.descriptionEn} onChange={e => setFormData({...formData, descriptionEn: e.target.value})} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="submit" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { role, userEmail } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<'orders' | 'products'>('orders');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const fetchProducts = () => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
  };

  useEffect(() => {
    if (role === 'admin') {
      fetch('/api/orders').then(res => res.json()).then(setOrders);
      fetchProducts();
    }
  }, [role]);

  if (userEmail !== 'ronaldmulenga2000@gmail.com' || role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleDispatch = (id: string) => {
    fetch(`/api/orders/${id}/dispatch`, { method: 'PUT' })
      .then(res => res.json())
      .then(updated => {
        setOrders(orders.map(o => o.id === updated.id ? updated : o));
        alert(`Order dispatched! Tracking link: ${updated.trackingLink}\n\n(Simulated SMS sent to customer)`);
      });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      fetch(`/api/products/${id}`, { method: 'DELETE' })
        .then(() => fetchProducts());
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (!res.ok) throw new Error(await res.text());
        setEditingProduct(null);
        fetchProducts();
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...productData,
            variants: [{ color: 'Default', size: 'One Size', sku: 'NEW', inventory: 100 }],
            isBestSeller: false,
            isFeatured: false,
            isTrending: false
          })
        });
        if (!res.ok) throw new Error(await res.text());
        setIsAddingProduct(false);
        fetchProducts();
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to save product. Ensure the files are not too large. Error: " + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
        <div className="flex bg-gray-100 rounded-full p-1">
          <button 
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${view === 'orders' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            onClick={() => setView('orders')}
          >
            Orders
          </button>
          <button 
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${view === 'products' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            onClick={() => setView('products')}
          >
            Products
          </button>
        </div>
      </div>

      {view === 'orders' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{o.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.customerEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${o.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${o.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {o.status === 'Processing' && (
                      <button 
                        onClick={() => handleDispatch(o.id)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end space-x-1"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Dispatch</span>
                      </button>
                    )}
                    {o.status !== 'Processing' && o.trackingLink && (
                      <Link to={`/track/${o.id}`} className="text-gray-500 hover:text-gray-900 flex items-center justify-end space-x-1">
                        <ExternalLink className="w-4 h-4" />
                        <span>View Tracking</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col group">
              <div className="flex items-start space-x-4 mb-4">
                <img src={p.images[0]} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{p.title}</h3>
                  <div className="text-sm text-gray-500">${p.price.toFixed(2)}</div>
                  {p.discountPrice && (
                    <div className="text-xs text-green-600">Discount: ${p.discountPrice.toFixed(2)}</div>
                  )}
                  {p.shippingCost !== undefined && (
                    <div className="text-xs text-indigo-600">Shipping: ${p.shippingCost.toFixed(2)}</div>
                  )}
                </div>
              </div>
              <div className="mt-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Inventory:</span>
                  <span className="font-medium text-gray-900">{p.totalInventory} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SEO Keywords:</span>
                  <span className="font-medium text-gray-900">{p.seoKeywords.length} tags</span>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center">
                  <Link to={`/product/${p.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    Manage Toggles <ExternalLink className="w-4 h-4" />
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProduct(p)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setIsAddingProduct(true)} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-100 hover:border-gray-300 transition-colors group">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
               <Plus className="w-6 h-6 text-gray-600" />
             </div>
             <span className="font-medium text-gray-900">Add New Product</span>
             <span className="text-xs text-gray-500 mt-1">Create a new listing</span>
          </button>
        </div>
      )}
      
      {(isAddingProduct || editingProduct) && (
        <ProductEditorModal
          product={editingProduct}
          onClose={() => {
            setIsAddingProduct(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
