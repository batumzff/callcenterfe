'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Contact, ContactWithLastCall, contactService, getHeaders } from '@/services/contactService';
import { SearchGroup, searchGroupService } from '@/services/searchGroupService';
import ContactInput from './ContactInput';

interface ContactTableProps {
  projectId: string;
}

// Tablo satırı bileşeni
const CustomerRow = memo(({ 
  customer, 
  selectedCustomers, 
  onCustomerSelect, 
  onDeleteClick, 
  deletingCustomerId,
  onShowDetails
}: { 
  customer: ContactWithLastCall;
  selectedCustomers: ContactWithLastCall[];
  onCustomerSelect: (customer: ContactWithLastCall) => void;
  onDeleteClick: (customer: ContactWithLastCall) => void;
  deletingCustomerId: string | null;
  onShowDetails: (customer: ContactWithLastCall) => void;
}) => {
  // Çağrı durumu etiketi
  let callStatusLabel = 'Görüşme yapılmadı';
  let callStatusClass = 'bg-gray-100 text-gray-800';
  if (customer.lastCallDetail) {
    if (customer.lastCallDetail.callStatus === 'ended' || customer.lastCallDetail.callAnalysis) {
      callStatusLabel = 'Görüşme yapıldı';
      callStatusClass = 'bg-green-100 text-green-800';
    } else if (customer.lastCallDetail.callStatus === 'processing' || customer.lastCallDetail.callStatus === 'in_progress') {
      callStatusLabel = 'İşleniyor';
      callStatusClass = 'bg-blue-100 text-blue-800';
    } else if (customer.lastCallDetail.callStatus === 'failed') {
      callStatusLabel = 'Başarısız';
      callStatusClass = 'bg-red-100 text-red-800';
    }
  }
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 border-b whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedCustomers.some(c => c.phoneNumber === customer.phoneNumber)}
          onChange={() => onCustomerSelect(customer)}
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
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${callStatusClass}`}>
          {callStatusLabel}
        </span>
      </td>
      <td className="px-6 py-4 border-b whitespace-nowrap text-sm text-gray-500">
        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('tr-TR') : '-'}
      </td>
      <td className="px-6 py-4 border-b whitespace-nowrap text-sm">
        {customer.lastCallDetail ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShowDetails(customer)}
              className="text-blue-500 hover:text-blue-700 text-sm underline"
            >
              Detayları Gör
            </button>
          </div>
        ) : (
          <span className="text-gray-500">Görüşme yapılmadı</span>
        )}
      </td>
      <td className="px-6 py-4 border-b whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onDeleteClick(customer)}
          disabled={deletingCustomerId === customer._id}
          className="inline-flex items-center justify-center p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deletingCustomerId === customer._id ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </td>
    </tr>
  );
});

CustomerRow.displayName = 'CustomerRow';

// Yeni fonksiyon: Belirli müşteri ve proje için call detail getir
async function getCallDetailForCustomerAndProject(customerId: string, projectId: string) {
  const response = await fetch(`/api/call-details/customer/${customerId}/project/${projectId}`, {
    headers: getHeaders(),
    credentials: 'include',
    mode: 'cors',
  });
  const result = await response.json();
  if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
    return result.data[0]; // En yenisi veya ilkini al
  }
  return undefined;
}

// Modal bileşeni
function Modal({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export default function ContactTable({ projectId }: ContactTableProps) {
  const [contacts, setContacts] = useState<Contact[]>(
    Array(2).fill(null).map((_, index) => ({
      _id: `contact-${Date.now()}-${index}`,
      name: '',
      phoneNumber: ''
    }))
  );
  const [formValues, setFormValues] = useState<{ [key: string]: { name: string; phoneNumber: string } }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedCustomers, setSavedCustomers] = useState<ContactWithLastCall[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<ContactWithLastCall[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [callSuccess, setCallSuccess] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const MAX_POLLING_DURATION = 5 * 60 * 1000; // 5 dakika
  const [selectedCallDetails, setSelectedCallDetails] = useState<ContactWithLastCall | null>(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<ContactWithLastCall | null>(null);
  const [allCustomers, setAllCustomers] = useState<Contact[]>([]);
  const [showAllCustomersModal, setShowAllCustomersModal] = useState(false);
  const [customerModalError, setCustomerModalError] = useState<string | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  
  // Grup seçimi için yeni state'ler
  const [allGroups, setAllGroups] = useState<SearchGroup[]>([]);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [groupsModalError, setGroupsModalError] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isImportingGroup, setIsImportingGroup] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      console.log('Müşteri listesi yükleniyor... projectId:', projectId);
      // Her zaman gerçek müşteri listesini çek
      const savedContacts = await contactService.getContactsWithCallDetails(projectId);
      console.log('Yüklenen müşteriler:', savedContacts);

      // Her müşteri için, ilgili projeye ait call detail'i yeni endpoint'ten çek
      const customersWithProjectCallDetail = await Promise.all(
        savedContacts.map(async (customer) => {
          let projectCallDetail = undefined;
          try {
            projectCallDetail = await getCallDetailForCustomerAndProject(customer._id, projectId);
          } catch {
            // 404 veya başka hata olursa, lastCallDetail undefined kalsın
          }
          return {
            ...customer,
            lastCallDetail: projectCallDetail
          };
        })
      );
      // id/_id normalize et
      const normalizedCustomers = customersWithProjectCallDetail.map((c: ContactWithLastCall) => ({
        ...c,
        _id: c._id,
      }));
      console.log('Normalize edilmiş müşteriler:', normalizedCustomers);
      setSavedCustomers(normalizedCustomers);
    } catch (error) {
      console.error('Müşteri listesi yüklenirken hata:', error);
      setSavedCustomers([]);
    }
  }, [projectId]);

  useEffect(() => {
    loadContacts();
  }, [projectId, loadContacts]);

  const addNewRow = () => {
    const newContact: Contact = {
      _id: `contact-${Date.now()}-${contacts.length}`,
      name: '',
      phoneNumber: ''
    };
    setContacts([...contacts, newContact]);
  };

  const handleSave = async () => {
    // Form değerlerini topla
    const validContacts = contacts
      .filter(contact => {
        const formValue = formValues[contact._id];
        return formValue?.name?.trim() && formValue?.phoneNumber?.trim();
      })
      .map(contact => {
        const formValue = formValues[contact._id];
        return {
          name: formValue.name.trim(),
          phoneNumber: formValue.phoneNumber.trim()
        };
      });

    if (validContacts.length === 0) {
      setSaveError('En az bir geçerli müşteri bilgisi gerekli.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      console.log('Kaydedilecek müşteriler:', validContacts);
      const savedContacts = await contactService.saveContacts(projectId, validContacts);
      console.log('Kaydedilen müşteriler:', savedContacts);
      
      setSaveSuccess(true);
      setContacts([{ _id: `contact-${Date.now()}-0`, name: '', phoneNumber: '' }]);
      setFormValues({});
      
      // Müşteri listesini yenile
      await loadContacts();
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Müşteri kaydetme hatası:', error);
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Müşteri kaydedilirken bir hata oluştu.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomerSelect = (customer: ContactWithLastCall) => {
    setSelectedCustomers(prev => {
      const isSelected = prev.some(c => c.phoneNumber === customer.phoneNumber);
      if (isSelected) {
        return prev.filter(c => c.phoneNumber !== customer.phoneNumber);
      } else {
        return [...prev, customer];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === savedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers([...savedCustomers]);
    }
  };

  // Yeni: Çağrı detaylarını kontrol etmek için güncellenmiş metod
  const checkCallDetails = useCallback(async () => {
    try {
      console.log('Çağrı detayları kontrol ediliyor...');
      
      // Yeni API kullanımı: getCallDetailsForProject
      const callDetails = await contactService.getCallDetailsForProject(projectId);
      console.log('Güncel çağrı detayları:', callDetails);
      
      // Müşteri listesini güncelle
      const updatedCustomers = await contactService.getContactsWithCallDetails(projectId);
      
      setSavedCustomers(prevCustomers => {
        return prevCustomers.map(customer => {
          const updatedCustomer = updatedCustomers.find(uc => uc._id === customer._id);
          if (updatedCustomer) {
            console.log('Müşteri güncellendi:', {
              name: updatedCustomer.name,
              lastCallDetail: updatedCustomer.lastCallDetail
            });
            return updatedCustomer;
          }
          return customer;
        });
      });

      // Seçili müşterileri de güncelle
      setSelectedCustomers(prevSelected => {
        return prevSelected.map(selectedCustomer => {
          const updatedCustomer = updatedCustomers.find(uc => uc._id === selectedCustomer._id);
          if (updatedCustomer) {
            return updatedCustomer;
          }
          return selectedCustomer;
        });
      });

      // Tüm çağrılar tamamlandı mı kontrol et
      const allCallsCompleted = updatedCustomers.every(customer => 
        !customer.lastCallDetail || 
        customer.lastCallDetail.callStatus === 'completed' ||
        customer.lastCallDetail.callStatus === 'failed'
      );

      if (allCallsCompleted) {
        console.log('Tüm çağrılar tamamlandı, polling durduruluyor.');
        setIsPolling(false);
        setPollingStartTime(null);
      }
    } catch (error) {
      console.error('Çağrı detayları kontrol edilirken hata:', error);
    }
  }, [projectId]);

  // Polling için useEffect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling) {
      console.log('Polling başlatılıyor...');
      checkCallDetails();
      intervalId = setInterval(checkCallDetails, 10000); // Her 10 saniyede bir kontrol et
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, checkCallDetails, MAX_POLLING_DURATION]);

  // Polling süresi kontrolü
  useEffect(() => {
    if (pollingStartTime && Date.now() - pollingStartTime > MAX_POLLING_DURATION) {
      console.log('Maksimum polling süresi aşıldı, polling durduruluyor.');
      setIsPolling(false);
      setPollingStartTime(null);
    }
  }, [pollingStartTime, MAX_POLLING_DURATION]);

  const handleStartCalls = async () => {
    if (selectedCustomers.length === 0) {
      setCallError('Lütfen en az bir müşteri seçin.');
      return;
    }

    setIsCalling(true);
    setCallError(null);
    setCallSuccess(false);

    try {
      console.log('Seçili müşteriler için arama başlatılıyor:', selectedCustomers.map(c => c.name));
      await contactService.startCalls(selectedCustomers);
      
      setCallSuccess(true);
      setIsPolling(true);
      setPollingStartTime(Date.now());
      
      // 2 saniye sonra çağrı detaylarını kontrol et
      setTimeout(checkCallDetails, 2000);
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setCallSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Arama başlatma hatası:', error);
      if (error instanceof Error) {
        setCallError(error.message);
      } else {
        setCallError('Arama başlatılırken bir hata oluştu.');
      }
    } finally {
      setIsCalling(false);
    }
  };

  // Çağrı detayları modal bileşeni
  const CallDetailsModal = ({ contact, onClose }: { contact: ContactWithLastCall, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Çağrı Detayları - {contact.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {contact.lastCallDetail ? (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="font-semibold">Çağrı Durumu:</p>
              <p className="text-gray-700">{contact.lastCallDetail.callStatus === 'ended' || contact.lastCallDetail.callAnalysis ? 'Görüşme yapıldı' : contact.lastCallDetail.callStatus === 'processing' || contact.lastCallDetail.callStatus === 'in_progress' ? 'İşleniyor' : contact.lastCallDetail.callStatus === 'failed' ? 'Başarısız' : 'Görüşme yapılmadı'}</p>
            </div>
            {contact.lastCallDetail.duration && (
              <div className="border-b pb-4">
                <p className="font-semibold">Süre:</p>
                <p className="text-gray-700">
                  {Math.floor(contact.lastCallDetail.duration / 60)}:{(contact.lastCallDetail.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
            )}
            {contact.lastCallDetail.callAnalysis && (
              <div className="border-b pb-4">
                <p className="font-semibold">Arama Analizi:</p>
                <div className="mt-2 space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Özet:</span> {contact.lastCallDetail.callAnalysis.call_summary || 'Arama özeti bulunmuyor.'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Duygu Analizi:</span> {contact.lastCallDetail.callAnalysis.user_sentiment || '-'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Başarılı:</span> {contact.lastCallDetail.callAnalysis.call_successful ? 'Evet' : 'Hayır'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Sesli Mesaj:</span> {contact.lastCallDetail.callAnalysis.in_voicemail ? 'Evet' : 'Hayır'}
                  </p>
                </div>
              </div>
            )}
            {contact.lastCallDetail.callAnalysis?.custom_analysis_data && (
              <div className="border-b pb-4">
                <p className="font-semibold">Özel Analiz:</p>
                <div className="mt-2 space-y-2">
                  {contact.lastCallDetail.callAnalysis.custom_analysis_data.note && (
                    <p className="text-gray-700">
                      <span className="font-medium">Not:</span> {contact.lastCallDetail.callAnalysis.custom_analysis_data.note}
                    </p>
                  )}
                  {contact.lastCallDetail.callAnalysis.custom_analysis_data.result && (
                    <p className="text-gray-700">
                      <span className="font-medium">Sonuç:</span> {contact.lastCallDetail.callAnalysis.custom_analysis_data.result}
                    </p>
                  )}
                </div>
              </div>
            )}
            {contact.lastCallDetail.recordingUrl && (
              <div className="border-b pb-4">
                <p className="font-semibold">Kayıt:</p>
                <a
                  href={contact.lastCallDetail.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Kaydı Dinle
                </a>
              </div>
            )}
            {contact.lastCallDetail.transcript && (
              <div className="border-b pb-4">
                <p className="font-semibold">Transkript:</p>
                <pre className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2 max-h-40 overflow-y-auto">{contact.lastCallDetail.transcript}</pre>
              </div>
            )}
            {contact.lastCallDetail.updatedAt && (
              <div>
                <p className="font-semibold">Son Güncelleme:</p>
                <p className="text-gray-700">
                  {new Date(contact.lastCallDetail.updatedAt).toLocaleString('tr-TR')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Bu müşteri için henüz çağrı detayı bulunmuyor.</p>
        )}
      </div>
    </div>
  );

  const handleDeleteClick = (customer: ContactWithLastCall) => {
    setContactToDelete(customer);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;

    setDeletingCustomerId(contactToDelete._id);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      await contactService.deleteContact(contactToDelete._id);
      
      setDeleteSuccess(true);
      setSavedCustomers(prev => prev.filter(c => c._id !== contactToDelete._id));
      setSelectedCustomers(prev => prev.filter(c => c._id !== contactToDelete._id));
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Müşteri silme hatası:', error);
      if (error instanceof Error) {
        setDeleteError(error.message);
      } else {
        setDeleteError('Müşteri silinirken bir hata oluştu.');
      }
    } finally {
      setDeletingCustomerId(null);
      setDeleteModalOpen(false);
      setContactToDelete(null);
    }
  };

  // Silme onay modal bileşeni
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">Müşteriyi Sil</h3>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            <strong>{contactToDelete?.name}</strong> adlı müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
        </div>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setDeleteModalOpen(false);
              setContactToDelete(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            disabled={deletingCustomerId === contactToDelete?._id}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deletingCustomerId === contactToDelete?._id ? 'Siliniyor...' : 'Sil'}
          </button>
        </div>
      </div>
    </div>
  );

  // Tablo satırlarını render eden fonksiyon
  const renderCustomerRow = (customer: ContactWithLastCall) => (
    <CustomerRow
      key={customer._id}
      customer={customer}
      selectedCustomers={selectedCustomers}
      onCustomerSelect={handleCustomerSelect}
      onDeleteClick={handleDeleteClick}
      deletingCustomerId={deletingCustomerId}
      onShowDetails={setSelectedCallDetails}
    />
  );

  // Tablo renderı öncesi log
  console.log('Tabloda gösterilecek müşteriler:', savedCustomers);

  const fetchAllCustomers = async () => {
    try {
      setCustomerModalError(null);
      const res = await fetch('/api/customers', { headers: getHeaders(), credentials: 'include', mode: 'cors' });
      if (!res.ok) throw new Error('Yetkisiz veya hata oluştu');
      const data = await res.json();
      setAllCustomers(data.data || []);
      setShowAllCustomersModal(true);
    } catch (e: unknown) {
      setAllCustomers([]);
      setShowAllCustomersModal(true);
      const errorMessage = e instanceof Error ? e.message : 'Kayıtlı müşteri listesi alınamadı.';
      setCustomerModalError(errorMessage);
    }
  };

  // Grup seçimi fonksiyonları
  const fetchAllGroups = async () => {
    try {
      setGroupsModalError(null);
      console.log('Gruplar yükleniyor...');
      const groups = await searchGroupService.getAllSearchGroups();
      console.log('Yüklenen gruplar:', groups);
      console.log('Grup müşteri sayıları:', groups.map(g => ({ name: g.name, customerCount: g.customers?.length || 0 })));
      setAllGroups(groups);
      setShowGroupsModal(true);
    } catch (e: unknown) {
      setAllGroups([]);
      setShowGroupsModal(true);
      const errorMessage = e instanceof Error ? e.message : 'Grup listesi alınamadı.';
      setGroupsModalError(errorMessage);
      console.error('Grup yükleme hatası:', e);
    }
  };

  const handleGroupImport = async () => {
    if (!selectedGroupId) {
      setGroupsModalError('Lütfen bir grup seçin');
      return;
    }

    try {
      setIsImportingGroup(true);
      setGroupsModalError(null);
      
      // Seçili grubu bul
      const selectedGroup = allGroups.find(g => g._id === selectedGroupId);
      if (!selectedGroup) {
        throw new Error('Seçili grup bulunamadı');
      }

      if (!selectedGroup.customers || selectedGroup.customers.length === 0) {
        setGroupsModalError('Seçili grupta müşteri bulunmuyor');
        return;
      }

      console.log('Grup müşterileri:', selectedGroup.customers);
      
      // Gruptaki müşterileri projeye ekle
      const addedCustomers = [];
      const failedCustomers = [];
      
      for (const customer of selectedGroup.customers) {
        try {
          if (customer._id) {
            // Mevcut müşteriyi projeye ekle
            console.log(`Mevcut müşteri projeye ekleniyor: ${customer.name} (${customer._id})`);
            const response = await fetch(`/api/customers/${customer._id}/project/${projectId}`, {
              method: 'POST',
              headers: getHeaders(),
              credentials: 'include',
              mode: 'cors'
            });
            
            if (response.ok) {
              addedCustomers.push(customer);
              console.log(`Müşteri başarıyla eklendi: ${customer.name}`);
            } else {
              const errorData = await response.json();
              console.error(`Müşteri eklenemedi: ${customer.name}`, errorData);
              failedCustomers.push(customer);
            }
          } else {
            // Yeni müşteri ise kaydet
            console.log(`Yeni müşteri kaydediliyor: ${customer.name}`);
            const savedContacts = await contactService.saveContacts(projectId, [{
              name: customer.name,
              phoneNumber: customer.phoneNumber,
              note: customer.note,
              record: customer.record,
              status: customer.status
            }]);
            addedCustomers.push(...savedContacts);
            console.log(`Yeni müşteri başarıyla kaydedildi: ${customer.name}`);
          }
        } catch (err) {
          console.error(`Müşteri işlenirken hata: ${customer.name}`, err);
          failedCustomers.push(customer);
        }
      }
      
      console.log('Başarıyla eklenen müşteriler:', addedCustomers);
      console.log('Eklenemeyen müşteriler:', failedCustomers);
      
      if (failedCustomers.length > 0) {
        setGroupsModalError(`${failedCustomers.length} müşteri eklenemedi. Başarıyla eklenen: ${addedCustomers.length}`);
      }
      
      // Müşteri listesini yenile
      await loadContacts();
      
      // Modal'ı kapat
      setShowGroupsModal(false);
      setSelectedGroupId('');
      
      // Başarı mesajı göster
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Grup import edilirken hata oluştu.';
      setGroupsModalError(errorMessage);
      console.error('Grup import hatası:', e);
    } finally {
      setIsImportingGroup(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Müşteri Ekleme Butonları */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={fetchAllCustomers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Kayıtlı Müşterileri Listele
        </button>
        <button
          onClick={fetchAllGroups}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Grup Seç ve İçe Aktar
        </button>
      </div>
      
      {/* Başarı ve hata mesajları */}
      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Müşteriler başarıyla kaydedildi!
        </div>
      )}
      
      {saveError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {saveError}
        </div>
      )}
      
      {callSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Aramalar başarıyla başlatıldı!
        </div>
      )}
      
      {callError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {callError}
        </div>
      )}
      
      {deleteSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Müşteri başarıyla silindi!
        </div>
      )}
      
      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {deleteError}
        </div>
      )}

      {/* Müşteri Ekleme Formu */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Yeni Müşteri Ekle</h2>
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <ContactInput
              key={contact._id}
              id={contact._id}
              name={formValues[contact._id]?.name || ''}
              phoneNumber={formValues[contact._id]?.phoneNumber || ''}
              onNameChange={(value) => {
                setFormValues(prev => ({
                  ...prev,
                  [contact._id]: {
                    ...prev[contact._id],
                    name: value
                  }
                }));
              }}
              onPhoneNumberChange={(value) => {
                setFormValues(prev => ({
                  ...prev,
                  [contact._id]: {
                    ...prev[contact._id],
                    phoneNumber: value
                  }
                }));
              }}
              onRemove={() => {
                if (contacts.length > 1) {
                  setContacts(contacts.filter((_, i) => i !== index));
                  const newFormValues = { ...formValues };
                  delete newFormValues[contact._id];
                  setFormValues(newFormValues);
                }
              }}
              canRemove={contacts.length > 1}
            />
          ))}
          <div className="flex justify-between">
            <button
              onClick={addNewRow}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              + Başka Müşteri Ekle
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Müşteri Listesi */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Müşteri Listesi</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500"
              >
                {selectedCustomers.length === savedCustomers.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
              <button
                onClick={handleStartCalls}
                disabled={selectedCustomers.length === 0 || isCalling || isPolling}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalling ? 'Başlatılıyor...' : isPolling ? 'Aramalar Devam Ediyor...' : 'Arama Başlat'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === savedCustomers.length && savedCustomers.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Çağrı Durumu
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {savedCustomers.map(renderCustomerRow)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modaller */}
      {selectedCallDetails && (
        <CallDetailsModal
          contact={selectedCallDetails}
          onClose={() => setSelectedCallDetails(null)}
        />
      )}
      
      {deleteModalOpen && <DeleteConfirmationModal />}

      {/* Kayıtlı Müşteriler Modalı */}
      {showAllCustomersModal && (
        <Modal onClose={() => setShowAllCustomersModal(false)}>
          <h2 className="text-lg font-semibold mb-4">Kayıtlı Müşteriler</h2>
          {customerModalError && (
            <div className="mb-2 text-red-600">{customerModalError}</div>
          )}
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Seç</th>
                <th className="px-4 py-2 text-left">Ad Soyad</th>
                <th className="px-4 py-2 text-left">Telefon</th>
              </tr>
            </thead>
            <tbody>
              {(allCustomers || []).map((c) => (
                <tr key={c._id}>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedCustomerIds.includes(c._id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedCustomerIds(prev => [...prev, c._id]);
                        } else {
                          setSelectedCustomerIds(prev => prev.filter(id => id !== c._id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.phoneNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <button
              disabled={selectedCustomerIds.length === 0}
              onClick={async () => {
                await Promise.all(selectedCustomerIds.map(id =>
                  fetch(`/api/customers/${id}/project/${projectId}`, { method: 'POST', headers: getHeaders(), credentials: 'include', mode: 'cors' })
                ));
                setShowAllCustomersModal(false);
                setSelectedCustomerIds([]);
                await loadContacts();
              }}
              className={`px-4 py-2 rounded text-white ${selectedCustomerIds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              Seçili Müşterileri Projeye Ekle
            </button>
          </div>
        </Modal>
      )}

      {/* Arama Grupları Modalı */}
      {showGroupsModal && (
        <Modal onClose={() => setShowGroupsModal(false)}>
          <h2 className="text-lg font-semibold mb-4">Arama Grupları</h2>
          {groupsModalError && (
            <div className="mb-2 text-red-600">{groupsModalError}</div>
          )}
          <div className="space-y-4">
            {allGroups.map((group) => (
              <div key={group._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {group.customerCount || group.customers.length} müşteri
                    </span>
                    <input
                      type="radio"
                      name="selectedGroup"
                      value={group._id}
                      checked={selectedGroupId === group._id}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                  </div>
                </div>
                {group.customers.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <strong>Müşteriler:</strong> {group.customers.map(c => c.name).join(', ')}
                    <br />
                    <strong>Müşteri Detayları:</strong>
                    <ul className="mt-1 ml-4">
                      {group.customers.map(c => (
                        <li key={c._id}>
                          {c.name} - {c.phoneNumber} {c.note && `(${c.note})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowGroupsModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              İptal
            </button>
            <button
              onClick={handleGroupImport}
              disabled={!selectedGroupId || isImportingGroup}
              className={`px-4 py-2 rounded-md text-white ${
                !selectedGroupId || isImportingGroup 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isImportingGroup ? 'İçe Aktarılıyor...' : 'Grubu Projeye Ekle'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
} 