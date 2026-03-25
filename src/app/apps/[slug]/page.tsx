'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DetailView from '@/components/DetailView';
import { fetchAppById, fetchAppBySlug, Post } from '@/lib/supabase';

export default function AppDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    let data = await fetchAppById(slug);
    if (!data) data = await fetchAppBySlug(slug);
    setPost(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">アプリが見つかりませんでした</div>
      </div>
    );
  }

  return <DetailView post={post} onReload={load} />;
}
