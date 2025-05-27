'use client';

import { useState, useEffect } from 'react';
import { Contact, contactService } from '@/services/contactService';

interface ContactTableProps {
  projectId: string;
}

export default function ContactTable({ projectId }: ContactTableProps) {
  const [contacts, setContacts] = useState<Contact[]>(
    Array(2).fill(null).map((_, index) => ({
      id: `contact-${Date.now()}-${index}`,
      name: '',
      phoneNumber: ''
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState<Contact[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Contact[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [callSuccess, setCallSuccess] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [projectId]);

  const loadContacts = async () => {
    try {
      const savedContacts = await contactService.getContacts(projectId);
      console.log('loadContacts - Gelen müşteriler:', savedContacts);
      
      if (savedContacts.length > 0) {
        setSavedCustomers(savedContacts);
        console.log('loadContacts - State güncellendi');
      } else {
        console.log('loadContacts - Gelen müşteri listesi boş');
        setSavedCustomers([]);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      setSavedCustomers([]);
    }
  };

  const handleInputChange = (id: string, field: 'name' | 'phoneNumber', value: string) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const addNewRow = () => {
    const newContact: Contact = {
      id: `contact-${Date.now()}-${contacts.length}`,
      name: '',
      phoneNumber: ''
    };
    setContacts([...contacts, newContact]);
  };

  const handleSave = async () => {
    // Boş satırları filtrele
    const validContacts = contacts
      .filter(contact => contact.name.trim() && contact.phoneNumber.trim())
      .map(({ name, phoneNumber }) => ({ name, phoneNumber }));
    
    if (validContacts.length === 0) {
      setSaveError('Lütfen en az bir kişi bilgisi giriniz.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await contactService.saveContacts(projectId, validContacts);
      setSaveSuccess(true);
      
      // Başarılı kayıttan sonra formu temizle
      setContacts(Array(2).fill(null).map((_, index) => ({
        id: `contact-${Date.now()}-${index}`,
        name: '',
        phoneNumber: ''
      })));

      // Kaydedilen verileri yeniden yükle
      await loadContacts();
    } catch (error) {
      setSaveError('Kişiler kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz.');
      console.error('Kaydetme hatası:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const checkSavedCustomers = async () => {
    try {
      console.log('Müşteriler yükleniyor...');
      const customers = await contactService.getContacts(projectId);
      console.log('Gelen müşteriler:', customers);
      
      if (customers.length > 0) {
        setSavedCustomers(customers);
        console.log('State güncellendi, savedCustomers:', customers);
      } else {
        console.log('Gelen müşteri listesi boş');
        setSavedCustomers([]);
      }
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
      setSavedCustomers([]);
    }
  };

  // Sayfa yüklendiğinde müşterileri otomatik yükle
  useEffect(() => {
    checkSavedCustomers();
  }, [projectId]);

  const handleCustomerSelect = (customer: Contact) => {
    setSelectedCustomers(prev => {
      const isSelected = prev.some(c => c.phoneNumber === customer.phoneNumber);
      if (isSelected) {
        return prev.filter(c => c.phoneNumber !== customer.phoneNumber);
      } else {
        return [...prev, customer];
      }
    });
  };

  const handleStartCalls = async () => {
    if (selectedCustomers.length === 0) {
      setCallError('Lütfen en az bir müşteri seçiniz.');
      return;
    }

    setIsCalling(true);
    setCallError(null);
    setCallSuccess(false);

    try {
      await contactService.startCalls(selectedCustomers);
      setCallSuccess(true);
      setSelectedCustomers([]);
    } catch (error) {
      setCallError('Arama başlatılırken bir hata oluştu. Lütfen tekrar deneyiniz.');
      console.error('Arama hatası:', error);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">İletişim Bilgileri</h2>
        <div className="flex gap-2">
          <button
            onClick={checkSavedCustomers}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Kayıtlı Müşterileri Kontrol Et
          </button>
          <button
            onClick={addNewRow}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Yeni Satır Ekle
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{saveError}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Kişiler başarıyla kaydedildi!</p>
        </div>
      )}

      {callError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{callError}</p>
        </div>
      )}

      {callSuccess && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Aramalar başarıyla başlatıldı!</p>
        </div>
      )}

      {/* Kayıtlı Müşteriler Tablosu */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Kayıtlı Müşteriler</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {savedCustomers.length} müşteri bulundu
            </span>
            <button
              onClick={handleStartCalls}
              disabled={isCalling || selectedCustomers.length === 0}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalling ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Aramalar Başlatılıyor...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Arama Yap ({selectedCustomers.length})
                </>
              )}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seç
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İsim
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon Numarası
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
              </tr>
            </thead>
            <tbody>
              {savedCustomers && savedCustomers.length > 0 ? (
                savedCustomers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.some(c => c.phoneNumber === customer.phoneNumber)}
                        onChange={() => handleCustomerSelect(customer)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 border-b whitespace-nowrap">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 border-b whitespace-nowrap">
                      {customer.phoneNumber}
                    </td>
                    <td className="px-6 py-4 border-b whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${customer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          customer.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {customer.status === 'pending' ? 'Beklemede' : 
                         customer.status === 'completed' ? 'Tamamlandı' : 
                         customer.status === 'processing' ? 'İşleniyor' : 
                         'Başarısız'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b whitespace-nowrap text-sm text-gray-500">
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('tr-TR') : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Henüz kayıtlı müşteri bulunmuyor
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İsim
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefon Numarası
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => handleInputChange(contact.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="İsim giriniz"
                  />
                </td>
                <td className="px-6 py-4 border-b">
                  <input
                    type="tel"
                    value={contact.phoneNumber}
                    onChange={(e) => handleInputChange(contact.id, 'phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Telefon numarası giriniz"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 