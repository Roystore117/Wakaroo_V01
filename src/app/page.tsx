'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TagSection from '@/components/TagSection';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Category, worryTags, getPostsByWorryTag } from '@/data/mockData';

export default function Home() {
    const [activeCategory, setActiveCategory] = useState<Category>('baby');

    const handleCategoryChange = useCallback((category: Category) => {
        setActiveCategory(category);
    }, []);

    // カテゴリに応じた悩みタグをフィルタリング
    const getTagsForCategory = (category: Category) => {
        const categoryTagMap: Record<Category, string[]> = {
            'baby': ['wt1', 'wt4', 'wt3'],      // ベビー：5分で終わる、夜泣き、歯磨き嫌い
            'infant': ['wt2', 'wt5', 'wt6'],    // 幼児：時計読めない、ひらがな、数字
            'low': ['wt2', 'wt5', 'wt6'],       // 低学年：時計読めない、ひらがな、数字
            'high': ['wt6', 'wt1', 'wt2'],      // 高学年：数字、5分で終わる、時計
        };
        return categoryTagMap[category] || [];
    };

    const activeTagIds = getTagsForCategory(activeCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

            <main className="pb-24">
                {/* ヒーローセクション */}
                <HeroSection />

                {/* リストエリア（背景画像付き） */}
                <div
                    className="bg-[url('/images/bg-main.png')] bg-cover bg-fixed bg-center min-h-[60vh]"
                >
                    {/* セクション見出し */}
                    <div className="px-4 pt-5 pb-3">
                        <h2 className="text-base font-bold text-gray-800 drop-shadow-sm">
                            悩み別おすすめアプリ
                        </h2>
                    </div>

                    {/* タグセクションリスト */}
                    <div className="pb-8">
                        {activeTagIds.map((tagId) => {
                            const tag = worryTags.find((t) => t.id === tagId);
                            if (!tag) return null;

                            const posts = getPostsByWorryTag(tagId);

                            return (
                                <TagSection
                                    key={tagId}
                                    tag={tag}
                                    posts={posts.slice(0, 2)}
                                    activeCategory={activeCategory}
                                />
                            );
                        })}
                    </div>
                </div>
            </main>

            <FloatingActionButton />
            <BottomNav />
        </div>
    );
}
