'use client';

import { Post } from '@/data/mockData';
import AppCard from './AppCard';

interface RankingSectionProps {
    posts: Post[];
}

export default function RankingSection({ posts }: RankingSectionProps) {
    return (
        <section className="px-3 py-3">
            <h2 className="mb-2 text-base font-bold text-gray-800">
                ランキング
            </h2>
            {/* おすすめアプリと同じグリッドレイアウト */}
            <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                    <AppCard key={post.id} post={post} variant="ranking" />
                ))}
            </div>
        </section>
    );
}
