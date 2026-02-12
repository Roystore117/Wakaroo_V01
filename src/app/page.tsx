'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TagSection from '@/components/TagSection';
import HorizontalAppCard from '@/components/HorizontalAppCard';
import BottomNav from '@/components/BottomNav';
import FloatingActionButton from '@/components/FloatingActionButton';
import PostAppModal from '@/components/PostAppModal';
import {
    Category,
    Post,
    WorryTag,
    HeroArticle,
    fetchAllApps,
    fetchWorryTags,
    fetchAppsByWorryTagId,
    fetchHeroArticles,
} from '@/lib/supabase';
// カテゴリ設定はmockDataから継続使用（UI用の静的データ）
import { categories } from '@/data/mockData';

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

    // Supabaseデータ用state
    const [apps, setApps] = useState<Post[]>([]);
    const [worryTags, setWorryTags] = useState<WorryTag[]>([]);
    const [heroArticle, setHeroArticle] = useState<HeroArticle | null>(null);
    const [filteredApps, setFilteredApps] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // データ読み込み関数
    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [appsData, tagsData, heroData] = await Promise.all([
                fetchAllApps(),
                fetchWorryTags(),
                fetchHeroArticles(),
            ]);

            setApps(appsData);
            setWorryTags(tagsData);
            setHeroArticle(heroData[0] || null); // 最初の1件を表示
        } catch (err) {
            console.error('Error loading data:', err);
            setError('データの読み込みに失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 初期データ読み込み
    useEffect(() => {
        loadData();
    }, [loadData]);

    // 投稿成功時にデータを再読み込み
    const handlePostSuccess = useCallback(() => {
        loadData();
    }, [loadData]);

    // タグでフィルタリングした際のデータ取得
    useEffect(() => {
        async function loadFilteredApps() {
            if (!selectedTag) {
                setFilteredApps([]);
                return;
            }

            try {
                const data = await fetchAppsByWorryTagId(selectedTag.id);
                setFilteredApps(data);
            } catch (err) {
                console.error('Error loading filtered apps:', err);
            }
        }

        loadFilteredApps();
    }, [selectedTag]);

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

    // Supabaseから取得したタグを使用（wt10は最後に）
    const getTagsForCategory = (): string[] => {
        const otherTag = worryTags.find(t => t.id === 'wt10');
        const regularTags = worryTags.filter(t => t.id !== 'wt10');
        // 通常タグ + その他（最後）
        return [...regularTags.map(t => t.id), ...(otherTag ? ['wt10'] : [])];
    };

    // タグIDに関連するアプリを取得（カテゴリ優先 + タグでグループ分け）
    const getPostsByWorryTag = (tagId: string): Post[] => {
        return apps.filter(app =>
            app.category === activeCategory &&
            app.worryTagIds?.includes(tagId)
        );
    };

    // 現在のカテゴリのアプリをすべて取得（タグなしも含む）
    const getAppsByCategory = (): Post[] => {
        return apps.filter(app => app.category === activeCategory);
    };

    const activeTagIds = getTagsForCategory();

    // ローディング表示
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    <p className="text-sm text-gray-500">読み込み中...</p>
                </div>
            </div>
        );
    }

    // エラー表示
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 px-4">
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg"
                    >
                        再読み込み
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />

            <main
                className="pb-24"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* ヒーローセクション */}
                <HeroSection article={heroArticle} />

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
                                {filteredApps.map((post) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <HorizontalAppCard
                                            post={post}
                                            categoryLabel={selectedTag.category_label}
                                        />
                                    </motion.div>
                                ))}
                                {filteredApps.length === 0 && (
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

                                {/* このカテゴリにアプリがない場合の表示 */}
                                {getAppsByCategory().length === 0 && (
                                    <div className="text-center py-12 text-gray-400">
                                        <p>このカテゴリにはまだアプリがありません</p>
                                    </div>
                                )}
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
                worryTagsData={worryTags}
                onSuccess={handlePostSuccess}
            />
        </div>
    );
}
