'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, Send, Lightbulb } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

// ダミーの悩みデータ
interface Worry {
    id: string;
    text: string;
    wakaruCount: number;
    createdAt: string;
}

const initialWorries: Worry[] = [
    {
        id: '1',
        text: '寝かしつけに毎晩3時間かかる…もう限界',
        wakaruCount: 124,
        createdAt: '2時間前',
    },
    {
        id: '2',
        text: '離乳食を全然食べてくれない。作っても捨てるの繰り返し',
        wakaruCount: 89,
        createdAt: '5時間前',
    },
    {
        id: '3',
        text: '時計の読み方を何度教えても覚えてくれない',
        wakaruCount: 67,
        createdAt: '昨日',
    },
];

// キラキラパーティクル
interface Sparkle {
    id: number;
    x: number;
    y: number;
}

function SparkleEffect({ sparkles }: { sparkles: Sparkle[] }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    initial={{
                        x: sparkle.x,
                        y: sparkle.y,
                        scale: 0,
                        opacity: 1,
                    }}
                    animate={{
                        y: sparkle.y - 50,
                        scale: [0, 1, 0],
                        opacity: [1, 1, 0],
                    }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                    }}
                    className="absolute"
                >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
            ))}
        </div>
    );
}

// 悩みカードコンポーネント
function WorryCard({
    worry,
    onWakaru,
    onSolve,
}: {
    worry: Worry;
    onWakaru: (id: string, e: React.MouseEvent) => void;
    onSolve: (id: string) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 relative"
        >
            {/* 悩みテキスト */}
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {worry.text}
            </p>

            {/* メタ情報 */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{worry.createdAt}</span>

                {/* わかるー！ボタン */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => onWakaru(worry.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs font-bold rounded-full shadow-md"
                >
                    <span>わかるー！</span>
                    <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                        {worry.wakaruCount}
                    </span>
                </motion.button>
            </div>

            {/* 解決ボタン */}
            <button
                onClick={() => onSolve(worry.id)}
                className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs text-orange-500 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
            >
                <Lightbulb className="w-3.5 h-3.5" />
                この悩みを解決するアプリを作る / 教える
            </button>
        </motion.div>
    );
}

export default function CommunityPage() {
    const [worries, setWorries] = useState<Worry[]>(initialWorries);
    const [newWorry, setNewWorry] = useState('');
    const [sparkles, setSparkles] = useState<Sparkle[]>([]);

    // わかるー！ボタンのハンドラ
    const handleWakaru = (id: string, e: React.MouseEvent) => {
        // カウントアップ
        setWorries((prev) =>
            prev.map((w) =>
                w.id === id ? { ...w, wakaruCount: w.wakaruCount + 1 } : w
            )
        );

        // キラキラエフェクト
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const newSparkles: Sparkle[] = Array.from({ length: 5 }, (_, i) => ({
            id: Date.now() + i,
            x: rect.left + Math.random() * rect.width,
            y: rect.top + Math.random() * 20,
        }));
        setSparkles((prev) => [...prev, ...newSparkles]);

        // 一定時間後にキラキラを削除
        setTimeout(() => {
            setSparkles((prev) =>
                prev.filter((s) => !newSparkles.find((ns) => ns.id === s.id))
            );
        }, 1000);
    };

    // 解決ボタンのハンドラ
    const handleSolve = (id: string) => {
        const worry = worries.find((w) => w.id === id);
        console.log('この悩みを解決するアプリを作る / 教える:', worry?.text);
    };

    // 悩み投稿のハンドラ
    const handleSubmitWorry = () => {
        if (!newWorry.trim()) return;

        const newWorryObj: Worry = {
            id: Date.now().toString(),
            text: newWorry.trim(),
            wakaruCount: 0,
            createdAt: 'たった今',
        };

        setWorries((prev) => [newWorryObj, ...prev]);
        setNewWorry('');
        console.log('悩みを投稿:', newWorry);
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
                    子育ての悩み、ここで吐き出そう
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
                        今困っていること
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newWorry}
                            onChange={(e) => setNewWorry(e.target.value)}
                            placeholder="ここに悩みを書いてね..."
                            className="flex-1 px-4 py-3 text-sm text-gray-700 bg-orange-50 border border-orange-100 rounded-xl focus:outline-none focus:border-orange-400 placeholder-gray-400"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSubmitWorry();
                                }
                            }}
                        />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmitWorry}
                            disabled={!newWorry.trim()}
                            className="px-4 py-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* セクション見出し */}
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-bold text-gray-700">
                        みんなの悩み
                    </h2>
                    <span className="text-xs text-gray-400">
                        {worries.length}件
                    </span>
                </div>

                {/* 悩みカードリスト */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {worries.map((worry) => (
                            <WorryCard
                                key={worry.id}
                                worry={worry}
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
