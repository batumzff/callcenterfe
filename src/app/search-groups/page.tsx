'use client';

import { useState, useEffect } from 'react';
import { searchGroupService, SearchGroup } from '@/services/searchGroupService';
import { getHeaders } from '@/services/contactService';
import Link from 'next/link';

export default function SearchGroupsPage() {
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SearchGroup | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await searchGroupService.getAllSearchGroups();
      setGroups(data);
    } catch (err) {
      setError('Gruplar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = (group: SearchGroup) => {
    setSelectedGroup(group);
    setShowAddCustomerModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Arama Grupları</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Yeni Grup Oluştur
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                group.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : group.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : group.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {group.status === 'active' ? 'Aktif' : 
                 group.status === 'completed' ? 'Tamamlandı' :
                 group.status === 'paused' ? 'Duraklatıldı' : 'Arşivlendi'}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {group.description || 'Açıklama bulunmuyor'}
            </p>
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>Müşteri: {group.customerCount || group.customers?.length || 0}</span>
              <span>Proje: {group.projectCount || group.projects?.length || 0}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(group.createdAt).toLocaleDateString('tr-TR')}
              </span>
              <div className="flex space-x-2">
                <Link 
                  href={`/search-groups/${group._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Detaylar
                </Link>
                <button 
                  onClick={() => handleAddCustomer(group)}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  Müşteri Ekle
                </button>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                  Düzenle
                </button>
                <button className="text-red-600 hover:text-red-800 text-sm">
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz arama grubu oluşturulmamış</h3>
          <p className="text-gray-600 mb-4">
            Arama grupları oluşturarak müşterilerinizi organize edebilir ve projelerinize toplu atama yapabilirsiniz.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            İlk Grubunuzu Oluşturun
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadGroups();
          }}
        />
      )}

      {showAddCustomerModal && selectedGroup && (
        <AddCustomerModal
          onClose={() => setShowAddCustomerModal(false)}
          onSuccess={() => {
            setShowAddCustomerModal(false);
            setSelectedGroup(null);
            loadGroups();
          }}
          group={selectedGroup}
        />
      )}
    </div>
  );
}

// Grup oluşturma modal bileşeni
function CreateGroupModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxCustomers, setMaxCustomers] = useState(1000);
  const [autoAssignProjects, setAutoAssignProjects] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Grup adı gereklidir');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await searchGroupService.createSearchGroup({
        name: name.trim(),
        description: description.trim(),
        settings: {
          maxCustomers,
          autoAssignProjects,
          notificationEnabled
        }
      });
      onSuccess();
    } catch (err) {
      setError('Grup oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Yeni Arama Grubu Oluştur</h2>
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grup Adı *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Örn: VIP Müşteriler"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Grup hakkında açıklama..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maksimum Müşteri Sayısı
            </label>
            <input
              type="number"
              value={maxCustomers}
              onChange={(e) => setMaxCustomers(Number(e.target.value))}
              min="1"
              max="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoAssignProjects}
                onChange={(e) => setAutoAssignProjects(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Otomatik Proje Ataması</span>
            </label>
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationEnabled}
                onChange={(e) => setNotificationEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Bildirimleri Etkinleştir</span>
            </label>
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
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Müşteri ekleme modal bileşeni
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
  
  // Mevcut müşteriler için state'ler
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Mevcut müşterileri yükle
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
    } catch (e: unknown) {
      setAllCustomers([]);
      const errorMessage = e instanceof Error ? e.message : 'Kayıtlı müşteri listesi alınamadı.';
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
    } catch (err) {
      setError('Müşteri eklenirken hata oluştu');
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
      
      // Seçili müşterileri gruba ekle
      for (const customerId of selectedCustomerIds) {
        await searchGroupService.addCustomerToSearchGroup(group._id, customerId);
      }
      
      onSuccess();
    } catch (err) {
      setError('Müşteriler eklenirken hata oluştu');
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

        {/* Tab Sistemi */}
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

        {/* Yeni Müşteri Ekleme Tab'ı */}
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

        {/* Mevcut Müşteriler Tab'ı */}
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