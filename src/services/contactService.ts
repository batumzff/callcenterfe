import { API_BASE_URL } from '@/config/api';
import { authService } from './auth';

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  projectId?: string;
  status?: 'pending' | 'completed';
  searchResults?: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

class ContactService {
  private baseUrl = `${API_BASE_URL}/customers`;

  async saveContacts(projectId: string, contacts: Omit<Contact, 'id'>[]): Promise<Contact[]> {
    try {
      const savedContacts = [];
      
      // Her bir müşteriyi ayrı ayrı kaydet
      for (const contact of contacts) {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            name: contact.name,
            phoneNumber: contact.phoneNumber
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Server response:', errorData);
          throw new Error(`Failed to save contact: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse<Contact> = await response.json();
        
        if (result.status === 'error') {
          throw new Error(result.message || 'Failed to save contact');
        }

        if (result.data) {
          savedContacts.push(result.data);
        }
      }

      return savedContacts;
    } catch (error) {
      console.error('Error in saveContacts:', error);
      throw error;
    }
  }

  async getContacts(projectId: string): Promise<Contact[]> {
    try {
      const response = await fetch(`${this.baseUrl}?projectId=${projectId}`, {
        headers: getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<{customers: Contact[]}> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch contacts');
      }

      return result.data?.customers || [];
    } catch (error) {
      console.error('Error in getContacts:', error);
      throw error;
    }
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update contact: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<Contact> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to update contact');
      }

      return result.data!;
    } catch (error) {
      console.error('Error in updateContact:', error);
      throw error;
    }
  }

  async deleteContact(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete contact: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to delete contact');
      }
    } catch (error) {
      console.error('Error in deleteContact:', error);
      throw error;
    }
  }

  async startCalls(contacts: Contact[]): Promise<void> {
    try {
      // Her bir müşteri için ayrı ayrı arama başlat
      for (const contact of contacts) {
        const response = await fetch(`${API_BASE_URL}/retell/call`, {
          method: 'POST',
          headers: getHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            projectId: contact.projectId
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to start calls: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse<void> = await response.json();
        
        if (result.status === 'error') {
          throw new Error(result.message || 'Failed to start calls');
        }
      }
    } catch (error) {
      console.error('Error in startCalls:', error);
      throw error;
    }
  }
}

export const contactService = new ContactService(); 