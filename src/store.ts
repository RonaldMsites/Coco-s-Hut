import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OrderItem } from './types';

interface StoreState {
  role: 'buyer' | 'admin';
  setRole: (role: 'buyer' | 'admin') => void;
  
  // Cart
  cart: OrderItem[];
  addToCart: (item: OrderItem) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  
  // Browsing History (for recommendations)
  viewedKeywords: string[];
  addViewedKeywords: (keywords: string[]) => void;
  
  // UI State
  language: string;
  setLanguage: (lang: string) => void;
  
  // Auth (Mock)
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  userName: string | null;
  setUserName: (name: string | null) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  
  // Wishlist
  wishlists: Record<string, string[]>;
  toggleWishlist: (email: string, productId: string) => void;
  addToWishlist: (email: string, productId: string) => void;
  pendingWishlistId: string | null;
  setPendingWishlistId: (id: string | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      role: 'buyer',
      setRole: (role) => set({ role }),
      
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find(
            (i) => i.productId === item.productId && i.variant.color === item.variant.color && i.variant.size === item.variant.size
          );
          if (existingItem) {
            return {
              cart: state.cart.map((i) =>
                i === existingItem ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),
      removeFromCart: (productId, color, size) =>
        set((state) => ({
          cart: state.cart.filter(
            (i) => !(i.productId === productId && i.variant.color === color && i.variant.size === size)
          ),
        })),
      updateQuantity: (productId, color, size, quantity) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.productId === productId && i.variant.color === color && i.variant.size === size
              ? { ...i, quantity }
              : i
          ),
        })),
      clearCart: () => set({ cart: [] }),
      
      viewedKeywords: [],
      addViewedKeywords: (keywords) =>
        set((state) => {
          const newKeywords = [...new Set([...state.viewedKeywords, ...keywords])].slice(-50); // Keep last 50 unique keywords
          return { viewedKeywords: newKeywords };
        }),
        
      language: 'en',
      setLanguage: (language) => set({ language }),
      
      userEmail: null,
      setUserEmail: (userEmail) => set({ userEmail }),
      
      userName: null,
      setUserName: (userName) => set({ userName }),
      
      isAuthModalOpen: false,
      setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
      
      wishlists: {},
      toggleWishlist: (email, productId) =>
        set((state) => {
          const userWishlist = state.wishlists[email] || [];
          if (userWishlist.includes(productId)) {
            return {
              wishlists: {
                ...state.wishlists,
                [email]: userWishlist.filter((id) => id !== productId),
              },
            };
          }
          return {
            wishlists: {
              ...state.wishlists,
              [email]: [...userWishlist, productId],
            },
          };
        }),
      addToWishlist: (email, productId) =>
        set((state) => {
          const userWishlist = state.wishlists[email] || [];
          if (!userWishlist.includes(productId)) {
            return {
              wishlists: {
                ...state.wishlists,
                [email]: [...userWishlist, productId],
              },
            };
          }
          return state;
        }),
      pendingWishlistId: null,
      setPendingWishlistId: (pendingWishlistId) => set({ pendingWishlistId }),
    }),
    {
      name: 'aura-commerce-store',
    }
  )
);
