'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, Hand, BadgeCheck, Heart, Sparkles } from 'lucide-react';
import { Post } from '@/lib/supabase';

interface DetailViewProps {
    post: Post;
}

const formatNumber = (num: number): string => {
    return num.toLocaleString();
};

const isImageUrl = (value: string): boolean => {
    return value.startsWith('/') || value.startsWith('http');
};

// カテゴリ別のダミー画像
const heroImageMap: Record<string, string> = {
    'baby': 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
    'infant': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    'low': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    'high': 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80',
};

export default function DetailView({ post }: DetailViewProps) {
    const hasRealImage = isImageUrl(post.thumbnailUrl);
    const heroImage = heroImageMap[post.category] || heroImageMap['infant'];
    const playedCount = useMemo(() => post.meta.playedCount, [post.meta.playedCount]);
    // appUrlまたはhtmlCodeがある場合はプレイページへ
    const playUrl = post.appUrl
        ? `/play?url=${encodeURIComponent(post.appUrl)}`
        : post.htmlCode
            ? `/play/html/${post.id}`
            : null;

    return (
        <div className="min-h-screen bg-orange-50/30">
            {/* ヘッダー（透過） */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3">
                <Link
                    href="/"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-600 shadow-sm"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
            </header>

            {/* ヒーロー画像（フル幅） */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative h-80 w-full"
            >
                <img
                    src={hasRealImage ? post.thumbnailUrl : heroImage}
                    alt={post.title}
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-4 right-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="text-xl font-bold text-white leading-snug drop-shadow-lg"
                        style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                    >
                        {post.title}
                    </motion.h1>
                    <p className="text-sm text-white/90 mt-1 drop-shadow-md">
                        {post.description}
                    </p>
                </div>
            </motion.div>

            {/* メインコンテンツ */}
            <main className="px-4 pb-32 -mt-3 relative z-10">
                {/* 開発者プロフィールカード */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="bg-orange-50 rounded-2xl p-4 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center text-lg font-bold text-orange-600">
                                {post.author.name.charAt(0)}
                            </div>
                            {post.author.isVerified && (
                                <BadgeCheck className="absolute -bottom-0.5 -right-0.5 w-5 h-5 text-orange-500 fill-orange-100" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-700">
                                {post.author.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full font-medium">
                                    公認クリエイター
                                </span>
                                <span className="text-xs text-gray-500">
                                    {post.author.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 開発のきっかけ（手紙風） */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mt-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        <h2 className="text-sm font-bold text-orange-500">開発のきっかけ</h2>
                    </div>

                    <div className="bg-yellow-50 rounded-2xl p-5 border-2 border-yellow-200 border-dashed">
                        <p className="text-base font-bold text-gray-700 leading-relaxed">
                            {post.story.title}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed mt-3">
                            {post.story.content}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-orange-500">
                            <Heart className="w-4 h-4 fill-orange-200" />
                            <span className="text-xs font-medium">パパの想いを込めて作りました</span>
                        </div>
                    </div>
                </motion.section>

                {/* タグ */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="mt-5"
                >
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="text-xs text-orange-600 bg-orange-100 px-3 py-1.5 rounded-full font-medium"
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                </motion.section>

                {/* 利用者の声 */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="mt-6"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">💬</span>
                        <h2 className="text-sm font-bold text-orange-500">みんなの声</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                息子が3日で時計を読めるようになりました！勉強じゃなく遊びだから続けられたみたいです。
                            </p>
                            <p className="text-xs text-gray-400 mt-2">— 小1ママ</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                朝の支度で「あと5分」が伝わるようになって、怒る回数が減りました。
                            </p>
                            <p className="text-xs text-gray-400 mt-2">— 年長パパ</p>
                        </div>
                    </div>
                </motion.section>
            </main>

            {/* 固定フッター */}
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-orange-100 px-4 py-3 pb-6"
            >
                {playUrl ? (
                    <Link href={playUrl} className="block">
                        <button className="w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white text-base font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                            <Play className="w-5 h-5 fill-white" />
                            このアプリであそぶ！
                        </button>
                    </Link>
                ) : (
                    <button
                        disabled
                        className="w-full bg-gray-300 text-gray-500 text-base font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <Play className="w-5 h-5" />
                        URLが設定されていません
                    </button>
                )}
                <p className="text-center text-xs text-gray-500 mt-2 flex items-center justify-center gap-1.5">
                    <Hand className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-orange-500">{formatNumber(playedCount)}人</span>
                    があそんでいます
                </p>
            </motion.div>
        </div>
    );
}
