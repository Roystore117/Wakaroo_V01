'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImagePlus, Send, Check } from 'lucide-react';
import { categories, worryTags } from '@/data/mockData';
import { Category, Post, updateApp, uploadThumbnail, uploadPdf } from '@/lib/supabase';
import { processImageForUpload } from '@/lib/imageProcessor';

interface EditAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    onSuccess?: () => void;
}

export default function EditAppModal({ isOpen, onClose, post, onSuccess }: EditAppModalProps) {
    // 初期inputMode判定
    const initialInputMode = (): 'url' | 'html' | 'pdf' => {
        if (post.htmlCode) return 'html';
        if (post.appUrl?.toLowerCase().endsWith('.pdf')) return 'pdf';
        return 'url';
    };

    // フォームstate（既存データで初期化）
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [title, setTitle] = useState(post.title);
    const [appUrl, setAppUrl] = useState(post.appUrl ?? '');
    const [htmlCode, setHtmlCode] = useState(post.htmlCode ?? '');
    const [inputMode, setInputMode] = useState<'url' | 'html' | 'pdf'>(initialInputMode());
    const [selectedCategory, setSelectedCategory] = useState<Category>(post.category);
    const [story, setStory] = useState(post.story?.content ?? '');
    const [selectedTags, setSelectedTags] = useState<string[]>(post.worryTagIds ?? []);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUploading, setPdfUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    // サムネイル選択
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onload = (event) => setThumbnailPreview(event.target?.result as string);
        reader.readAsDataURL(file);
    };

    // PDFファイル選択
    const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPdfFile(file);
        setPdfUploading(true);
        const url = await uploadPdf(file, post.id);
        if (url) {
            setAppUrl(url);
        } else {
            alert('PDFのアップロードに失敗しました。');
        }
        setPdfUploading(false);
    };

    // タグ選択トグル（1つのみ）
    const handleTagToggle = (tagId: string) => {
        setSelectedTags((prev) => prev.includes(tagId) ? [] : [tagId]);
    };

    // 送信
    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            let thumbnailUrl: string | undefined;
            if (thumbnailFile) {
                const processedFile = await processImageForUpload(thumbnailFile);
                const uploaded = await uploadThumbnail(processedFile, post.id);
                if (uploaded) thumbnailUrl = uploaded;
            }

            const ok = await updateApp(post.id, {
                title,
                category: selectedCategory,
                story: story || undefined,
                worryTagIds: selectedTags,
                appUrl: (inputMode === 'url' || inputMode === 'pdf') ? (appUrl || null) : null,
                htmlCode: inputMode === 'html' ? (htmlCode || null) : null,
                ...(thumbnailUrl ? { thumbnailUrl } : {}),
            });

            if (ok) {
                onSuccess?.();
                onClose();
            } else {
                alert('更新に失敗しました。もう一度お試しください。');
            }
        } catch (e) {
            console.error(e);
            alert('更新エラーが発生しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = title.trim().length > 0 && !pdfUploading;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-orange-50"
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="h-full flex flex-col"
                    >
                        {/* ヘッダー */}
                        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                                <span className="text-sm">キャンセル</span>
                            </button>
                            <h1 className="text-base font-bold text-gray-700">アプリを修正</h1>
                            <div className="w-20" />
                        </div>

                        {/* フォームコンテンツ */}
                        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

                            {/* 1. サムネイル画像 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    サムネイル画像
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-2/3 aspect-square rounded-2xl border-2 border-orange-200 bg-white overflow-hidden relative flex items-center justify-center"
                                    >
                                        <img
                                            src={thumbnailPreview ?? post.thumbnailUrl}
                                            alt="サムネイル"
                                            className="w-full h-full object-cover"
                                        />
                                        {/* アップロードボタンオーバーレイ */}
                                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1">
                                            <ImagePlus className="w-7 h-7 text-white" />
                                            <span className="text-xs text-white font-medium">変更する</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* 2. アプリタイトル */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    アプリタイトル
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="例: 楽しいとけいアプリ"
                                    className="w-full px-4 py-3 text-sm text-gray-700 bg-white border-2 border-orange-100 rounded-2xl focus:outline-none focus:border-orange-400 placeholder-gray-400"
                                />
                            </div>

                            {/* 3. アプリの登録方法 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    アプリの登録方法
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('url')}
                                        className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                                            inputMode === 'url'
                                                ? 'bg-orange-500 text-white shadow-md'
                                                : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200'
                                        }`}
                                    >
                                        🔗 アプリURL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('html')}
                                        className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                                            inputMode === 'html'
                                                ? 'bg-orange-500 text-white shadow-md'
                                                : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200'
                                        }`}
                                    >
                                        💻 HTMLコード
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('pdf')}
                                        className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                                            inputMode === 'pdf'
                                                ? 'bg-orange-500 text-white shadow-md'
                                                : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200'
                                        }`}
                                    >
                                        📄 教材PDF
                                    </button>
                                </div>

                                {inputMode === 'url' && (
                                    <input
                                        type="url"
                                        value={appUrl}
                                        onChange={(e) => setAppUrl(e.target.value)}
                                        placeholder="https://example.com/app"
                                        className="w-full px-4 py-3 text-sm text-gray-700 bg-white border-2 border-orange-100 rounded-2xl focus:outline-none focus:border-orange-400 placeholder-gray-400"
                                    />
                                )}

                                {inputMode === 'pdf' && (
                                    <>
                                        <input
                                            ref={pdfInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handlePdfSelect}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => pdfInputRef.current?.click()}
                                            disabled={pdfUploading}
                                            className="w-full py-3 px-4 border-2 border-dashed border-orange-200 bg-white rounded-2xl flex items-center justify-center gap-2 text-sm text-gray-500 hover:border-orange-400 hover:bg-orange-50/50 transition-colors disabled:opacity-60"
                                        >
                                            {pdfUploading ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                        className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full"
                                                    />
                                                    <span>アップロード中...</span>
                                                </>
                                            ) : pdfFile ? (
                                                <>
                                                    <span>📄</span>
                                                    <span className="truncate max-w-[200px] text-orange-600 font-medium">{pdfFile.name}</span>
                                                    <span className="text-green-500 text-xs">✓ アップロード完了</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>📄</span>
                                                    <span>PDFファイルを選択（現在のPDFを置き換え）</span>
                                                </>
                                            )}
                                        </button>
                                    </>
                                )}

                                {inputMode === 'html' && (
                                    <textarea
                                        value={htmlCode}
                                        onChange={(e) => setHtmlCode(e.target.value)}
                                        placeholder="HTMLコードを貼り付けてください"
                                        rows={8}
                                        className="w-full px-4 py-3 text-sm text-gray-700 bg-white border-2 border-orange-100 rounded-2xl resize-none focus:outline-none focus:border-orange-400 placeholder-gray-400 font-mono"
                                        style={{ fontSize: '12px', lineHeight: '1.5' }}
                                    />
                                )}
                            </div>

                            {/* 4. 対象カテゴリ */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    対象カテゴリ
                                </label>
                                <div className="flex gap-2">
                                    {categories.filter(cat => cat.id !== 'top').map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`flex-1 py-2.5 px-2 text-sm font-medium rounded-xl transition-all flex items-center justify-center ${
                                                selectedCategory === cat.id
                                                    ? `${cat.bgClass} text-white shadow-md`
                                                    : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200'
                                            }`}
                                        >
                                            {cat.label.includes('/') ? (
                                                <span className="leading-tight text-center text-xs">
                                                    {cat.label.split('/')[0]}<br />{cat.label.split('/')[1]}
                                                </span>
                                            ) : cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 5. タグ選択 */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    タグ（1つ選択）
                                </label>
                                <div className="flex gap-2">
                                    {worryTags.map((tag) => {
                                        const isSelected = selectedTags.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                onClick={() => handleTagToggle(tag.id)}
                                                className={`flex-1 py-2.5 px-2 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1 ${
                                                    isSelected
                                                        ? 'bg-orange-500 text-white shadow-md'
                                                        : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-orange-200'
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3" />}
                                                {tag.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 6. 開発のきっかけ */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    開発のきっかけ
                                </label>
                                <textarea
                                    value={story}
                                    onChange={(e) => setStory(e.target.value)}
                                    placeholder="なぜこのアプリを作ろうと思ったのか、お子さんとのエピソードなどを書いてね"
                                    rows={4}
                                    className="w-full px-4 py-3 text-sm text-gray-700 bg-white border-2 border-orange-100 rounded-2xl resize-none focus:outline-none focus:border-orange-400 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* フッター */}
                        <div className="px-4 py-4 bg-white border-t border-gray-100">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                disabled={!isValid || isSubmitting}
                                className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                                    isValid && !isSubmitting
                                        ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg shadow-orange-200'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Send className="w-5 h-5" />
                                {isSubmitting ? '更新中...' : '修正する'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
