'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TagSection from '@/components/TagSection';
import HorizontalAppCard from '@/components/HorizontalAppCard';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import PostAppModal from '@/components/PostAppModal';
import { Category, WorryTag, worryTags, getPostsByWorryTag, getAllPostsByWorryTagId } from '@/data/mockData';

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
    const [selectedTag, setSelectedTag] = useState<WorryTag | null>(null);
    const [showPostModal, setShowPostModal] = useState(false);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    // カテゴリ変更（方向も設定）
    const handleCategoryChange = useCallback((category: Category) => {
        // タグ選択中はカテゴリ変更時にタグ選択を解除
        if (selectedTag) {
            setSelectedTag(null);
        }
        const currentIndex = categoryOrder.indexOf(activeCategory);
        const newIndex = categoryOrder.indexOf(category);
        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveCategory(category);
    }, [activeCategory, selectedTag]);

    // タグクリック時のハンドラ
    const handleTagClick = useCallback((tag: WorryTag) => {
        setSelectedTag(tag);
    }, []);

    // タグフィルタ解除
    const handleClearTagFilter = useCallback(() => {
        setSelectedTag(null);
    }, []);

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
                        <AnimatePresence mode="wait">
                            {selectedTag ? (
                                <motion.div
                                    key="filter-header"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-bold text-gray-800">
                                            {selectedTag.label}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            の検索結果
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleClearTagFilter}
                                        className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-full transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>解除</span>
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.h2
                                    key="default-header"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-base font-bold text-gray-800 drop-shadow-sm"
                                >
                                    悩み別おすすめアプリ
                                </motion.h2>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* コンテンツエリア（通常モード / フィルタモード） */}
                    <AnimatePresence mode="wait" custom={direction}>
                        {selectedTag ? (
                            // フィルタモード：タグに関連する全てのアプリを表示
                            <motion.div
                                key={`filter-${selectedTag.id}`}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.25 }}
                                className="pb-8 px-4 space-y-3"
                            >
                                {getAllPostsByWorryTagId(selectedTag.id).map((post) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <HorizontalAppCard
                                            post={post}
                                            categoryLabel={selectedTag.categoryLabel}
                                        />
                                    </motion.div>
                                ))}
                                {getAllPostsByWorryTagId(selectedTag.id).length === 0 && (
                                    <div className="text-center py-12 text-gray-400">
                                        該当するアプリが見つかりませんでした
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            // 通常モード：タグセクションリスト（スライドアニメーション付き）
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
                                            onTagClick={handleTagClick}
                                        />
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <FloatingActionButton onClick={() => setShowPostModal(true)} />
            <BottomNav />

            {/* 投稿モーダル */}
            <PostAppModal
                isOpen={showPostModal}
                onClose={() => setShowPostModal(false)}
            />
        </div>
    );
}
