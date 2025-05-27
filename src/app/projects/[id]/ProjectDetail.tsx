'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, projectService } from '@/services/projectService';
import { authService } from '@/services/auth';
import ContactTable from '@/components/ContactTable';

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetchProject = async () => {
      if (!authService.getToken()) {
        router.push('/login');
        return;
      }

      try {
        const data = await projectService.getProject(projectId);
        setProject(data);
      } catch (err) {
        console.error('Error details:', err);
        if (err instanceof Error) {
          if (err.message.includes('401')) {
            await authService.logout();
            router.push('/login');
          } else {
            setError(`Proje yüklenirken bir hata oluştu: ${err.message}`);
          }
        } else {
          setError('Proje yüklenirken beklenmeyen bir hata oluştu');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchProject();
  }, [projectId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Proje yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Hata!</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Proje bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600">{project.description}</p>
        )}
        <div className="mt-2 text-sm text-gray-500">
          <p>Durum: {project.status}</p>
          <p>Oluşturulma: {new Date(project.createdAt).toLocaleDateString('tr-TR')}</p>
          <p>Son Güncelleme: {new Date(project.updatedAt).toLocaleDateString('tr-TR')}</p>
        </div>
      </div>

      <div className="mt-8">
        <ContactTable projectId={project._id} />
      </div>
    </div>
  );
} 