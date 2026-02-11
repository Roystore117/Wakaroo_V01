'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, Send, Lightbulb, Star } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

// ダミーの「あるある」データ
interface AruaruPost {
    id: string;
    text: string;
    wakaruCount: number;
    createdAt: string;
}

const initialPosts: AruaruPost[] = [
    {
        id: '1',
        text: '気合入れて作った離乳食、一口も食べてくれなくて宙を舞いました（白目）😇',
        wakaruCount: 124,
        createdAt: '2時間前',
    },
    {
        id: '2',
        text: '渾身のハンバーグ、一口も食べずに遊びの道具へ変身！これが今日の修行です💪',
        wakaruCount: 89,
        createdAt: '5時間前',
    },
    {
        id: '3',
        text: '早く寝て自分の時間が欲しいのに、寝かしつけ3時間コース確定！もう寝たふりのプロになれそう😂',
        wakaruCount: 56,
        createdAt: '昨日',
    },
];

// キラキラパーティクル（拡張版）
interface Sparkle {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    delay: number;
}

const sparkleColors = ['#F97316', '#FBBF24', '#FB923C', '#FCD34D', '#F59E0B'];

function SparkleEffect({ sparkles }: { sparkles: Sparkle[] }) {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    initial={{
                        x: sparkle.x,
                        y: sparkle.y,
                        scale: 0,
                        opacity: 1,
                        rotate: 0,
                    }}
                    animate={{
                        y: sparkle.y - 80,
                        x: sparkle.x + (Math.random() - 0.5) * 40,
                        scale: [0, 1.2, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 1,
                        delay: sparkle.delay,
                        ease: 'easeOut',
                    }}
                    className="absolute"
                >
                    {sparkle.size > 0.5 ? (
                        <Sparkles
                            className="text-amber-400"
                            style={{
                                width: `${16 + sparkle.size * 8}px`,
                                height: `${16 + sparkle.size * 8}px`,
                                color: sparkle.color,
                            }}
                        />
                    ) : (
                        <Star
                            className="fill-current"
                            style={{
                                width: `${12 + sparkle.size * 6}px`,
                                height: `${12 + sparkle.size * 6}px`,
                                color: sparkle.color,
                            }}
                        />
                    )}
                </motion.div>
            ))}
        </div>
    );
}

// あるあるカードコンポーネント
function AruaruCard({
    post,
    onWakaru,
    onSolve,
}: {
    post: AruaruPost;
    onWakaru: (id: string, e: React.MouseEvent) => void;
    onSolve: (id: string) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 shadow-sm border border-orange-100 relative"
        >
            {/* あるあるテキスト */}
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {post.text}
            </p>

            {/* メタ情報 */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{post.createdAt}</span>

                {/* わかるー！ボタン */}
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={(e) => onWakaru(post.id, e)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs font-bold rounded-full shadow-lg shadow-orange-200 hover:shadow-xl transition-shadow"
                >
                    <motion.span
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                        👋
                    </motion.span>
                    <span>わかるー！</span>
                    <span className="bg-white/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {post.wakaruCount}
                    </span>
                </motion.button>
            </div>

            {/* 解決ボタン */}
            <button
                onClick={() => onSolve(post.id)}
                className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs text-orange-600 bg-white/60 rounded-xl hover:bg-white transition-colors border border-orange-100"
            >
                <Lightbulb className="w-3.5 h-3.5" />
                この悩みを解決するアプリを作る / 教える
            </button>
        </motion.div>
    );
}

export default function CommunityPage() {
    const [posts, setPosts] = useState<AruaruPost[]>(initialPosts);
    const [newPost, setNewPost] = useState('');
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    // わかるー！ボタンのハンドラ
    const handleWakaru = (id: string, e: React.MouseEvent) => {
        // カウントアップ
        setPosts((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, wakaruCount: p.wakaruCount + 1 } : p
            )
        );

        // キラキラエフェクト（拡張版：12個、ランダムサイズ・色・遅延）
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const newSparkles: Sparkle[] = Array.from({ length: 12 }, (_, i) => ({
            id: Date.now() + i,
            x: centerX + (Math.random() - 0.5) * 60,
            y: centerY + (Math.random() - 0.5) * 20,
            size: Math.random(),
            color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
            delay: Math.random() * 0.2,
        }));
        setSparkles((prev) => [...prev, ...newSparkles]);

        // 一定時間後にキラキラを削除
        setTimeout(() => {
            setSparkles((prev) =>
                prev.filter((s) => !newSparkles.find((ns) => ns.id === s.id))
            );
        }, 1500);
    };

    // 解決ボタンのハンドラ
    const handleSolve = (id: string) => {
        const post = posts.find((p) => p.id === id);
        console.log('この悩みを解決するアプリを作る / 教える:', post?.text);
    };

    // 投稿のハンドラ
    const handleSubmitPost = () => {
        if (!newPost.trim()) return;

        const newPostObj: AruaruPost = {
            id: Date.now().toString(),
            text: newPost.trim(),
            wakaruCount: 0,
            createdAt: 'たった今',
        };

        setPosts((prev) => [newPostObj, ...prev]);
        setNewPost('');
        console.log('あるあるを投稿:', newPost);
    };

    return (
        <div className="min-h-screen bg-orange-50">
            {/* キラキラエフェクト（固定位置） */}
            <SparkleEffect sparkles={sparkles} />

            {/* ヘッダー */}
            <div className="bg-white border-b border-gray-100 px-4 py-4">
                <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5 text-orange-500" />
                    <h1 className="text-lg font-bold text-gray-700">
                        イドバタ掲示板
                    </h1>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                    育児あるあるをシェアしよう
                </p>
            </div>

            {/* メインコンテンツ */}
            <main className="pb-28 px-4 pt-4">
                {/* 投稿フォーム */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 mb-5"
                >
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                        今日の「わかるー！」な出来事
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="今日の『わかるー！』な出来事を教えて！"
                            className="flex-1 px-4 py-3 text-sm text-gray-700 bg-yellow-50 border border-orange-100 rounded-xl focus:outline-none focus:border-orange-400 placeholder-gray-400"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmitPost();
                                }
                            }}
                        />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmitPost}
                            disabled={!newPost.trim()}
                            className="px-4 py-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* セクション見出し */}
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-bold text-gray-700">
                        みんなのあるある
                    </h2>
                    <span className="text-xs text-gray-400">
                        {posts.length}件
                    </span>
                </div>

                {/* あるあるカードリスト */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {posts.map((post) => (
                            <AruaruCard
                                key={post.id}
                                post={post}
                                onWakaru={handleWakaru}
                                onSolve={handleSolve}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
