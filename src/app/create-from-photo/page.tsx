'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ImagePlus, RotateCcw, Sparkles, Upload, Wifi, Battery, Signal } from 'lucide-react';
import PostAppModal from '@/components/PostAppModal';

type StudyMode = 'repeat' | 'mock' | null;

const USAGE_DELIMITER = '\x00WAKAROO_USAGE\x00';

function extractHtml(text: string): string {
    const fenced = text.match(/```html\s*([\s\S]*?)```/);
    if (fenced) return fenced[1].trim();
    const doctypeIdx = text.indexOf('<!DOCTYPE html>');
    if (doctypeIdx !== -1) return text.slice(doctypeIdx).trim();
    const htmlIdx = text.indexOf('<html');
    if (htmlIdx !== -1) return text.slice(htmlIdx).trim();
    return text.trim();
}

function TerminalView({ text }: { text: string }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }, [text]);

    return (
        <div className="w-full h-full bg-black overflow-y-auto p-2 font-mono">
            <div className="flex items-center gap-1.5 mb-2 sticky top-0 bg-black py-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-500 text-[9px] ml-1">AI Generator</span>
            </div>
            <pre className="text-green-400 text-[9px] leading-relaxed whitespace-pre-wrap break-all">
                {text}
                <span className="animate-pulse text-green-300">▌</span>
            </pre>
            <div ref={bottomRef} />
        </div>
    );
}

