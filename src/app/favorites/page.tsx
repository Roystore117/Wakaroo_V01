'use client';

import { motion } from 'framer-motion';
import { Heart, Home } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function FavoritesPage() {
    return (
        <div className="min-h-screen">
            {/* ヘッダー */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-4">
                <h1 className="text-lg font-bold text-gray-700 text-center">
                    お気に入り
                </h1>
            </div>

            {/* メインコンテンツ */}
            <main className="pb-24 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col items-center justify-center min-h-[60vh]"
                >
                    {/* ハートアイコン（アニメーション付き） */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="mb-6"
                    >
                        <div className="w-24 h-24 rounded-full bg-pink-100/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Heart className="w-12 h-12 text-pink-300" />
                        </div>
                    </motion.div>

                    {/* メッセージ */}
                    <h2 className="text-base font-bold text-gray-700 mb-2">
                        まだお気に入りはありません
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-6 max-w-xs">
                        気になるアプリを見つけて、
                        <br />
                        ハートをタップしてみてね！
                    </p>

                    {/* ホームへ戻るボタン */}
                    <Link href="/">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-200"
                        >
                            <Home className="w-4 h-4" />
                            アプリをさがしにいく
                        </motion.button>
                    </Link>
                </motion.div>
            </main>

            <BottomNav />
        </div>
    );
}
