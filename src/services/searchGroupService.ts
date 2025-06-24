import { API_BASE_URL } from '@/config/api';
import { authService } from './auth';
import { Contact, CallDetail } from './contactService';

// SearchGroup interface'i - backend modeline uygun
export interface SearchGroup {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived' | 'paused';
  createdBy: string;
  customers: Contact[];
  projects: Array<{
    _id: string;
    name: string;
    description?: string;
    status: string;
  }>;
  flows: Array<{
    _id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive' | 'completed';
    createdAt: string;
  }>;
  settings: {
    maxCustomers: number;
    autoAssignProjects: boolean;
    notificationEnabled: boolean;
  };
  customerCount?: number;
  projectCount?: number;
  flowCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Grup oluşturma için interface
export interface CreateSearchGroupData {
  name: string;
  description?: string;
  settings?: {
    maxCustomers?: number;
    autoAssignProjects?: boolean;
    notificationEnabled?: boolean;
  };
}

// Grup güncelleme için interface
export interface UpdateSearchGroupData {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived' | 'paused';
  settings?: {
    maxCustomers?: number;
    autoAssignProjects?: boolean;
    notificationEnabled?: boolean;
  };
}

// Dışarıdan müşteri ekleme için interface
export interface ExternalCustomerData {
  name: string;
  phoneNumber: string;
  note?: string;
  record?: string;
}

// Toplu müşteri ekleme için interface
export interface BulkCustomerData {
  customers: ExternalCustomerData[];
}

// Flow ekleme için interface
export interface FlowData {
  name: string;
  description?: string;
}

// Flow güncelleme için interface
export interface UpdateFlowData {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed';
}

// İstatistik interface'i
export interface SearchGroupStats {
  totalCustomers: number;
  totalProjects: number;
  totalFlows: number;
  statusStats: Array<{ _id: string; count: number }>;
  callDetailCount: number;
  createdAt: string;
  lastUpdated: string;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

class SearchGroupService {
  private baseUrl = `${API_BASE_URL}/search-groups`;

  // Tüm arama gruplarını getir
  async getAllSearchGroups(): Promise<SearchGroup[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch search groups: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup[]> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch search groups');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error in getAllSearchGroups:', error);
      throw error;
    }
  }

