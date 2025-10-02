'use client';

import { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { Product } from '@/types';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction = 
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.productId === product.id);
      
      let newItems: CartItem[];
      
      if (existingItemIndex > -1) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `cart-${product.id}-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          price: product.price,
        };
        newItems = [...state.items, newItem];
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);
      
      return {
        items: newItems,
        total,
        itemCount,
      };
    }
    
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.productId !== action.payload.productId);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);
      
      return {
        items: newItems,
        total,
        itemCount,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { productId } });
      }
      
      const newItems = state.items.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);
      
      return {
        items: newItems,
        total,
        itemCount,
      };
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    case 'LOAD_CART':
      return action.payload;
    
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const isInitialLoad = useRef(true);

  // Load cart from localStorage on mount (with migration from legacy key)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const NEW_KEY = 'kaayalife-cart';
    const OLD_KEY = 'nykaa-cart';
    
    try {
      const savedNew = localStorage.getItem(NEW_KEY);
      const savedOld = localStorage.getItem(OLD_KEY);

      if (savedNew) {
        const cartData = JSON.parse(savedNew);
        // Validate cart data structure
        if (cartData && typeof cartData === 'object' && Array.isArray(cartData.items)) {
          console.log('Loading cart from localStorage:', cartData);
          dispatch({ type: 'LOAD_CART', payload: cartData });
        }
      } else if (savedOld) {
        const cartData = JSON.parse(savedOld);
        if (cartData && typeof cartData === 'object' && Array.isArray(cartData.items)) {
          console.log('Migrating cart from old key:', cartData);
          dispatch({ type: 'LOAD_CART', payload: cartData });
          // Migrate to new key
          localStorage.setItem(NEW_KEY, savedOld);
          localStorage.removeItem(OLD_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Reset to initial state if there's an error
      localStorage.removeItem('kaayalife-cart');
      localStorage.removeItem('nykaa-cart');
    }
    
    // Mark initial load as complete
    isInitialLoad.current = false;
  }, []);

  // Save cart to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad.current && typeof window !== 'undefined') {
      const NEW_KEY = 'kaayalife-cart';
      try {
        localStorage.setItem(NEW_KEY, JSON.stringify(state));
        console.log('Cart saved to localStorage:', state);
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [state]);

  const addToCart = (product: Product, quantity: number = 1) => {
    console.log('Adding to cart:', { product: product.name, quantity });
    try {
      dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
      console.log('Successfully added to cart');
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string) => {
    return state.items.some(item => item.productId === productId);
  };

  const getItemQuantity = (productId: string) => {
    const item = state.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
