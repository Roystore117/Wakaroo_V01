'use client';

import { useState, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TagSection from '@/components/TagSection';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Category, worryTags, getPostsByWorryTag } from '@/data/mockData';

// カテゴリの順序
const categoryOrder: Category[] = ['baby', 'infant', 'low', 'high'];

export default function Home() {
    const [activeCategory, setActiveCategory] = useState<Category>('baby');
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    const handleCategoryChange = useCallback((category: Category) => {
        setActiveCategory(category);
    }, []);

    // スワイプで次/前のカテゴリへ移動
    const handleSwipe = useCallback(() => {
        const diff = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50; // 最小スワイプ距離

        if (Math.abs(diff) < minSwipeDistance) return;

        const currentIndex = categoryOrder.indexOf(activeCategory);

        if (diff > 0) {
            // 左スワイプ → 次のカテゴリ
            const nextIndex = Math.min(currentIndex + 1, categoryOrder.length - 1);
            setActiveCategory(categoryOrder[nextIndex]);
        } else {
            // 右スワイプ → 前のカテゴリ
            const prevIndex = Math.max(currentIndex - 1, 0);
            setActiveCategory(categoryOrder[prevIndex]);
        }
    }, [activeCategory]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].clientX;
        handleSwipe();
    };

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
        <div className="min-h-screen">
            {/* 固定背景レイヤー（モバイル対応） */}
            <div className="fixed inset-0 z-[-1]">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/images/bg-main.png')" }}
                />
            </div>

            <Header activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

            <main
                className="pb-24"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* ヒーローセクション */}
                <HeroSection />

                {/* リストエリア */}
                <div className="min-h-[60vh]">
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
