'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '@/types';

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: Date;
}

interface WishlistState {
  items: WishlistItem[];
  itemCount: number;
}

type WishlistAction = 
  | { type: 'ADD_TO_WISHLIST'; payload: { product: Product } }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: { productId: string } }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: WishlistState };

const initialState: WishlistState = {
  items: [],
  itemCount: 0,
};

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'ADD_TO_WISHLIST': {
      const { product } = action.payload;
      const existingItem = state.items.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Item already in wishlist, don't add duplicate
        return state;
      }
      
      const newItem: WishlistItem = {
        id: `wishlist-${product.id}-${Date.now()}`,
        productId: product.id,
        product,
        addedAt: new Date(),
      };
      
      const newItems = [...state.items, newItem];
      
      return {
        items: newItems,
        itemCount: newItems.length,
      };
    }
    
    case 'REMOVE_FROM_WISHLIST': {
      const newItems = state.items.filter(item => item.productId !== action.payload.productId);
      
      return {
        items: newItems,
        itemCount: newItems.length,
      };
    }
    
    case 'CLEAR_WISHLIST':
      return initialState;
    
    case 'LOAD_WISHLIST':
      return action.payload;
    
    default:
      return state;
  }
}

interface WishlistContextType {
  state: WishlistState;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => boolean; // Returns true if added, false if removed
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const WISHLIST_KEY = 'kaayalife-wishlist';
    const saved = localStorage.getItem(WISHLIST_KEY);

    try {
      if (saved) {
        const wishlistData = JSON.parse(saved);
        // Restore dates from strings
        const items = wishlistData.items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        dispatch({ 
          type: 'LOAD_WISHLIST', 
          payload: { 
            ...wishlistData, 
            items 
          } 
        });
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    const WISHLIST_KEY = 'kaayalife-wishlist';
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(state));
  }, [state]);

  const addToWishlist = (product: Product) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: { product } });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { productId } });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const isInWishlist = (productId: string) => {
    return state.items.some(item => item.productId === productId);
  };

  const toggleWishlist = (product: Product) => {
    const inWishlist = isInWishlist(product.id);
    if (inWishlist) {
      removeFromWishlist(product.id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        state,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}