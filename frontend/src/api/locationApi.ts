import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface Location {
  id: string;
  name: string;
  type: 'central_kitchen' | 'restaurant_branch';
  address?: string;
  phone?: string;
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface LocationHierarchy {
  central_kitchen: Location[];
  restaurant_branches: Location[];
}

export interface CreateLocationData {
  name: string;
  type: 'central_kitchen' | 'restaurant_branch';
  address?: string;
  phone?: string;
  manager_id?: string;
}

export interface UpdateLocationData extends Partial<CreateLocationData> {
  is_active?: boolean;
}

export interface LocationFilters {
  type?: 'central_kitchen' | 'restaurant_branch';
  is_active?: boolean;
  search?: string;
}

class LocationApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getLocations(filters?: LocationFilters): Promise<Location[]> {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await axios.get(
      `${API_BASE_URL}/locations?${params.toString()}`,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data.data;
  }

  async getLocationById(id: string): Promise<Location> {
    const response = await axios.get(
      `${API_BASE_URL}/locations/${id}`,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data.data;
  }

  async getLocationHierarchy(): Promise<LocationHierarchy> {
    const response = await axios.get(
      `${API_BASE_URL}/locations/hierarchy`,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data.data;
  }

  async createLocation(data: CreateLocationData): Promise<Location> {
    const response = await axios.post(
      `${API_BASE_URL}/locations`,
      data,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data.data;
  }

  async updateLocation(id: string, data: UpdateLocationData): Promise<Location> {
    const response = await axios.put(
      `${API_BASE_URL}/locations/${id}`,
      data,
      { headers: this.getAuthHeaders() }
    );
    
    return response.data.data;
  }

  async deleteLocation(id: string): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/locations/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}

export const locationApi = new LocationApi();
export default locationApi;