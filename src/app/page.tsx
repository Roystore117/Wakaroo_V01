'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TagSection from '@/components/TagSection';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Category, worryTags, getPostsByWorryTag } from '@/data/mockData';

// カテゴリの順序
const categoryOrder: Category[] = ['baby', 'infant', 'low', 'high'];

// スライドアニメーションのvariants
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? '-100%' : '100%',
        opacity: 0,
    }),
};

export default function Home() {
    const [activeCategory, setActiveCategory] = useState<Category>('baby');
    const [direction, setDirection] = useState<number>(0);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    // カテゴリ変更（方向も設定）
    const handleCategoryChange = useCallback((category: Category) => {
        const currentIndex = categoryOrder.indexOf(activeCategory);
        const newIndex = categoryOrder.indexOf(category);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveCategory(category);
    }, [activeCategory]);

    // スワイプで次/前のカテゴリへ移動
    const handleSwipe = useCallback(() => {
        const diff = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50; // 最小スワイプ距離

        if (Math.abs(diff) < minSwipeDistance) return;

        const currentIndex = categoryOrder.indexOf(activeCategory);

        if (diff > 0) {
            // 左スワイプ → 次のカテゴリ
            if (currentIndex < categoryOrder.length - 1) {
                setDirection(1);
                setActiveCategory(categoryOrder[currentIndex + 1]);
            }
        } else {
            // 右スワイプ → 前のカテゴリ
            if (currentIndex > 0) {
                setDirection(-1);
                setActiveCategory(categoryOrder[currentIndex - 1]);
            }
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
                <div className="min-h-[60vh] overflow-hidden">
                    {/* セクション見出し */}
                    <div className="px-4 pt-5 pb-3">
                        <h2 className="text-base font-bold text-gray-800 drop-shadow-sm">
                            悩み別おすすめアプリ
                        </h2>
                    </div>

                    {/* タグセクションリスト（スライドアニメーション付き） */}
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={activeCategory}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="pb-8"
                        >
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
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <FloatingActionButton />
            <BottomNav />
        </div>
    );
}
