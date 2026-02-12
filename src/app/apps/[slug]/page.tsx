import { notFound } from 'next/navigation';
import DetailView from '@/components/DetailView';
import { fetchAppById, fetchAppBySlug } from '@/lib/supabase';

interface AppDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;

  // まずIDで検索、見つからなければスラッグで検索
  let post = await fetchAppById(slug);
  if (!post) {
    post = await fetchAppBySlug(slug);
  }

  if (!post) {
    notFound();
  }

  return <DetailView post={post} />;
}
