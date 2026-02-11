'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Wakarooロゴの文字配列
const LOGO_TEXT = 'Wakaroo'.split('');

// 文字ウェーブアニメーション
const letterVariants = {
    initial: { y: 0 },
    animate: (i: number) => ({
        y: [0, -20, 0],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 1.4,
            delay: i * 0.1,
            ease: 'easeInOut' as const,
        },
    }),
};

// ローディングオーバーレイコンポーネント
function LoadingOverlay() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-orange-50"
        >
            {/* Wakarooロゴ（ウェーブアニメーション） */}
            <div className="flex items-center">
                {LOGO_TEXT.map((letter, i) => (
                    <motion.span
                        key={i}
                        custom={i}
                        variants={letterVariants}
                        initial="initial"
                        animate="animate"
                        className="text-4xl font-bold text-orange-500"
                        style={{ display: 'inline-block' }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </div>

            {/* サブテキスト */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-sm text-gray-500"
            >
                アプリを準備中...
            </motion.p>

            {/* ローディングドット */}
            <div className="mt-6 flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                        }}
                        className="w-3 h-3 rounded-full bg-orange-300"
                    />
                ))}
            </div>
        </motion.div>
    );
}

function PlayContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const url = searchParams.get('url');

    const [isLoading, setIsLoading] = useState(true);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [timerCompleted, setTimerCompleted] = useState(false);

    // 最低2000msのタイマー
    useEffect(() => {
        const timer = setTimeout(() => {
            setTimerCompleted(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // iframe読み込み完了 AND タイマー完了でローディング終了
    useEffect(() => {
        if (iframeLoaded && timerCompleted) {
            setIsLoading(false);
        }
    }, [iframeLoaded, timerCompleted]);

    const handleIframeLoad = useCallback(() => {
        setIframeLoaded(true);
    }, []);

    const handleClose = () => {
        router.push('/');
    };

    if (!url) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-orange-50">
                <p className="text-gray-500">URLが指定されていません</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative">
            {/* ローディングオーバーレイ */}
            <AnimatePresence>
                {isLoading && <LoadingOverlay />}
            </AnimatePresence>

            {/* 閉じるボタン */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ delay: 0.3 }}
                onClick={handleClose}
                className="absolute top-4 left-4 z-40 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white px-3 py-2 rounded-full shadow-lg backdrop-blur-sm transition-colors"
            >
                <X className="w-5 h-5" />
                <span className="text-sm font-medium">閉じる</span>
            </motion.button>

            {/* iframe（常に読み込み開始、ローディング中は非表示） */}
            <iframe
                src={url}
                onLoad={handleIframeLoad}
                className={`h-full w-full border-0 transition-opacity duration-500 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}

export default function PlayPage() {
    return (
        <Suspense fallback={<LoadingOverlay />}>
            <PlayContent />
        </Suspense>
    );
}
