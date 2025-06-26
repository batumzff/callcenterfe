import { API_BASE_URL } from '@/config/api';
import { authService } from './auth';

// Yeni CallDetail interface'i
export interface CallDetail {
  _id: string;
  customerId: string;
  projectId: string;
  callId: string;
  callStatus: string;
  transcript?: string;
  recordingUrl?: string;
  callAnalysis?: {
    call_summary?: string;
    user_sentiment?: string;
    call_successful?: boolean;
    in_voicemail?: boolean;
    custom_analysis_data?: {
      note?: string;
      result?: string;
    };
  };
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Güncellenmiş Contact interface'i - retellData kaldırıldı
export interface Contact {
  _id: string;
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
  // retellData kaldırıldı - artık ayrı bir CallDetail objesi olarak geliyor
}

// Müşteri listesi için kullanılacak interface - son çağrı detayı ile birlikte
export interface ContactWithLastCall extends Contact {
  lastCallDetail?: CallDetail;
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

class ContactService {
  private baseUrl = `${API_BASE_URL}/customers`;
  private callDetailsUrl = `${API_BASE_URL}/call-details`;

  async saveContacts(projectId: string, contacts: Omit<Contact, '_id'>[]): Promise<Contact[]> {
    try {
      const savedContacts = [];
      
      // Her bir müşteriyi ayrı ayrı kaydet
      for (const contact of contacts) {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: getHeaders(),
          credentials: 'include',
          mode: 'cors',
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

  // Yeni: Müşteri listesi ile çağrı detaylarını birlikte getir
  async getContactsWithCallDetails(projectId: string): Promise<ContactWithLastCall[]> {
    try {
      console.log('Müşteri verileri ve çağrı detayları için API çağrısı yapılıyor:', `${this.baseUrl}/call-details?projectId=${projectId}`);
      
      const response = await fetch(`${this.baseUrl}/call-details?projectId=${projectId}`, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      console.log('API yanıt durumu:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API hata yanıtı:', errorText);
        throw new Error(`Failed to fetch contacts with call details: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<ContactWithLastCall[]> = await response.json();
      console.log('API yanıt verisi (ham):', result);
      
      if (result.status === 'error') {
        console.error('API hata durumu:', result.message);
        throw new Error(result.message || 'Failed to fetch contacts with call details');
      }

      if (!result.data) {
        console.warn('API yanıtında veri bulunamadı:', result);
        return [];
      }

      console.log('İşlenmiş müşteri verileri:', result.data.map(contact => ({
        id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        status: contact.status,
        lastCallDetail: contact.lastCallDetail,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      })));

      return result.data;
    } catch (error) {
      console.error('Müşteri verileri alınırken hata:', error);
      throw error;
    }
  }

  // Eski getContacts metodu - geriye uyumluluk için korundu
  async getContacts(projectId: string): Promise<Contact[]> {
    try {
      console.log('Müşteri verileri için API çağrısı yapılıyor:', `${this.baseUrl}?projectId=${projectId}`);
      const response = await fetch(`${this.baseUrl}?projectId=${projectId}`, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
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
        id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        status: contact.status,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      })));

      return result.data;
    } catch (error) {
      console.error('Müşteri verileri alınırken hata:', error);
      throw error;
    }
  }

  // Yeni: Belirli bir müşterinin çağrı detaylarını getir
  async getCallDetailsForCustomer(customerId: string): Promise<CallDetail[]> {
    try {
      console.log('Müşteri çağrı detayları için API çağrısı yapılıyor:', `${this.callDetailsUrl}/customer/${customerId}`);
      const response = await fetch(`${this.callDetailsUrl}/customer/${customerId}`, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      console.log('API yanıt durumu:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API hata yanıtı:', errorText);
        throw new Error(`Failed to fetch call details: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<CallDetail[]> = await response.json();
      console.log('API yanıt verisi:', result);
      
      if (result.status === 'error') {
        console.error('API hata durumu:', result.message);
        throw new Error(result.message || 'Failed to fetch call details');
      }

      if (!result.data) {
        console.warn('API yanıtında veri bulunamadı:', result);
        return [];
      }

      return result.data;
    } catch (error) {
      console.error('Çağrı detayları alınırken hata:', error);
      throw error;
    }
  }

  // Yeni: Proje için tüm çağrı detaylarını getir
  async getCallDetailsForProject(projectId: string): Promise<CallDetail[]> {
    try {
      console.log('Proje çağrı detayları için API çağrısı yapılıyor:', `${this.callDetailsUrl}/project/${projectId}`);
      const response = await fetch(`${this.callDetailsUrl}/project/${projectId}`, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      console.log('API yanıt durumu:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API hata yanıtı:', errorText);
        throw new Error(`Failed to fetch project call details: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<CallDetail[]> = await response.json();
      console.log('API yanıt verisi:', result);
      
      if (result.status === 'error') {
        console.error('API hata durumu:', result.message);
        throw new Error(result.message || 'Failed to fetch project call details');
      }

      if (!result.data) {
        console.warn('API yanıtında veri bulunamadı:', result);
        return [];
      }

      return result.data;
    } catch (error) {
      console.error('Proje çağrı detayları alınırken hata:', error);
      throw error;
    }
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
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
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', errorData);
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

  async startCalls(contacts: Contact[], projectId: string): Promise<void> {
    try {
      console.log('Arama başlatılıyor, seçili müşteriler:', contacts.map(c => ({
        name: c.name,
        phoneNumber: c.phoneNumber
      })));

      // Her bir müşteri için ayrı ayrı arama başlat
      for (const contact of contacts) {
        console.log('Müşteri için arama başlatılıyor:', {
          name: contact.name,
          phoneNumber: contact.phoneNumber,
          projectId: projectId
        });

        const response = await fetch(`${API_BASE_URL}/retell/call`, {
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

  // Test endpoint'i - tüm müşterileri getir (projectId olmadan)
  async testGetAllCustomers(): Promise<Contact[]> {
    try {
      console.log('Test endpoint çağrılıyor: /api/customers/test-data');
      const response = await fetch(`${this.baseUrl}/test-data`, {
        headers: getHeaders(),
        credentials: 'include',
        mode: 'cors',
      });

      console.log('Test API yanıt durumu:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test API hata yanıtı:', errorText);
        throw new Error(`Failed to fetch test data: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<Contact[]> = await response.json();
      console.log('Test API yanıt verisi:', result);
      
      if (result.status === 'error') {
        console.error('Test API hata durumu:', result.message);
        throw new Error(result.message || 'Failed to fetch test data');
      }

      return result.data || [];
    } catch (error) {
      console.error('Test endpoint hatası:', error);
      throw error;
    }
  }
}

export const contactService = new ContactService(); 