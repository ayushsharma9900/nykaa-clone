'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { products as fallbackProducts } from '@/data/products';
import { apiService } from '@/lib/api';
import { mapBackendToFrontend, mapFrontendToBackend } from '@/lib/dataMapper';
import { validateProductForAPI, logValidationResults } from '@/lib/productValidation';

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products for admin (including inactive ones)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use admin endpoint with maximum allowed limit to get all products
      const response = await apiService.getAllProductsForAdmin({ limit: 100 });
      if (response.success && response.data && Array.isArray(response.data)) {
        const mappedProducts = response.data.map(mapBackendToFrontend);
        setProducts(mappedProducts);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.warn('Failed to fetch from admin API, using regular API:', err);
      
      // Fallback to regular products API with maximum allowed limit
      try {
        const response = await apiService.getProducts({ limit: 100 });
        if (response.success && response.data && Array.isArray(response.data)) {
          const mappedProducts = response.data.map(mapBackendToFrontend);
          setProducts(mappedProducts);
        } else {
          throw new Error('Invalid API response');
        }
      } catch (fallbackErr) {
        console.warn('Failed to fetch from API, using fallback data:', fallbackErr);
        setError('Using offline data - API connection failed');
        setProducts(fallbackProducts);
      }
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
    } catch (err) {
      console.error('Failed to add product:', err);
      // Fallback to local state update
      const newProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
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
    } catch (err) {
      console.error('Failed to update product:', err);
      // Fallback to local state update
      const updated = { ...updatedProduct, updatedAt: new Date() };
      setProducts(prev => 
        prev.map(product => 
          product.id === updatedProduct.id ? updated : product
        )
      );
      return updated;
    }
  };

  // Delete a product
  const deleteProduct = async (productId: string) => {
    try {
      const response = await apiService.deleteProduct(productId);
      
      if (response.success) {
        setProducts(prev => prev.filter(product => product.id !== productId));
        return true;
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      // Fallback to local state update
      setProducts(prev => prev.filter(product => product.id !== productId));
      return true;
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
