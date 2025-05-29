import { Suspense } from 'react';
import ProjectDetail from './ProjectDetail';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

// This is a Server Component
export default async function ProjectPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Proje yükleniyor...</p>
        </div>
      </div>
    }>
      <ProjectDetail projectId={resolvedParams.id} />
    </Suspense>
  );
} 