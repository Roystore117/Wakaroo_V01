'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Wakarooロゴの文字配列
const LOGO_TEXT = 'Wakaroo'.split('');

// 文字ウェーブアニメーション
const letterVariants = {
    initial: { y: 0, opacity: 0 },
    animate: (i: number) => ({
        y: [0, -12, 0],
        opacity: 1,
        transition: {
            y: {
                duration: 0.4,
                repeat: 1,
                delay: i * 0.05,
                ease: 'easeInOut' as const,
            },
            opacity: {
                duration: 0.2,
                delay: i * 0.05,
            },
        },
    }),
};

interface SplashScreenProps {
    onComplete?: () => void;
    duration?: number; // ミリ秒
}

export default function SplashScreen({ onComplete, duration = 2000 }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100"
                >
                    {/* ロゴ */}
                    <div className="flex items-center">
                        {LOGO_TEXT.map((letter, i) => (
                            <motion.span
                                key={i}
                                custom={i}
                                variants={letterVariants}
                                initial="initial"
                                animate="animate"
                                className="text-5xl font-bold text-orange-500"
                                style={{
                                    display: 'inline-block',
                                    textShadow: '0 2px 10px rgba(251, 146, 60, 0.3)',
                                }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>

                    {/* サブテキスト */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="mt-4 text-sm text-orange-400 font-medium"
                    >
                        親子で楽しむ学習アプリ
                    </motion.p>

                    {/* ローディングドット */}
                    <div className="mt-8 flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.4, 1, 0.4],
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                }}
                                className="w-2.5 h-2.5 rounded-full bg-orange-300"
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
