import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  cost_per_unit: number;
  supplier_id?: string;
  min_stock_level: number;
  shelf_life_days?: number;
  is_active: boolean;
  supplier?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateIngredientData {
  code: string;
  name: string;
  category: string;
  unit: string;
  cost_per_unit: number;
  supplier_id?: string;
  min_stock_level: number;
  shelf_life_days?: number;
}

export interface UpdateIngredientData extends Partial<CreateIngredientData> {}

export interface IngredientSearchParams {
  search?: string;
  category?: string;
  unit?: string;
  is_active?: 'true' | 'false' | 'all';
  page?: number;
  limit?: number;
}

export interface IngredientListResponse {
  success: boolean;
  data: {
    ingredients: Ingredient[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface BulkImportData {
  ingredients: CreateIngredientData[];
}

export interface BulkImportResponse {
  success: boolean;
  data: {
    success: Array<{ row: number; code: string; name: string }>;
    errors: Array<{ row: number; code: string; error: string }>;
    total: number;
  };
  message: string;
}

// API functions
export const ingredientApi = {
  // Get ingredient categories
  getCategories: async (): Promise<{ categories: string[] }> => {
    const response = await api.get('/ingredients/categories');
    return response.data.data;
  },

  // Get ingredient units
  getUnits: async (): Promise<{ units: string[] }> => {
    const response = await api.get('/ingredients/units');
    return response.data.data;
  },

  // Get ingredients with search and filtering
  getIngredients: async (params: IngredientSearchParams = {}): Promise<IngredientListResponse> => {
    const response = await api.get('/ingredients', { params });
    return response.data;
  },

  // Get single ingredient
  getIngredient: async (id: string): Promise<Ingredient> => {
    const response = await api.get(`/ingredients/${id}`);
    return response.data.data.ingredient;
  },

  // Create ingredient
  createIngredient: async (data: CreateIngredientData): Promise<Ingredient> => {
    const response = await api.post('/ingredients', data);
    return response.data.data.ingredient;
  },

  // Update ingredient
  updateIngredient: async (id: string, data: UpdateIngredientData): Promise<Ingredient> => {
    const response = await api.put(`/ingredients/${id}`, data);
    return response.data.data.ingredient;
  },

  // Deactivate ingredient
  deactivateIngredient: async (id: string): Promise<void> => {
    await api.patch(`/ingredients/${id}/deactivate`);
  },

  // Reactivate ingredient
  reactivateIngredient: async (id: string): Promise<void> => {
    await api.patch(`/ingredients/${id}/reactivate`);
  },

  // Bulk import ingredients
  bulkImport: async (data: BulkImportData): Promise<BulkImportResponse> => {
    const response = await api.post('/ingredients/bulk-import', data);
    return response.data;
  },

  // Export ingredients
  exportIngredients: async (format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    const response = await api.get('/ingredients/export', {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    
    if (format === 'csv') {
      return response.data;
    } else {
      // Convert JSON to blob for download
      const jsonStr = JSON.stringify(response.data.data.ingredients, null, 2);
      return new Blob([jsonStr], { type: 'application/json' });
    }
  }
};