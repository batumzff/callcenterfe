import { Suspense } from 'react';
import ProjectDetail from './ProjectDetail';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Proje yükleniyor...</p>
        </div>
      </div>
    }>
      <ProjectDetail projectId={params.id} />
    </Suspense>
  );
} 