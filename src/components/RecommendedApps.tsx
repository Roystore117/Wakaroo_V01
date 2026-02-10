'use client';

import { Post } from '@/data/mockData';
import AppCard from './AppCard';

interface RecommendedAppsProps {
    posts: Post[];
}

export default function RecommendedApps({ posts }: RecommendedAppsProps) {
    return (
        <section className="px-3 pb-24">
            <h2 className="mb-2 text-base font-bold text-gray-800">
                おすすめアプリ
            </h2>
            {/* gap-1 で密接表示 */}
            <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                    <AppCard key={post.id} post={post} variant="grid" />
                ))}
            </div>
        </section>
    );
}
