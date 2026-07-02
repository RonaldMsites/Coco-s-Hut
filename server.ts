import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Product, Order, OrderStatus } from './src/types';

// Initial Mock Data
const initialProducts: Product[] = [
  {
    id: 'p1',
    title: 'Aura Premium Wireless Headphones',
    descriptions: {
      en: 'Experience unmatched sound quality with the Aura Premium Wireless Headphones. Featuring active noise cancellation and a 40-hour battery life.',
      es: 'Experimenta una calidad de sonido inigualable con los Auriculares Inalámbricos Premium Aura. Con cancelación activa de ruido y 40 horas de batería.',
      fr: 'Découvrez une qualité sonore inégalée avec le Casque Sans Fil Premium Aura. Doté de la réduction de bruit active et d\'une autonomie de 40 heures.'
    },
    price: 299.99,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    seoKeywords: ['headphones', 'wireless', 'audio', 'premium', 'noise cancellation', 'music', 'bluetooth', 'over-ear', 'bass', 'electronics'],
    isBestSeller: true,
    isFeatured: true,
    isTrending: false,
    reviews: [
      { id: 'r1', author: 'Alex J.', rating: 5, comment: 'Absolutely stunning sound quality.', date: new Date().toISOString() },
      { id: 'r2', author: 'Sam T.', rating: 4, comment: 'Great but a bit heavy.', date: new Date().toISOString() }
    ],
    variants: [
      { color: 'Black', size: 'One Size', sku: 'HP-BLK-OS', inventory: 45 },
      { color: 'Silver', size: 'One Size', sku: 'HP-SLV-OS', inventory: 12 },
    ],
    totalInventory: 57
  },
  {
    id: 'p2',
    title: 'Minimalist Smartwatch Series X',
    descriptions: {
      en: 'Track your fitness, notifications, and heart rate with a sleek, minimalist design that goes with any outfit.',
      es: 'Haz un seguimiento de tu estado físico, notificaciones y frecuencia cardíaca con un diseño elegante y minimalista.',
    },
    price: 199.50,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
    seoKeywords: ['smartwatch', 'wearable', 'fitness tracker', 'minimalist', 'watch', 'health', 'tech', 'accessories', 'bluetooth', 'series x'],
    isBestSeller: false,
    isFeatured: true,
    isTrending: true,
    reviews: [],
    variants: [
      { color: 'Midnight', size: '40mm', sku: 'SW-MID-40', inventory: 30 },
      { color: 'Midnight', size: '44mm', sku: 'SW-MID-44', inventory: 15 },
      { color: 'Rose Gold', size: '40mm', sku: 'SW-RGL-40', inventory: 20 },
    ],
    totalInventory: 65
  },
  {
    id: 'p3',
    title: 'Eco-Friendly Yoga Mat',
    descriptions: {
      en: 'Made from 100% natural rubber, providing superior grip and joint support for your daily practice.',
    },
    price: 65.00,
    images: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80'],
    seoKeywords: ['yoga mat', 'fitness', 'eco-friendly', 'exercise', 'workout', 'wellness', 'health', 'home gym', 'natural', 'accessories'],
    isBestSeller: true,
    isFeatured: false,
    isTrending: true,
    reviews: [
      { id: 'r3', author: 'Emma L.', rating: 5, comment: 'Perfect grip, even in hot yoga!', date: new Date().toISOString() }
    ],
    variants: [
      { color: 'Teal', size: 'Standard', sku: 'YM-TL-STD', inventory: 100 },
      { color: 'Charcoal', size: 'Standard', sku: 'YM-CH-STD', inventory: 85 },
    ],
    totalInventory: 185
  }
];

