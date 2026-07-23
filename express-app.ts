import express from 'express';
import path from 'path';
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
    category: 'Electronics',
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
    title: 'Aura Smartwatch Series X',
    descriptions: {
      en: 'Stay connected and track your fitness with the Aura Smartwatch Series X. Features a vibrant AMOLED display and 5ATM water resistance.',
      es: 'Mantente conectado y realiza un seguimiento de tu estado físico con el Aura Smartwatch Series X. Cuenta con una vibrante pantalla AMOLED y resistencia al agua 5ATM.',
      fr: 'Restez connecté et suivez votre condition physique avec la montre intelligente Aura Series X. Doté d\'un écran AMOLED vibrant et d\'une résistance à l\'eau 5ATM.'
    },
    price: 199.99,
    discountPrice: 179.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
    category: 'Electronics',
    seoKeywords: ['smartwatch', 'fitness tracker', 'wearable', 'health', 'heart rate', 'gps', 'waterproof', 'amoled', 'watch', 'electronics'],
    isBestSeller: true,
    isFeatured: false,
    isTrending: true,
    reviews: [],
    variants: [
      { color: 'Midnight Black', size: '42mm', sku: 'SW-MB-42', inventory: 30 },
      { color: 'Rose Gold', size: '40mm', sku: 'SW-RG-40', inventory: 25 },
    ],
    totalInventory: 55
  },
  {
    id: 'p3',
    title: 'Classic White Sneakers',
    descriptions: {
      en: 'Step into comfort and style with our Classic White Sneakers. Perfect for everyday wear, featuring a durable rubber sole and breathable canvas upper.',
      es: 'Adéntrate en la comodidad y el estilo con nuestras zapatillas clásicas blancas. Perfectas para el uso diario, cuentan con una suela de goma duradera y una parte superior de lona transpirable.',
      fr: 'Entrez dans le confort et le style avec nos baskets blanches classiques. Parfait pour un usage quotidien, avec une semelle en caoutchouc durable et une tige en toile respirante.'
    },
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'],
    category: 'Clothing (Men\'s wear)',
    seoKeywords: ['sneakers', 'shoes', 'white', 'casual', 'footwear', 'canvas', 'comfortable', 'everyday', 'classic', 'men'],
    isBestSeller: false,
    isFeatured: true,
    isTrending: true,
    reviews: [],
    variants: [
      { color: 'White', size: 'US 9', sku: 'SNK-WH-09', inventory: 15 },
      { color: 'White', size: 'US 10', sku: 'SNK-WH-10', inventory: 20 },
      { color: 'White', size: 'US 11', sku: 'SNK-WH-11', inventory: 10 },
    ],
    totalInventory: 45
  },
  {
    id: 'p4',
    title: 'Ergonomic Office Chair',
    descriptions: {
      en: 'Improve your posture and comfort with our Ergonomic Office Chair. Fully adjustable with lumbar support and a breathable mesh back.',
      es: 'Mejore su postura y comodidad con nuestra Silla de Oficina Ergonómica. Totalmente ajustable con soporte lumbar y respaldo de malla transpirable.',
      fr: 'Améliorez votre posture et votre confort avec notre chaise de bureau ergonomique. Entièrement réglable avec soutien lombaire et dossier en maille respirante.'
    },
    price: 249.99,
    images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80'],
    category: 'Home & Furniture',
    seoKeywords: ['chair', 'office', 'ergonomic', 'furniture', 'desk', 'lumbar support', 'mesh', 'comfortable', 'work', 'home office'],
    isBestSeller: false,
    isFeatured: false,
    isTrending: true,
    reviews: [],
    variants: [
      { color: 'Black', size: 'Standard', sku: 'CHR-BLK-STD', inventory: 8 },
      { color: 'Grey', size: 'Standard', sku: 'CHR-GRY-STD', inventory: 5 },
    ],
    totalInventory: 13
  }
];

let products: Product[] = [...initialProducts];
let orders: Order[] = [];
let users: any[] = [];

const app = express();

app.use(express.json({ limit: '50mb' }));

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
// 1. Get all products
app.get('/api/products', (req, res) => {
  let result = [...products];
  const { q, featured, trending, bestSeller, ids, category } = req.query;

  if (ids && typeof ids === 'string') {
    const idsArray = ids.split(',');
    result = result.filter(p => idsArray.includes(p.id));
  } else {
    if (category && typeof category === 'string') {
      result = result.filter(p => p.category === category);
    }
    if (q) {
      const query = (q as string).toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.seoKeywords.some(kw => kw.toLowerCase().includes(query))
      );
      
      result.sort((a, b) => {
        let scoreA = a.title.toLowerCase().includes(query) ? 10 : 0;
        let scoreB = b.title.toLowerCase().includes(query) ? 10 : 0;
        scoreA += a.seoKeywords.filter(kw => kw.toLowerCase().includes(query)).length;
        scoreB += b.seoKeywords.filter(kw => kw.toLowerCase().includes(query)).length;
        return scoreB - scoreA;
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
  const { keywords } = req.body;
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
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
  try {
    const newProduct: Product = {
      ...req.body,
      id: `p_${Date.now()}`,
      reviews: [],
      totalInventory: req.body.variants ? req.body.variants.reduce((acc: number, v: any) => acc + (parseInt(v.inventory) || 0), 0) : 0
    };
    products.push(newProduct);
    res.json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// 5. Admin - Update Product
app.put('/api/products/:id', (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
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

// 6. Checkout
app.post('/api/checkout', (req, res) => {
  const { items, customerEmail, customerPhone, shippingAddress, paymentDetails } = req.body;
  const total = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  
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

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const o = orders.find(o => o.id === req.params.id);
  if (o) res.json(o);
  else res.status(404).json({ error: 'Order not found' });
});

app.put('/api/orders/:id/dispatch', (req, res) => {
  const o = orders.find(o => o.id === req.params.id);
  if (o) {
    o.status = 'Dispatched';
    o.trackingLink = `${process.env.APP_URL || 'http://localhost:3000'}/track/${o.id}`;
    res.json(o);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// === OTP ROUTES ===
const otps: Record<string, string> = {};

app.post('/api/auth/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otps[email] = code;
  
  console.log(`[Mock Email] Sent OTP ${code} to ${email}`);
  res.json({ success: true, message: 'OTP sent successfully', mockOtp: code });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });
  
  if (otps[email] === code) {
    delete otps[email];
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid or expired OTP' });
  }
});

export default app;

