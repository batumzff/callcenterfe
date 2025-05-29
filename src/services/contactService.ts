import { API_BASE_URL } from '@/config/api';
import { authService } from './auth';

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  projectId?: string;
  status?: 'pending' | 'completed' | 'processing' | 'failed';
  note?: string;
  record?: string;
  searchResults?: Array<{
    id: string;
    name: string;
    phoneNumber: string;
    status?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  retellData?: {
    callId?: string;
    callStatus?: string;
    transcript?: string;
    recordingUrl?: string;
    callAnalysis?: {
      call_summary?: string;
      user_sentiment?: string;
      call_successful?: boolean;
      in_voicemail?: boolean;
    };
    custom_analysis_data?: {
      lastUpdated?: string;
    };
    duration?: number;
    summary?: string;
    status?: string;
    updatedAt?: string;
  };
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
            phoneNumber: contact.phoneNumber,
            projectId: projectId
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
      console.log('Müşteri verileri için API çağrısı yapılıyor:', `${this.baseUrl}?projectId=${projectId}`);
      const response = await fetch(`${this.baseUrl}?projectId=${projectId}`, {
        headers: getHeaders(),
        credentials: 'include',
      });

      console.log('API yanıt durumu:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API hata yanıtı:', errorText);
        throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<Contact[]> = await response.json();
      console.log('API yanıt verisi (ham):', result);
      
      if (result.status === 'error') {
        console.error('API hata durumu:', result.message);
        throw new Error(result.message || 'Failed to fetch contacts');
      }

      if (!result.data) {
        console.warn('API yanıtında veri bulunamadı:', result);
        return [];
      }

      console.log('İşlenmiş müşteri verileri:', result.data.map(contact => ({
        id: contact.id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        status: contact.status,
        retellData: contact.retellData,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      })));

      return result.data;
    } catch (error) {
      console.error('Müşteri verileri alınırken hata:', error);
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
      console.log('Arama başlatılıyor, seçili müşteriler:', contacts.map(c => ({
        name: c.name,
        phoneNumber: c.phoneNumber
      })));

      // Her bir müşteri için ayrı ayrı arama başlat
      for (const contact of contacts) {
        console.log('Müşteri için arama başlatılıyor:', {
          name: contact.name,
          phoneNumber: contact.phoneNumber
        });

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
          console.error('Arama başlatma hatası:', {
            status: response.status,
            statusText: response.statusText,
            customer: contact.name
          });
          throw new Error(`Failed to start calls: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse<void> = await response.json();
        
        if (result.status === 'error') {
          console.error('API hata yanıtı:', {
            message: result.message,
            customer: contact.name
          });
          throw new Error(result.message || 'Failed to start calls');
        }

        console.log('Arama başarıyla başlatıldı:', contact.name);
      }
    } catch (error) {
      console.error('Error in startCalls:', error);
      throw error;
    }
  }

  async getRetellData(projectId: string): Promise<Contact[]> {
    try {
      console.log('Retell verileri için API çağrısı yapılıyor:', `${this.baseUrl}/retell-data?projectId=${projectId}`);
      const response = await fetch(`${this.baseUrl}/retell-data?projectId=${projectId}`, {
        headers: getHeaders(),
        credentials: 'include',
      });

      console.log('API yanıt durumu:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API hata yanıtı:', errorText);
        throw new Error(`Failed to fetch retell data: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<Contact[]> = await response.json();
      console.log('API yanıt verisi:', result);
      
      if (result.status === 'error') {
        console.error('API hata durumu:', result.message);
        throw new Error(result.message || 'Failed to fetch retell data');
      }

      if (!result.data) {
        console.warn('API yanıtında veri bulunamadı:', result);
        return [];
      }

      // Her bir müşteri için retell verilerini işle
      const processedData = result.data.map(contact => {
        console.log('İşlenen müşteri verisi:', {
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          status: contact.status,
          retellData: contact.retellData
        });
        return contact;
      });

      console.log('İşlenmiş retell verileri:', processedData);
      return processedData;
    } catch (error) {
      console.error('Retell verileri alınırken hata:', error);
      throw error;
    }
  }
}

export const contactService = new ContactService(); 