let products: Product[] = [...initialProducts];
let orders: Order[] = [];
let users: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // === AUTH ROUTES ===
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    users.push({ name, email, password });
    res.json({ success: true, name, email });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      res.json({ success: true, name: user.name, email });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // === API ROUTES ===

  // 1. Get all products (with search/filters)
  app.get('/api/products', (req, res) => {
    let result = [...products];
    const { q, featured, trending, bestSeller, ids } = req.query;

    if (ids && typeof ids === 'string') {
      const idsArray = ids.split(',');
      result = result.filter(p => idsArray.includes(p.id));
    } else {
      if (q) {
        const query = (q as string).toLowerCase();
        result = result.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.seoKeywords.some(kw => kw.toLowerCase().includes(query))
        );
        
        // Basic scoring based on how many keywords match or title match
        result.sort((a, b) => {
          let scoreA = a.title.toLowerCase().includes(query) ? 10 : 0;
          let scoreB = b.title.toLowerCase().includes(query) ? 10 : 0;
          
          scoreA += a.seoKeywords.filter(kw => kw.toLowerCase().includes(query)).length;
          scoreB += b.seoKeywords.filter(kw => kw.toLowerCase().includes(query)).length;
          
          return scoreB - scoreA; // Descending
        });
      }

      if (featured === 'true') result = result.filter(p => p.isFeatured);
      if (trending === 'true') result = result.filter(p => p.isTrending);
      if (bestSeller === 'true') result = result.filter(p => p.isBestSeller);
    }

    res.json(result);
  });

  // 2. Recommendations engine
  app.post('/api/recommendations', (req, res) => {
    const { keywords } = req.body; // keywords user has viewed
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      // If no history, return trending
      return res.json(products.filter(p => p.isTrending).slice(0, 4));
    }

    let scoredProducts = products.map(p => {
      let score = 0;
      p.seoKeywords.forEach(kw => {
        if (keywords.includes(kw.toLowerCase())) score += 1;
      });
      return { product: p, score };
    });

    scoredProducts = scoredProducts.filter(sp => sp.score > 0);
    scoredProducts.sort((a, b) => b.score - a.score);

    // If we didn't find enough, pad with best sellers
    let recs = scoredProducts.map(sp => sp.product);
    if (recs.length < 4) {
      const pad = products.filter(p => p.isBestSeller && !recs.find(r => r.id === p.id));
      recs = [...recs, ...pad];
    }

    res.json(recs.slice(0, 4));
  });

  // 3. Get single product
  app.get('/api/products/:id', (req, res) => {
    const p = products.find(p => p.id === req.params.id);
    if (p) res.json(p);
    else res.status(404).json({ error: 'Not found' });
  });

  // 4. Admin - Create Product
  app.post('/api/products', (req, res) => {
    const newProduct: Product = {
      ...req.body,
      id: `p_${Date.now()}`,
      reviews: [],
      totalInventory: req.body.variants.reduce((acc: number, v: any) => acc + (parseInt(v.inventory) || 0), 0)
    };
    products.push(newProduct);
    res.json(newProduct);
  });

  // 5. Admin - Update Product (Toggles, SEO, Inventory)
  app.put('/api/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      products[idx] = { 
        ...products[idx], 
        ...req.body, 
        totalInventory: req.body.variants ? req.body.variants.reduce((acc: number, v: any) => acc + (parseInt(v.inventory) || 0), 0) : products[idx].totalInventory
      };
      res.json(products[idx]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // 5b. Admin - Delete Product
  app.delete('/api/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      products.splice(idx, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // 6. Checkout (Mock Payment & Order Creation)
  app.post('/api/checkout', (req, res) => {
    const { items, customerEmail, customerPhone, shippingAddress, paymentDetails } = req.body;
    
    // Calculate total & verify inventory in a real app. Here we just mock.
    const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    // Reduce inventory
    items.forEach((item: any) => {
      const p = products.find(p => p.id === item.productId);
      if (p) {
        const variant = p.variants.find(v => v.color === item.variant.color && v.size === item.variant.size);
        if (variant) variant.inventory -= item.quantity;
        p.totalInventory -= item.quantity;
      }
    });

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items,
      total,
      status: 'Processing',
      customerEmail,
      customerPhone,
      shippingAddress,
      date: new Date().toISOString()
    };
    
    orders.push(newOrder);
    res.json({ success: true, order: newOrder });
  });

  // 7. Get Orders (Admin gets all, or could filter by email)
  app.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  // 8. Order Tracking (Public by ID)
  app.get('/api/orders/:id', (req, res) => {
    const o = orders.find(o => o.id === req.params.id);
    if (o) {
      // Strip some sensitive info if needed, but returning for tracking dashboard
      res.json(o);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  });

  // 9. Admin - Dispatch Order
  app.put('/api/orders/:id/dispatch', (req, res) => {
    const o = orders.find(o => o.id === req.params.id);
    if (o) {
      o.status = 'Dispatched';
      // Mock tracking link generation
      o.trackingLink = `${process.env.APP_URL || 'http://localhost:3000'}/track/${o.id}`;
      // In a real app, send SMS/Email via Twilio/SendGrid here
      res.json(o);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // === VITE MIDDLEWARE ===
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
