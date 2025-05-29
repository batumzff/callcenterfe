import { API_BASE_URL } from '@/config/api';
import { authService } from './auth';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  customers: string[];
  createdBy: string;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

const getHeaders = () => {
  const token = authService.getToken();
  return {
    ...defaultHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

class ProjectService {
  private baseUrl = `${API_BASE_URL}/projects`;

  async getProjects(): Promise<Project[]> {
    try {
      console.log('Fetching projects from:', this.baseUrl);
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        console.error('Failed to fetch projects:', response.status, response.statusText);
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<Project[]> = await response.json();
      console.log('Projects response:', result);

      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch projects');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error in getProjects:', error);
      throw error;
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        if (response.status === 401) {
          await authService.logout();
          window.location.href = '/login';
          return null;
        }
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<Project> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch project');
      }

      return result.data || null;
    } catch (error) {
      console.error('Error in getProject:', error);
      throw error;
    }
  }

  async createProject(project: Omit<Project, '_id' | 'createdAt' | 'updatedAt' | 'customers' | 'createdBy'>): Promise<Project> {
    try {
      console.log('GÖNDERİLEN PROJECT:', project);
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<Project> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to create project');
      }

      if (!result.data) {
        throw new Error('Failed to create project: No data returned');
      }

      return result.data;
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<Project> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to update project');
      }

      if (!result.data) {
        throw new Error('Failed to update project: No data returned');
      }

      return result.data;
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService(); 