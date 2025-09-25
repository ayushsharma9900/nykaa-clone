const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Get token from localStorage if it exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is ok
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let detailedErrors: any[] = [];
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          detailedErrors = errorData.errors || [];
          
          // For validation errors, provide more detail
          if (response.status === 400 && detailedErrors.length > 0) {
            const validationDetails = detailedErrors.map(err => `${err.path}: ${err.msg}`).join(', ');
            errorMessage = `${errorMessage} - Details: ${validationDetails}`;
          }
          
          console.error('API Error Details:', {
            status: response.status,
            message: errorData.message,
            errors: detailedErrors,
            url: url
          });
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Backend server is not running or unreachable');
      } else if (error.name === 'AbortError') {
        throw new Error('Request timeout - server took too long to respond');
      } else {
        throw error;
      }
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
  async getCustomers() {
    return this.request('/customers');
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
  async getOrders() {
    return this.request('/orders');
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
}

export const apiService = new ApiService();
export default apiService;
