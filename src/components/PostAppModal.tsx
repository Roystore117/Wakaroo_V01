'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImagePlus, Send, Check, Lightbulb, Sparkles } from 'lucide-react';
import { categories, worryTags, Category } from '@/data/mockData';

// 連携する悩みデータ
interface LinkedWorry {
    id: string;
    text: string;
}

interface PostAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    linkedWorry?: LinkedWorry | null; // 悩み解決ループ用
}

// 紙吹雪パーティクル
interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    rotation: number;
}

// 紙吹雪コンポーネント
function Confetti({ pieces }: { pieces: ConfettiPiece[] }) {
    return (
        <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
            {pieces.map((piece) => (
                <motion.div
                    key={piece.id}
                    initial={{
                        x: `${piece.x}vw`,
                        y: -20,
                        rotate: 0,
                        opacity: 1,
                    }}
                    animate={{
                        y: '110vh',
                        rotate: piece.rotation,
                        opacity: [1, 1, 0],
                    }}
                    transition={{
                        duration: 3,
                        delay: piece.delay,
                        ease: 'linear' as const,
                    }}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{ backgroundColor: piece.color }}
                />
            ))}
        </div>
    );
}

export default function PostAppModal({ isOpen, onClose, linkedWorry }: PostAppModalProps) {
    // フォームstate
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [appUrl, setAppUrl] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [story, setStory] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState('');

    // 紙吹雪
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

    // 送信中フラグ
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 画像選択
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setThumbnailPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // タグ選択トグル
    const handleTagToggle = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    };

    // カスタムタグ追加
    const handleAddCustomTag = () => {
        if (customTag.trim() && !selectedTags.includes(`custom-${customTag.trim()}`)) {
            setSelectedTags((prev) => [...prev, `custom-${customTag.trim()}`]);
            setCustomTag('');
        }
    };

    // 紙吹雪を生成
    const triggerConfetti = () => {
        const colors = ['#F97316', '#FBBF24', '#FB923C', '#FCD34D', '#FDBA74', '#FEF3C7'];
        const pieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.5,
            rotation: Math.random() * 720 - 360,
        }));
        setConfettiPieces(pieces);
        setShowConfetti(true);
    };

    // フォームリセット
    const resetForm = () => {
        setThumbnailPreview(null);
        setTitle('');
        setAppUrl('');
        setSelectedCategory(null);
        setStory('');
        setSelectedTags([]);
        setCustomTag('');
    };

    // 投稿処理
    const handleSubmit = () => {
        if (isSubmitting) return;

        const postData = {
            thumbnail: thumbnailPreview,
            title,
            appUrl,
            category: selectedCategory,
            story,
            tags: selectedTags.map((tagId) => {
                if (tagId.startsWith('custom-')) {
                    return { id: tagId, label: `#${tagId.replace('custom-', '')}` };
                }
                const tag = worryTags.find((t) => t.id === tagId);
                return tag ? { id: tag.id, label: tag.label } : null;
            }).filter(Boolean),
            createdAt: new Date().toISOString(),
            // 悩み解決ループ: 連携悩み情報
            linkedWorry: linkedWorry ? {
                id: linkedWorry.id,
                text: linkedWorry.text,
            } : null,
            isWorryResponse: !!linkedWorry, // 悩みへの回答投稿フラグ
        };

        console.log('=== 投稿データ ===');
        console.log(postData);
        if (linkedWorry) {
            console.log('💡 この投稿は悩みへの回答です:', linkedWorry.text);
        }

        setIsSubmitting(true);
        triggerConfetti();

        setTimeout(() => {
            resetForm();
            setIsSubmitting(false);
            setShowConfetti(false);
            onClose();
        }, 1800);
    };

    // バリデーション（最低限タイトルがあれば投稿可能）
    const isValid = title.trim().length > 0;

    if (!isOpen) return null;

    return (
        <>
            {showConfetti && <Confetti pieces={confettiPieces} />}

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
                                <h1 className="text-base font-bold text-gray-700">
                                    {linkedWorry ? '悩みを解決するアプリを投稿' : 'アプリを投稿'}
                                </h1>
                                <div className="w-20" /> {/* スペーサー */}
                            </div>

                            {/* 悩み解決ループ: 回答中の悩みバナー */}
                            {linkedWorry && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mx-4 mt-4 relative"
                                >
                                    {/* キラキラ枠線エフェクト */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 rounded-2xl animate-pulse opacity-60" />
                                    <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-300 shadow-lg">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center shadow-md">
                                                <Lightbulb className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="text-xs font-bold text-orange-600">
                                                        回答中の悩み
                                                    </span>
                                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    『{linkedWorry.text.length > 50
                                                        ? `${linkedWorry.text.slice(0, 50)}...`
                                                        : linkedWorry.text}』
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

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
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full aspect-video rounded-2xl border-2 border-dashed border-orange-200 bg-white flex flex-col items-center justify-center gap-2 hover:border-orange-400 hover:bg-orange-50/50 transition-colors overflow-hidden"
                                    >
                                        {thumbnailPreview ? (
                                            <img
                                                src={thumbnailPreview}
                                                alt="プレビュー"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                <ImagePlus className="w-10 h-10 text-orange-300" />
                                                <span className="text-xs text-gray-400">
                                                    タップして画像を選択
                                                </span>
                                            </>
                                        )}
                                    </button>
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

                                {/* 3. アプリURL */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                        アプリURL
                                    </label>
                                    <input
                                        type="url"
                                        value={appUrl}
                                        onChange={(e) => setAppUrl(e.target.value)}
                                        placeholder="https://example.com/app"
                                        className="w-full px-4 py-3 text-sm text-gray-700 bg-white border-2 border-orange-100 rounded-2xl focus:outline-none focus:border-orange-400 placeholder-gray-400"
                                    />
                                </div>

                                {/* 4. 対象カテゴリ */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                        対象カテゴリ
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                                                    selectedCategory === cat.id
                                                        ? `${cat.bgClass} text-white shadow-md`
                                                        : 'bg-white text-gray-600 border-2 border-gray-100 hover:border-gray-200'
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 5. 開発のきっかけ */}
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

                                {/* 6. タグ選択 */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                        タグ（複数選択可）
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {worryTags.map((tag) => {
                                            const isSelected = selectedTags.includes(tag.id);
                                            return (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => handleTagToggle(tag.id)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                                                        isSelected
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
                                                    }`}
                                                >
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                    {tag.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* カスタムタグ追加 */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customTag}
                                            onChange={(e) => setCustomTag(e.target.value)}
                                            placeholder="新しいタグを追加..."
                                            className="flex-1 px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded-full focus:outline-none focus:border-orange-400 placeholder-gray-400"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddCustomTag();
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={handleAddCustomTag}
                                            disabled={!customTag.trim()}
                                            className="px-3 py-2 text-xs font-medium text-orange-500 bg-orange-50 rounded-full hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            追加
                                        </button>
                                    </div>

                                    {/* 追加したカスタムタグ表示 */}
                                    {selectedTags.filter((t) => t.startsWith('custom-')).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {selectedTags
                                                .filter((t) => t.startsWith('custom-'))
                                                .map((tagId) => (
                                                    <button
                                                        key={tagId}
                                                        onClick={() => handleTagToggle(tagId)}
                                                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-amber-500 text-white flex items-center gap-1"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        #{tagId.replace('custom-', '')}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* フッター（投稿ボタン） */}
                            <div className="px-4 py-4 bg-white border-t border-gray-100 safe-area-inset-bottom">
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
                                    {isSubmitting ? '投稿中...' : '投稿する'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
