'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, projectService } from '@/services/projectService';
import { authService } from '@/services/auth';

type ProjectStatus = 'active' | 'completed' | 'archived';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active' as ProjectStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchProjects = async () => {
      if (!authService.getToken()) {
        router.push('/login');
        return;
      }

      try {
        console.log('Fetching projects...');
        const data = await projectService.getProjects();
        console.log('Projects data:', data);
        
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          console.error('Invalid projects data:', data);
          setError('Proje verileri geçersiz format');
        }
      } catch (err) {
        console.error('Error details:', err);
        if (err instanceof Error) {
          if (err.message.includes('401')) {
            // Token geçersiz veya süresi dolmuş
            await authService.logout();
            router.push('/login');
          } else {
            setError(`Projeler yüklenirken bir hata oluştu: ${err.message}`);
          }
        } else {
          setError('Projeler yüklenirken beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchProjects();
  }, [router]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const project = await projectService.createProject(newProject);
      setProjects([project, ...projects]);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', status: 'active' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Proje oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Projeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projeler</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={() => setIsModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Yeni Proje
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Hata!</p>
          <p>{error}</p>
        </div>
      )}

      {projects.length === 0 && !error ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Henüz hiç proje bulunmuyor.</p>
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 mx-auto"
            onClick={() => setIsModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            İlk Projeyi Oluştur
          </button>
        </div>
      ) : null}

      {projects.length > 0 && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/projects/${project._id}`)}
            >
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              <div className="text-sm text-gray-500">
                <p>Durum: {project.status}</p>
                <p>Oluşturulma: {new Date(project.createdAt).toLocaleDateString('tr-TR')}</p>
                <p>Son Güncelleme: {new Date(project.updatedAt).toLocaleDateString('tr-TR')}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="text-blue-500 hover:text-blue-600"
                  onClick={e => { e.stopPropagation(); /* TODO: Implement edit */ }}
                >
                  Düzenle
                </button>
                <button
                  className="text-red-500 hover:text-red-600"
                  onClick={e => { e.stopPropagation(); /* TODO: Implement delete */ }}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Yeni Proje Oluştur</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Proje Adı
                </label>
                <input
                  type="text"
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                  Durum
                </label>
                <select
                  id="status"
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value as ProjectStatus })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="archived">Arşivlendi</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 