  // Tek bir arama grubunu getir
  async getSearchGroupById(groupId: string): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}`, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch search group: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch search group');
      }

      if (!result.data) {
        throw new Error('Search group not found');
      }

      return result.data;
    } catch (error) {
      console.error('Error in getSearchGroupById:', error);
      throw error;
    }
  }

  // Yeni arama grubu oluştur
  async createSearchGroup(groupData: CreateSearchGroupData): Promise<SearchGroup> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create search group: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to create search group');
      }

      if (!result.data) {
        throw new Error('Failed to create search group');
      }

      return result.data;
    } catch (error) {
      console.error('Error in createSearchGroup:', error);
      throw error;
    }
  }

  // Arama grubunu güncelle
  async updateSearchGroup(groupId: string, groupData: UpdateSearchGroupData): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update search group: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to update search group');
      }

      if (!result.data) {
        throw new Error('Failed to update search group');
      }

      return result.data;
    } catch (error) {
      console.error('Error in updateSearchGroup:', error);
      throw error;
    }
  }

  // Arama grubunu sil
  async deleteSearchGroup(groupId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete search group: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to delete search group');
      }
    } catch (error) {
      console.error('Error in deleteSearchGroup:', error);
      throw error;
    }
  }

  // Arama grubuna müşteri ekle
  async addCustomerToSearchGroup(groupId: string, customerId: string): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/customers`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add customer to search group: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to add customer to search group');
      }

      if (!result.data) {
        throw new Error('Failed to add customer to search group');
      }

      return result.data;
    } catch (error) {
      console.error('Error in addCustomerToSearchGroup:', error);
      throw error;
    }
  }

  // Arama grubundan müşteri çıkar
  async removeCustomerFromSearchGroup(groupId: string, customerId: string): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/customers`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove customer from search group: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to remove customer from search group');
      }

      if (!result.data) {
        throw new Error('Failed to remove customer from search group');
      }

      return result.data;
    } catch (error) {
      console.error('Error in removeCustomerFromSearchGroup:', error);
      throw error;
    }
  }

  // Dışarıdan müşteri ekleme
  async addExternalCustomerToSearchGroup(groupId: string, customerData: ExternalCustomerData): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/customers/external`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add external customer: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to add external customer');
      }

      if (!result.data) {
        throw new Error('Failed to add external customer');
      }

      return result.data;
    } catch (error) {
      console.error('Error in addExternalCustomerToSearchGroup:', error);
      throw error;
    }
  }

  // Toplu müşteri ekleme
  async addBulkCustomersToSearchGroup(groupId: string, bulkData: BulkCustomerData): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/customers/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(bulkData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add bulk customers: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to add bulk customers');
      }

      if (!result.data) {
        throw new Error('Failed to add bulk customers');
      }

      return result.data;
    } catch (error) {
      console.error('Error in addBulkCustomersToSearchGroup:', error);
      throw error;
    }
  }

  // Arama grubuna proje ekle
  async addProjectToSearchGroup(groupId: string, projectId: string): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add project to search group: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to add project to search group');
      }

      if (!result.data) {
        throw new Error('Failed to add project to search group');
      }

      return result.data;
    } catch (error) {
      console.error('Error in addProjectToSearchGroup:', error);
      throw error;
    }
  }

  // Arama grubundan proje çıkar
  async removeProjectFromSearchGroup(groupId: string, projectId: string): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/projects`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove project from search group: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to remove project from search group');
      }

      if (!result.data) {
        throw new Error('Failed to remove project from search group');
      }

      return result.data;
    } catch (error) {
      console.error('Error in removeProjectFromSearchGroup:', error);
      throw error;
    }
  }

  // Arama grubuna akış ekle
  async addFlowToSearchGroup(groupId: string, flowData: FlowData): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/flows`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(flowData),
      });

      if (!response.ok) {
        throw new Error(`Failed to add flow to search group: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to add flow to search group');
      }

      if (!result.data) {
        throw new Error('Failed to add flow to search group');
      }

      return result.data;
    } catch (error) {
      console.error('Error in addFlowToSearchGroup:', error);
      throw error;
    }
  }

  // Arama grubundaki akışı güncelle
  async updateFlowInSearchGroup(groupId: string, flowId: string, flowData: UpdateFlowData): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/flows/${flowId}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(flowData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update flow: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to update flow');
      }

      if (!result.data) {
        throw new Error('Failed to update flow');
      }

      return result.data;
    } catch (error) {
      console.error('Error in updateFlowInSearchGroup:', error);
      throw error;
    }
  }

  // Arama grubundan akış sil
  async removeFlowFromSearchGroup(groupId: string, flowId: string): Promise<SearchGroup> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/flows/${flowId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Failed to remove flow: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroup> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to remove flow');
      }

      if (!result.data) {
        throw new Error('Failed to remove flow');
      }

      return result.data;
    } catch (error) {
      console.error('Error in removeFlowFromSearchGroup:', error);
      throw error;
    }
  }

  // Grup istatistiklerini getir
  async getSearchGroupStats(groupId: string): Promise<SearchGroupStats> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/stats`, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch search group stats: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<SearchGroupStats> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch search group stats');
      }

      if (!result.data) {
        throw new Error('Search group stats not found');
      }

      return result.data;
    } catch (error) {
      console.error('Error in getSearchGroupStats:', error);
      throw error;
    }
  }

  // Grup çağrı detaylarını getir
  async getSearchGroupCallDetails(groupId: string): Promise<CallDetail[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${groupId}/call-details`, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch search group call details: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<CallDetail[]> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch search group call details');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error in getSearchGroupCallDetails:', error);
      throw error;
    }
  }
}

export const searchGroupService = new SearchGroupService(); 