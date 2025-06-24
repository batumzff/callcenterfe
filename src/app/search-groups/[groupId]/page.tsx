'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { searchGroupService, SearchGroup } from '@/services/searchGroupService';
import { getHeaders, Contact } from '@/services/contactService';

export default function SearchGroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  
  const [group, setGroup] = useState<SearchGroup | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  const loadGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const groupData = await searchGroupService.getSearchGroupById(groupId);
      setGroup(groupData);
      setCustomers(groupData.customers || []);
    } catch (error) {
      setError('Grup detayları yüklenirken hata oluştu');
      console.error('Grup detayları yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      loadGroupDetails();
    }
  }, [groupId, loadGroupDetails]);

  const handleRemoveCustomer = async (customerId: string) => {
    if (!confirm('Bu müşteriyi gruptan çıkarmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await searchGroupService.removeCustomerFromSearchGroup(groupId, customerId);
      setCustomers(prev => prev.filter(c => c._id !== customerId));
    } catch (error) {
      setError('Müşteri çıkarılırken hata oluştu');
      console.error('Müşteri çıkarma hatası:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hata</h2>
          <p className="text-gray-600">{error || 'Grup bulunamadı'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>
            <p className="text-gray-600 mb-4">{group.description}</p>
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>Oluşturulma: {new Date(group.createdAt).toLocaleDateString('tr-TR')}</span>
              <span>Müşteri Sayısı: {customers.length}</span>
              <span>Durum: {group.status}</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Müşteri Ekle
          </button>
        </div>
      </div>

      {/* Müşteri Listesi */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Grup Müşterileri</h2>
        </div>
        
        {customers.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">Bu grupta henüz müşteri bulunmuyor.</p>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              İlk Müşteriyi Ekle
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eklenme Tarihi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        {customer.note && (
                          <div className="text-sm text-gray-500">{customer.note}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.addedAt || customer.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveCustomer(customer._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Çıkar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Müşteri Ekleme Modal */}
      {showAddCustomerModal && (
        <AddCustomerModal
          onClose={() => setShowAddCustomerModal(false)}
          onSuccess={() => {
            setShowAddCustomerModal(false);
            loadGroupDetails();
          }}
          group={group}
        />
      )}
    </div>
  );
}

// Müşteri ekleme modal bileşeni (aynı kod)
function AddCustomerModal({ 
  onClose, 
  onSuccess, 
  group 
}: { 
  onClose: () => void; 
  onSuccess: () => void; 
  group: SearchGroup | null; 
}) {
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [allCustomers, setAllCustomers] = useState<Contact[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const res = await fetch('/api/customers', { 
        headers: getHeaders(), 
        credentials: 'include', 
        mode: 'cors' 
      });
      if (!res.ok) throw new Error('Yetkisiz veya hata oluştu');
      const data = await res.json();
      setAllCustomers(data.data || []);
    } catch (error: unknown) {
      setAllCustomers([]);
      const errorMessage = error instanceof Error ? error.message : 'Kayıtlı müşteri listesi alınamadı.';
      console.error('Müşteriler yüklenirken hata:', errorMessage);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'existing') {
      loadCustomers();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) {
      setError('Grup bulunamadı');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Müşteri adı ve telefon numarası gereklidir');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await searchGroupService.addExternalCustomerToSearchGroup(group._id, {
        name: customerName.trim(),
        phoneNumber: customerPhone.trim(),
        note: customerEmail.trim() || undefined
      });
      onSuccess();
    } catch (error) {
      setError('Müşteri eklenirken hata oluştu');
      console.error('Müşteri ekleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExistingCustomers = async () => {
    if (!group || selectedCustomerIds.length === 0) {
      setError('Lütfen en az bir müşteri seçin');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      for (const customerId of selectedCustomerIds) {
        await searchGroupService.addCustomerToSearchGroup(group._id, customerId);
      }
      
      onSuccess();
    } catch (error) {
      setError('Müşteriler eklenirken hata oluştu');
      console.error('Müşteri ekleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {group?.name} Grubuna Müşteri Ekle
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('new')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'new'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Yeni Müşteri Ekle
            </button>
            <button
              onClick={() => setActiveTab('existing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'existing'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mevcut Müşterileri Ekle
            </button>
          </nav>
        </div>

        {activeTab === 'new' && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müşteri Adı *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Müşteri Telefonu *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Örn: 0555 123 45 67"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Not (Opsiyonel)
              </label>
              <textarea
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Müşteri hakkında not..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'existing' && (
          <div>
            {loadingCustomers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedCustomerIds.length === allCustomers.length && allCustomers.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCustomerIds(allCustomers.map(c => c._id));
                              } else {
                                setSelectedCustomerIds([]);
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allCustomers.map((customer) => (
                        <tr key={customer._id}>
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedCustomerIds.includes(customer._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCustomerIds(prev => [...prev, customer._id]);
                                } else {
                                  setSelectedCustomerIds(prev => prev.filter(id => id !== customer._id));
                                }
                              }}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{customer.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{customer.phoneNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {selectedCustomerIds.length} müşteri seçildi
                  </span>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleAddExistingCustomers}
                      disabled={selectedCustomerIds.length === 0 || loading}
                      className={`px-4 py-2 rounded-md text-white ${
                        selectedCustomerIds.length === 0 || loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {loading ? 'Ekleniyor...' : `${selectedCustomerIds.length} Müşteriyi Ekle`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 