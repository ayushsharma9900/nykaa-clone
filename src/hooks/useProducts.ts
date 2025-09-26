'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { apiService } from '@/lib/api';
import { mapBackendToFrontend, mapFrontendToBackend } from '@/lib/dataMapper';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API dynamically
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProducts({ limit: 100 });
      if (response.success && response.data && Array.isArray(response.data)) {
        const mappedProducts = response.data.map(mapBackendToFrontend);
        setProducts(mappedProducts);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err: any) {
      console.error('Failed to fetch products from API:', err);
      setError(err.message || 'Failed to fetch products. Please ensure the backend server is running.');
      setProducts([]); // Clear products on error
    } finally {
      setLoading(false);
    }
  };

  // Initialize products
  useEffect(() => {
    fetchProducts();
  }, []);

  // Add a new product
  const addProduct = async (product: Product) => {
    try {
      const backendProduct = mapFrontendToBackend(product);
      const response = await apiService.createProduct(backendProduct);
      
      if (response.success && response.data) {
        const newProduct = mapBackendToFrontend(response.data);
        setProducts(prev => [...prev, newProduct]);
        return newProduct;
      } else {
        throw new Error('Failed to create product');
      }
    } catch (err: any) {
      console.error('Failed to add product:', err);
      throw new Error(err.message || 'Failed to create product');
    }
  };

  // Update an existing product
  const updateProduct = async (updatedProduct: Product) => {
    try {
      const backendProduct = mapFrontendToBackend(updatedProduct);
      console.log('Frontend product:', updatedProduct);
      console.log('Mapped backend product:', backendProduct);
      
      const response = await apiService.updateProduct(updatedProduct.id, backendProduct);
      
      if (response.success && response.data) {
        const mappedProduct = mapBackendToFrontend(response.data);
        setProducts(prev => 
          prev.map(product => 
            product.id === updatedProduct.id ? mappedProduct : product
          )
        );
        return mappedProduct;
      } else {
        throw new Error('Failed to update product');
      }
    } catch (err: any) {
      console.error('Failed to update product:', err);
      throw new Error(err.message || 'Failed to update product');
    }
  };

  // Delete a product
  const deleteProduct = async (productId: string) => {
    try {
      const response = await apiService.deleteProduct(productId);
      
      if (response.success) {
        // Remove from local state immediately for UI responsiveness
        setProducts(prev => prev.filter(product => product.id !== productId));
        // Also refresh from server to ensure consistency
        await fetchProducts();
        return true;
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      throw new Error(err.message || 'Failed to delete product');
    }
  };

  // Get a single product by ID
  const getProduct = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  // Save product (add if new, update if existing)
  const saveProduct = async (product: Product) => {
    const existingProduct = products.find(p => p.id === product.id);
    if (existingProduct) {
      return await updateProduct(product);
    } else {
      return await addProduct(product);
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    saveProduct,
    refreshProducts: fetchProducts
  };
}