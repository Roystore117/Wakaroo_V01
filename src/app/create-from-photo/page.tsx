'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Camera, ImagePlus, RotateCcw } from 'lucide-react';

type StudyMode = 'repeat' | 'mock' | null;

export default function CreateFromPhotoPage() {
    const router = useRouter();
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [studyMode, setStudyMode] = useState<StudyMode>(null);
    const [prompt, setPrompt] = useState('');

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => setPhotoPreview(event.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        setPhotoPreview(null);
        setStudyMode(null);
        setPrompt('');
    };

    const isReady = photoPreview && studyMode;

    return (
        <div className="h-dvh flex flex-col overflow-hidden" style={{ height: '100dvh', backgroundColor: '#F6ECE3' }}>

            {/* ヘッダー */}
            <header className="flex items-center justify-between px-4 py-3 flex-shrink-0 z-10">
                <button
                    onClick={() => router.back()}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-gray-700"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="text-sm font-bold text-gray-700">プリントからアプリを作る</h1>
                {photoPreview ? (
                    <button
                        onClick={handleReset}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-gray-700"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                ) : (
                    <div className="w-9" />
                )}
            </header>

            <AnimatePresence mode="wait">
                {!photoPreview ? (
                    /* ── 写真未選択：撮影 or ギャラリー選択 ── */
                    <motion.div
                        key="select"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center gap-6 px-8"
                    >
                        <div className="text-6xl mb-2">📷</div>
                        <p className="text-gray-700 font-bold text-lg text-center">
                            テストプリントから学習アプリをつくろう！
                        </p>

                        {/* 隠しinput */}
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoSelect}
                            className="hidden"
                        />
                        <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoSelect}
                            className="hidden"
                        />

                        <div className="w-full flex flex-col gap-3">
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                            >
                                <Camera className="w-5 h-5" />
                                カメラで撮影する
                            </button>
                            <button
                                onClick={() => galleryInputRef.current?.click()}
                                className="w-full py-4 rounded-2xl bg-black/10 text-gray-700 font-medium flex items-center justify-center gap-2"
                            >
                                <ImagePlus className="w-5 h-5" />
                                ギャラリーから選ぶ
                            </button>
                        </div>
                    </motion.div>

                ) : (
                    /* ── 写真選択済み：上半分=写真 / 下半分=設定 ── */
                    <motion.div
                        key="configure"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        {/* 上半分：写真プレビュー */}
                        <div className="flex-1 relative overflow-hidden">
                            <img
                                src={photoPreview}
                                alt="撮影したプリント"
                                className="w-full h-full object-contain bg-black"
                            />
                        </div>

                        {/* 下半分：設定エリア */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
                            className="flex-shrink-0 bg-gray-900 rounded-t-3xl px-5 pt-5 pb-6 flex flex-col gap-4"
                        >
                            {/* モード選択 */}
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-2">アプリの種類</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStudyMode('repeat')}
                                        className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                                            studyMode === 'repeat'
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                                : 'bg-white/10 text-gray-300'
                                        }`}
                                    >
                                        🔁 反復練習
                                    </button>
                                    <button
                                        onClick={() => setStudyMode('mock')}
                                        className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                                            studyMode === 'mock'
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                                : 'bg-white/10 text-gray-300'
                                        }`}
                                    >
                                        📝 模擬テスト
                                    </button>
                                </div>
                            </div>

                            {/* 自由プロンプト */}
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-2">
                                    追加の指示（任意）
                                </p>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="例：小学2年生向けに簡単にして"
                                    rows={2}
                                    className="w-full px-4 py-3 text-sm text-white bg-white/10 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                />
                            </div>

                            {/* 生成ボタン */}
                            <button
                                disabled={!isReady}
                                className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                                    isReady
                                        ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg shadow-orange-500/30'
                                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                ✨ アプリを生成する
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
