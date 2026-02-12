'use client';

import { Post, WorryTag, Category } from '@/lib/supabase';
import { categories } from '@/data/mockData';
import HorizontalAppCard from './HorizontalAppCard';

interface TagSectionProps {
    tag: WorryTag;
    posts: Post[];
    activeCategory: Category;
    onTagClick?: (tag: WorryTag) => void;
}

export default function TagSection({ tag, posts, activeCategory, onTagClick }: TagSectionProps) {
    if (posts.length === 0) return null;

    // タグラベルから # と本文を分離
    const tagText = tag.label.startsWith('#') ? tag.label.slice(1) : tag.label;

    // アクティブカテゴリの設定を取得
    const categoryConfig = categories.find(c => c.id === activeCategory);
    const bgClass = categoryConfig?.bgClass ?? 'bg-orange-500';

    const handleTagClick = () => {
        if (onTagClick) {
            onTagClick(tag);
        }
    };

    return (
        <section className="mb-6">
            {/* タグ見出し（カテゴリ色のカプセル、左詰め） */}
            <div className="px-4 mb-3">
                <button
                    onClick={handleTagClick}
                    className={`inline-flex items-center ${bgClass} text-white text-xs font-bold pl-2.5 pr-3 py-1.5 rounded-full shadow-sm hover:opacity-90 active:scale-95 transition-all`}
                >
                    <span className="opacity-60 mr-0.5">#</span>
                    <span>{tagText}</span>
                </button>
            </div>

            {/* アプリカードリスト */}
            <div className="px-4 space-y-3">
                {posts.map((post) => (
                    <HorizontalAppCard
                        key={post.id}
                        post={post}
                        categoryLabel={tag.category_label}
                    />
                ))}
            </div>
        </section>
    );
}
