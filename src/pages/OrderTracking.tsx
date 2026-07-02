import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Order } from '../types';
import { Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store';
import { t } from '../i18n';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const { language } = useStore();

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setOrder(data);
      })
      .catch(() => setError('Failed to load tracking info'));
  }, [id]);

  if (error) return <div className="p-20 text-center text-red-500 font-medium">{error}</div>;
  if (!order) return <div className="p-20 text-center text-gray-500">Loading tracking information...</div>;

  const steps = ['Processing', 'Dispatched', 'In Transit', 'Delivered'];
  const currentStep = steps.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mb-4">
            <Package className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{t(language, 'trackOrder')}</h1>
          <p className="text-gray-500">Order #{order.id}</p>
        </div>

        {/* Timeline */}
        <div className="relative mb-16">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-1000"
            style={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          <div className="relative flex justify-between">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isActive = idx === currentStep;
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500",
                    isCompleted ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400 border-2 border-white"
                  )}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                  </div>
                  <span className={clsx(
                    "absolute top-10 text-xs font-medium text-center w-24 -ml-12",
                    isActive ? "text-indigo-900" : (isCompleted ? "text-gray-700" : "text-gray-400")
                  )}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mt-20">
          <h3 className="font-bold text-gray-900 mb-6">{t(language, 'orderDetails')}</h3>
          
          <div className="space-y-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.variant.color}, {item.variant.size} • Qty {item.quantity}</p>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900">
              <span>{t(language, 'total')}</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-start space-x-3 text-sm text-gray-600">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span>{t(language, 'shippingTo')} {order.shippingAddress || 'Not specified'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
