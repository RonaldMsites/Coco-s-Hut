export interface Variant {
  color: string;
  size: string;
  sku: string;
  inventory: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  title: string;
  descriptions: Record<string, string>; // e.g., { en: "...", fr: "..." }
  price: number;
  discountPrice?: number;
  shippingCost?: number;
  images: string[];
  video?: string;
  variants: Variant[];
  category: string;
  seoKeywords: string[];
  isBestSeller: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  reviews: Review[];
  totalInventory: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  variant: { color: string; size: string };
  image: string;
}

export type OrderStatus = 'Processing' | 'Dispatched' | 'In Transit' | 'Delivered';

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  trackingLink?: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  date: string;
}
