'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, Hand, Award, Quote, Sparkles } from 'lucide-react';
import { Post, categories } from '@/data/mockData';

interface DetailViewProps {
    post: Post;
}

// 数値をフォーマット（カンマ区切り）
const formatNumber = (num: number): string => {
    return num.toLocaleString();
};

// 画像URLかプレースホルダー文字かを判定
const isImageUrl = (value: string): boolean => {
    return value.startsWith('/') || value.startsWith('http');
};

// カテゴリ別のキャッチコピー
const catchphraseMap: Record<string, string> = {
    'baby': 'もう夜泣きで\n悩まなくていい。',
    'infant': 'もう朝、\n怒らなくていい。',
    'low': '勉強じゃない。\nあそびだ。',
    'high': '「できた！」が\n自信になる。',
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
    const categoryConfig = categories.find((c) => c.id === post.category);
    const catchphrase = catchphraseMap[post.category] || 'こどもの笑顔が\n増えますように。';
    const heroImage = heroImageMap[post.category] || heroImageMap['infant'];

    const playedCount = useMemo(() => post.meta.playedCount, [post.meta.playedCount]);
    const playUrl = `/play?url=${encodeURIComponent('https://clock-study-nu.vercel.app/')}`;

    // 開発者のタグ
    const developerTags = ['公認クリエイター', '#小1パパ', '#エンジニア'];

    return (
        <div className="min-h-screen bg-amber-50/30">
            {/* ヒーローエリア */}
            <motion.div
                layoutId={`hero-${post.id}`}
                className="relative h-[45vh] w-full"
            >
                {/* 背景画像 */}
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                >
                    {hasRealImage ? (
                        <img
                            src={post.thumbnailUrl}
                            alt={post.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <img
                            src={heroImage}
                            alt={post.title}
                            className="h-full w-full object-cover"
                        />
                    )}
                </motion.div>

                {/* グラデーションオーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* ヘッダー（戻るボタン） */}
                <header className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3">
                    <Link
                        href="/"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                </header>

                {/* キャッチコピー */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="absolute bottom-6 left-0 right-0 px-5"
                >
                    <h1
                        className="text-3xl font-bold text-white leading-tight whitespace-pre-line"
                        style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
                    >
                        {catchphrase}
                    </h1>
                    <p className="mt-2 text-white/90 text-sm font-medium">
                        {post.title}
                    </p>
                </motion.div>
            </motion.div>

            {/* メインコンテンツ */}
            <main className="px-4 pb-32 -mt-4 relative z-10">
                {/* 開発者プロフィールカード */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-white rounded-2xl p-5 shadow-lg border border-amber-100"
                >
                    <div className="flex items-start gap-4">
                        {/* アバター */}
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-2xl font-bold text-amber-700 shadow-md">
                                {post.author.name.charAt(0)}
                            </div>
                            {post.author.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1">
                                    <Award className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </div>

                        {/* 名前とタグ */}
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-800">
                                {post.author.name}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {post.author.role}
                            </p>

                            {/* タグバッジ */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {developerTags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                            index === 0
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 開発のきっかけ */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-5"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-bold text-gray-800">開発のきっかけ</h3>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200/50">
                        <div className="flex gap-3">
                            <Quote className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-lg font-bold text-amber-800 leading-relaxed">
                                    {post.story.title}
                                </p>
                                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                                    {post.story.content}
                                </p>

                                {/* ハイライト */}
                                <div className="mt-4 bg-white/70 rounded-xl p-4 border border-amber-200">
                                    <p className="text-sm font-bold text-amber-700">
                                        勉強じゃなく<span className="text-orange-500">「あそび」</span>にしたら、<br/>
                                        <span className="text-xl">3日で読めるように！</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* アプリの特徴 */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-5"
                >
                    <h3 className="text-base font-bold text-gray-800 mb-3">このアプリの特徴</h3>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {post.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600"
                                >
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.section>
            </main>

            {/* 固定フッター（アクションボタン） */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-4 pb-6"
            >
                <Link
                    href={playUrl}
                    className="block w-full"
                >
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                    >
                        <Play className="w-5 h-5 fill-white" />
                        このアプリであそぶ！
                    </motion.button>
                </Link>

                {/* ソーシャルプルーフ */}
                <div className="flex items-center justify-center gap-2 mt-3 text-gray-500">
                    <Hand className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">
                        <span className="font-bold text-gray-700">{formatNumber(playedCount)}人</span>
                        があそんだよ！
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