export default function CreateFromPhotoPage() {
    const router = useRouter();

    // Step 1: 設定フォーム
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [studyMode, setStudyMode] = useState<StudyMode>(null);
    const [prompt, setPrompt] = useState('');

    // Step 2: 生成フロー
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    const [currentHtml, setCurrentHtml] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    // フォン mockup スケール
    const iframeContainerRef = useRef<HTMLDivElement>(null);
    const [iframeScale, setIframeScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState(600);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const el = iframeContainerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setIframeScale(width / 375);
            setContainerHeight(height);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

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
        setCurrentHtml('');
        setStreamingText('');
        setError(null);
    };

    const isReady = !!photoPreview && !!studyMode;
    const isGenerating = isStreaming || !!currentHtml || !!error;

    // 画像を最大1024pxにリサイズしてJPEG圧縮する
    const resizeImage = (dataUrl: string): Promise<{ base64: string; mimeType: string }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const MAX = 1024;
                const scale = Math.min(1, MAX / Math.max(img.width, img.height));
                const w = Math.round(img.width * scale);
                const h = Math.round(img.height * scale);
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.85);
                const base64 = compressed.split(',')[1];
                resolve({ base64, mimeType: 'image/jpeg' });
            };
            img.src = dataUrl;
        });
    };

    const handleGenerate = async () => {
        if (!photoPreview || !studyMode) return;

        setIsStreaming(true);
        setStreamingText('');
        setCurrentHtml('');
        setError(null);

        let accumulated = '';

        try {
            // 画像を圧縮してからAPIに送る（大きい写真でもハングしないように）
            const { base64: photoBase64, mimeType } = await resizeImage(photoPreview);

            const res = await fetch('/api/generate-from-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ photoBase64, mimeType, studyMode, prompt }),
            });

            if (!res.ok || !res.body) {
                setError(`通信エラーが発生しました (${res.status})`);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                accumulated += decoder.decode(value, { stream: true });

                const delimIdx = accumulated.indexOf(USAGE_DELIMITER);
                if (delimIdx !== -1) {
                    accumulated = accumulated.slice(0, delimIdx);
                    setStreamingText(accumulated);
                    break;
                }

                setStreamingText(accumulated);
            }

            setCurrentHtml(extractHtml(accumulated));
        } catch {
            setError('通信エラーが発生しました');
        } finally {
            setIsStreaming(false);
        }
    };

    // 生成後の画面
    if (isGenerating) {
        return (
            <>
                <PostAppModal
                    isOpen={isPostModalOpen}
                    onClose={() => setIsPostModalOpen(false)}
                    initialHtmlCode={currentHtml}
                    initialCategory="test"
                />
                <div className="flex flex-col h-[100dvh] bg-gray-200">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-1 text-gray-500 active:text-gray-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                            <span className="text-sm">やり直す</span>
                        </button>
                        <button
                            disabled={!currentHtml || isStreaming}
                            onClick={() => setIsPostModalOpen(true)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-bold shadow active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Upload className="w-4 h-4" />
                            投稿する
                        </button>
                    </div>

                    {/* スマホモックアップ */}
                    <div
                        className="flex-1 min-h-0 flex items-center justify-center py-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('/images/bg-main.png')" }}
                    >
                        <div className="h-[97%] max-h-full aspect-[9/16] bg-black border-[12px] border-black rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
                            {/* ステータスバー */}
                            <div className="absolute top-0 left-0 right-0 h-5 bg-white z-10 flex items-center px-3">
                                <span className="text-[10px] font-bold text-black">12:34</span>
                                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-5 bg-black rounded-b-2xl flex items-center justify-center">
                                    <div className="w-8 h-1.5 bg-gray-700 rounded-full" />
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    <Signal className="w-3 h-3 text-black" />
                                    <Wifi className="w-3 h-3 text-black" />
                                    <Battery className="w-3.5 h-3.5 text-black" />
                                </div>
                            </div>
                            {/* コンテンツ */}
                            <div ref={iframeContainerRef} className="flex-1 min-h-0 mt-5 relative overflow-hidden">
                                {isStreaming ? (
                                    <>
                                        <TerminalView text={streamingText} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
                                            <div className="relative w-24 h-24">
                                                <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-orange-300 animate-spin" style={{ animationDuration: '3s' }} />
                                                <div className="absolute inset-2 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" style={{ animationDuration: '0.75s' }} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-11 h-11 bg-orange-50 rounded-full animate-pulse shadow-inner" />
                                                </div>
                                                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow" />
                                                </div>
                                                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.67s' }}>
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-orange-400 rounded-full shadow" />
                                                </div>
                                                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '1.33s' }}>
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-pink-400 rounded-full shadow" />
                                                </div>
                                            </div>
                                            <p className="text-orange-500 text-sm font-bold animate-bounce tracking-wide drop-shadow-sm">アプリ開発中...</p>
                                        </div>
                                    </>
                                ) : currentHtml ? (
                                    <iframe
                                        srcDoc={currentHtml}
                                        sandbox="allow-scripts"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '375px',
                                            height: `${containerHeight / iframeScale}px`,
                                            border: 'none',
                                            transformOrigin: 'top left',
                                            transform: `scale(${iframeScale})`,
                                        }}
                                        title="生成プレビュー"
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* エラー表示 */}
                    {error && (
                        <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2 shrink-0">
                            {error}
                        </div>
                    )}
                </div>
            </>
        );
    }

    // Step 1: 設定フォーム
    return (
        <div className="fixed inset-0 z-[100] bg-orange-50 flex flex-col">

            {/* ヘッダー */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                >
                    <X className="w-5 h-5" />
                    <span className="text-sm">キャンセル</span>
                </button>
                <h1 className="text-base font-bold text-gray-700">プリントからアプリを作る</h1>
                <div className="w-20" />
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

                {/* 1. 写真 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                        プリントの写真
                    </label>

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

                    <AnimatePresence mode="wait">
                        {!photoPreview ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col gap-3"
                            >
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                                >
                                    <Camera className="w-5 h-5" />
                                    カメラで撮影する
                                </button>
                                <button
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="w-full py-3 rounded-2xl bg-white border-2 border-orange-100 text-gray-600 font-medium flex items-center justify-center gap-2"
                                >
                                    <ImagePlus className="w-5 h-5" />
                                    ギャラリーから選ぶ
                                </button>
                                <p className="text-xs text-gray-400 text-center pt-1">
                                    テストプリントから学習アプリをつくろう！
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative"
                            >
                                <img
                                    src={photoPreview}
                                    alt="撮影したプリント"
                                    className="w-full rounded-2xl object-cover max-h-64"
                                />
                                <button
                                    onClick={handleReset}
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. アプリの種類 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                        アプリの種類
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStudyMode('repeat')}
                            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                                studyMode === 'repeat'
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200'
                            }`}
                        >
                            🔁 反復練習
                        </button>
                        <button
                            onClick={() => setStudyMode('mock')}
                            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                                studyMode === 'mock'
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200'
                            }`}
                        >
                            📝 模擬テスト
                        </button>
                    </div>
                </div>

                {/* 3. 追加の指示 */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                        追加の指示（任意）
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="例：小学2年生向けに簡単にして"
                        rows={3}
                        className="w-full px-4 py-3 text-sm text-gray-700 bg-white border-2 border-orange-100 rounded-2xl resize-none focus:outline-none focus:border-orange-400 placeholder-gray-400"
                    />
                </div>
            </div>

            {/* フッター */}
            <div className="px-4 py-4 bg-white border-t border-gray-100">
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={!isReady}
                    onClick={handleGenerate}
                    className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                        isReady
                            ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg shadow-orange-200'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <Sparkles className="w-5 h-5" />
                    アプリを生成する
                </motion.button>
            </div>
        </div>
    );
}
