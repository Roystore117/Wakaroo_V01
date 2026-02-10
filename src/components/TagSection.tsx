'use client';

import { Post, WorryTag, Category, categories } from '@/data/mockData';
import HorizontalAppCard from './HorizontalAppCard';

interface TagSectionProps {
    tag: WorryTag;
    posts: Post[];
    activeCategory: Category;
}

export default function TagSection({ tag, posts, activeCategory }: TagSectionProps) {
    if (posts.length === 0) return null;

    // タグラベルから # と本文を分離
    const tagText = tag.label.startsWith('#') ? tag.label.slice(1) : tag.label;

    // アクティブカテゴリの設定を取得
    const categoryConfig = categories.find(c => c.id === activeCategory);
    const bgClass = categoryConfig?.bgClass ?? 'bg-orange-500';

    return (
        <section className="mb-6">
            {/* タグ見出し（カテゴリ色のカプセル、左詰め） */}
            <div className="px-4 mb-3">
                <span className={`inline-flex items-center ${bgClass} text-white text-xs font-bold pl-2.5 pr-3 py-1.5 rounded-full shadow-sm`}>
                    <span className="opacity-60 mr-0.5">#</span>
                    <span>{tagText}</span>
                </span>
            </div>

            {/* アプリカードリスト */}
            <div className="px-4 space-y-3">
                {posts.map((post) => (
                    <HorizontalAppCard
                        key={post.id}
                        post={post}
                        categoryLabel={tag.categoryLabel}
                    />
                ))}
            </div>
        </section>
    );
}
