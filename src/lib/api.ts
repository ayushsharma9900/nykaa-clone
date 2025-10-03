import { getLocalStorageItem } from '@/hooks/useLocalStorage';

// Auto-detect API base URL based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}/api`
    : '/api');

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalProducts?: number;
    totalCategories?: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get token from localStorage if it exists
    const token = getLocalStorageItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Create timeout signal compatible with all browsers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId); // Clear timeout on successful response
      
      // Check if response is ok
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let detailedErrors: string[] = [];
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object') {
            errorMessage = errorData.message || errorMessage;
            detailedErrors = errorData.errors || [];
            
            // For validation errors, provide more detail
            if (response.status === 400 && detailedErrors.length > 0) {
              const validationDetails = detailedErrors.map((err: any) => 
                typeof err === 'object' && err.path && err.msg 
                  ? `${err.path}: ${err.msg}` 
                  : String(err)
              ).join(', ');
              errorMessage = `${errorMessage} - Details: ${validationDetails}`;
            }
            
            // Log error details only in development
            if (process.env.NODE_ENV === 'development') {
              console.warn(`API Error ${response.status}:`, errorData.message);
            }
          }
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        return {
          success: false,
          message: errorMessage,
          data: undefined
        };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId); // Clear timeout on error
      console.error('API request failed:', error);
      
      // Return error response instead of throwing
      let errorMessage = 'Unknown error occurred';
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Backend server is not running or unreachable';
      } else if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = 'Request timeout - server took too long to respond';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        data: undefined
      };
    }
  }

  // Product methods
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getAllProductsForAdmin(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: 'active' | 'inactive';
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/products/admin/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProductStock(id: string, stock: number) {
    return this.request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  }

  async getProductCategories() {
    return this.request('/products/meta/categories');
  }

  async getLowStockProducts(threshold?: number, limit?: number) {
    const params = new URLSearchParams();
    if (threshold) params.append('threshold', threshold.toString());
    if (limit) params.append('limit', limit.toString());
    
    return this.request(`/products/alerts/low-stock${params.toString() ? `?${params.toString()}` : ''}`);
  }

  async uploadProductImage(file: File) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE_URL}/upload/product-image`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData - browser will set it with boundary
          ...(getLocalStorageItem('token') 
            ? { 'Authorization': `Bearer ${getLocalStorageItem('token')}` } 
            : {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Image upload failed:', error);
      // Fallback to dynamic placeholder for development
      return {
        success: true,
        data: {
          url: `https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&t=${Date.now()}`,
          alt: file.name,
          placeholder: true
        },
        message: 'Using placeholder image - upload service not available'
      };
    }
  }

  async uploadProductImages(files: File[]) {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
      });
      
      const response = await fetch(`${API_BASE_URL}/upload/product-images`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData - browser will set it with boundary
          ...(getLocalStorageItem('token') 
            ? { 'Authorization': `Bearer ${getLocalStorageItem('token')}` } 
            : {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Images upload failed:', error);
      // Fallback to dynamic placeholders for development
      const imagePool = [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400'
      ];
      
      return {
        success: true,
        data: files.map((file, index) => ({
          url: `${imagePool[index % imagePool.length]}&t=${Date.now()}&i=${index}`,
          alt: file.name,
          placeholder: true
        })),
        message: 'Using placeholder images - upload service not available'
      };
    }
  }

  // Bulk operations for products
  async bulkUpdateProductStatus(productIds: string[], isActive: boolean) {
    return this.request('/products/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify({ productIds, isActive }),
    });
  }

  async bulkDeleteProducts(productIds: string[]) {
    return this.request('/products/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ productIds }),
    });
  }

  async bulkUpdateInventory(updates: Array<{ productId: string; stock: number }>) {
    return this.request('/products/bulk/inventory', {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
  }

  async bulkChangeCategory(productIds: string[], category: string) {
    return this.request('/products/bulk/category', {
      method: 'PATCH',
      body: JSON.stringify({ productIds, category }),
    });
  }

  async bulkUpdatePricing(
    productIds: string[], 
    priceChange: { type: 'percentage' | 'fixed'; value: number }
  ) {
    return this.request('/products/bulk/pricing', {
      method: 'PATCH',
      body: JSON.stringify({ productIds, priceChange }),
    });
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getRecentOrders() {
    return this.request('/dashboard/recent-orders');
  }

  async getTopProducts() {
    return this.request('/dashboard/top-products');
  }

  // Customer methods
  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getCustomer(id: string) {
    return this.request(`/customers/${id}`);
  }

  async updateCustomer(id: string, customerData: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  // Order methods
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Category methods
  async getCategories(params?: {
    page?: number;
    limit?: number;
    active?: boolean;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(categoryData: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async toggleCategoryStatus(id: string) {
    return this.request(`/categories/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategoryStats() {
    return this.request('/categories/meta/stats');
  }

  // Dynamic Image Management Methods
  async uploadCategoryImage(file: File) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE_URL}/upload/category-image`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(getLocalStorageItem('token') 
            ? { 'Authorization': `Bearer ${getLocalStorageItem('token')}` } 
            : {})
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Category image upload failed:', error);
      // Dynamic placeholder based on category context
      const categoryImages = [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'
      ];
      
      return {
        success: true,
        data: {
          url: `${categoryImages[Math.floor(Math.random() * categoryImages.length)]}&t=${Date.now()}`,
          alt: file.name,
          placeholder: true
        },
        message: 'Using placeholder image - upload service not available'
      };
    }
  }

  async deleteImage(imageId: string, type: 'product' | 'category') {
    try {
      return this.request(`/upload/${type}-image/${imageId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Image deletion failed:', error);
      // For development, just return success since we're using placeholders
      return {
        success: true,
        message: 'Image deletion simulated - using placeholder system'
      };
    }
  }

  async getImageMetadata(imageUrl: string) {
    try {
      return this.request(`/upload/image-metadata?url=${encodeURIComponent(imageUrl)}`);
    } catch (error) {
      console.error('Failed to get image metadata:', error);
      return {
        success: false,
        message: 'Could not retrieve image metadata'
      };
    }
  }

  async optimizeImage(imageUrl: string, options: { width?: number; height?: number; quality?: number }) {
    try {
      const params = new URLSearchParams();
      params.append('url', imageUrl);
      if (options.width) params.append('width', options.width.toString());
      if (options.height) params.append('height', options.height.toString());
      if (options.quality) params.append('quality', options.quality.toString());
      
      return this.request(`/upload/optimize-image?${params.toString()}`);
    } catch (error) {
      console.error('Image optimization failed:', error);
      // Return original URL with added parameters for Unsplash optimization
      const separator = imageUrl.includes('?') ? '&' : '?';
      const optimizedUrl = `${imageUrl}${separator}w=${options.width || 400}&h=${options.height || 400}&q=${options.quality || 80}&fit=crop&auto=format`;
      
      return {
        success: true,
        data: {
          url: optimizedUrl,
          optimized: true,
          placeholder: true
        },
        message: 'Using URL-based optimization - service not available'
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;
