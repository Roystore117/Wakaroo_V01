import { notFound } from 'next/navigation';
import DetailView from '@/components/DetailView';
import { getPostByAppSlug } from '@/data/mockData';

interface AppDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const post = getPostByAppSlug(slug);

  if (!post) {
    notFound();
  }

  return <DetailView post={post} />;
}
