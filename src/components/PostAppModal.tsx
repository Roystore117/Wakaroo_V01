'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ImagePlus, Send, Check, Lightbulb, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { categories, worryTags } from '@/data/mockData';
import { Category, createApp, WorryTag, uploadThumbnail, generateAppId } from '@/lib/supabase';
import { processImageForUpload } from '@/lib/imageProcessor';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';

// 連携する悩みデータ
interface LinkedWorry {
    id: string;
    text: string;
}

interface PostAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    linkedWorry?: LinkedWorry | null;
    worryTagsData?: WorryTag[];
    onSuccess?: () => void;
}

// 紙吹雪パーティクル
interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    rotation: number;
}

// 審査フェーズ
type ReviewPhase = 'idle' | 'security' | 'scoring' | 'complete';

// レーダーチャート用データ（モック）
const radarData = [
    { subject: '思考力', value: 4, fullMark: 5 },
    { subject: '感性', value: 3, fullMark: 5 },
    { subject: '瞬発力', value: 5, fullMark: 5 },
    { subject: '没入', value: 4, fullMark: 5 },
    { subject: '技術', value: 3, fullMark: 5 },
];

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

// AI審査ローディング画面
function ReviewLoadingScreen({ phase }: { phase: 'security' | 'scoring' }) {
    const messages = {
        security: {
            emoji: '🕵️‍♂️',
            text: 'AIがセキュリティをチェック中...',
        },
        scoring: {
            emoji: '📊',
            text: '教育スコアを算出中...',
        },
    };

    const current = messages[phase];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center"
        >
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl mb-6"
            >
                {current.emoji}
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-bold text-gray-700"
            >
                {current.text}
            </motion.p>
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
                        className="w-3 h-3 rounded-full bg-blue-400"
                    />
                ))}
            </div>
        </motion.div>
    );
}

// 審査完了画面
function ReviewCompleteScreen({ onSubmit, isSubmitting }: { onSubmit: () => void; isSubmitting: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col"
        >
            {/* ヘッダー */}
            <div className="px-4 py-4 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full"
                >
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-bold">審査完了</span>
                </motion.div>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto px-4 pb-32">
                {/* セキュリティチェック結果 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border-2 border-blue-100 mb-4"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">悪意のあるコードが無いか</span>
                            <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                CLEAR
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">不適切なコンテンツが無いか</span>
                            <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                CLEAR
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* 教育効果レーダーチャート */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 shadow-sm border border-blue-200"
                >
                    <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <span>📈</span>
                        教育効果（レーダーチャート）
                    </h3>
                    <div className="bg-white rounded-xl p-2" style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e0e7ff" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#4f46e5', fontSize: 12, fontWeight: 600 }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 5]}
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    tickCount={6}
                                />
                                <Radar
                                    name="教育効果"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    fill="#818cf8"
                                    fillOpacity={0.5}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-blue-600 mt-3 text-center">
                        ※ AIが推定した教育効果スコアです
                    </p>
                </motion.div>
            </div>

            {/* 固定フッター */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 safe-area-inset-bottom"
            >
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg shadow-orange-200 disabled:opacity-70"
                >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? '投稿中...' : '投稿する'}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

export default function PostAppModal({ isOpen, onClose, linkedWorry, worryTagsData, onSuccess }: PostAppModalProps) {
    // フォームstate
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [appUrl, setAppUrl] = useState('');
    const [htmlCode, setHtmlCode] = useState('');
    const [inputMode, setInputMode] = useState<'url' | 'html'>('url');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [story, setStory] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState('');

    // 紙吹雪
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

    // 審査フェーズ
    const [reviewPhase, setReviewPhase] = useState<ReviewPhase>('idle');

    // 送信中フラグ
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 画像選択
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
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
        setThumbnailFile(null);
        setTitle('');
        setAppUrl('');
        setHtmlCode('');
        setInputMode('url');
        setSelectedCategory(null);
        setStory('');
        setSelectedTags([]);
        setCustomTag('');
        setReviewPhase('idle');
    };

    // 審査開始（フォーム送信ボタンを押した時）
    const handleStartReview = () => {
        if (!selectedCategory) return;
        setReviewPhase('security');
    };

    // 審査フェーズの自動進行
    useEffect(() => {
        if (reviewPhase === 'security') {
            const timer = setTimeout(() => {
                setReviewPhase('scoring');
            }, 2000);
            return () => clearTimeout(timer);
        }
        if (reviewPhase === 'scoring') {
            const timer = setTimeout(() => {
                setReviewPhase('complete');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [reviewPhase]);

    // 実際の投稿処理（審査完了画面の投稿ボタンを押した時）
    const handleActualSubmit = async () => {
        if (isSubmitting || !selectedCategory) return;

        setIsSubmitting(true);

        try {
            const validWorryTagIds = selectedTags.filter(
                (tagId) => !tagId.startsWith('custom-')
            );

            const customTagNames = selectedTags
                .filter((tagId) => tagId.startsWith('custom-'))
                .map((tagId) => tagId.replace('custom-', ''));

            const appId = generateAppId(selectedCategory);

            let thumbnailUrl: string | undefined;
            if (thumbnailFile) {
                try {
                    const processedFile = await processImageForUpload(thumbnailFile);
                    const uploadedUrl = await uploadThumbnail(processedFile, appId);
                    if (uploadedUrl) {
                        thumbnailUrl = uploadedUrl;
                    }
                } catch (imgError) {
                    console.error('画像処理エラー:', imgError);
                }
            }

            const result = await createApp({
                id: appId,
                title,
                description: title,
                category: selectedCategory,
                story: story || undefined,
                worryTagIds: validWorryTagIds,
                customTags: customTagNames,
                appUrl: inputMode === 'url' ? (appUrl || undefined) : undefined,
                htmlCode: inputMode === 'html' ? (htmlCode || undefined) : undefined,
                thumbnailUrl,
            });

            if (result) {
                console.log('=== 投稿成功 ===', result);
                if (linkedWorry) {
                    console.log('💡 この投稿は悩みへの回答です:', linkedWorry.text);
                }

                triggerConfetti();

                setTimeout(() => {
                    resetForm();
                    setIsSubmitting(false);
                    setShowConfetti(false);
                    onSuccess?.();
                    onClose();
                }, 1800);
            } else {
                console.error('投稿に失敗しました');
                setIsSubmitting(false);
                alert('投稿に失敗しました。もう一度お試しください。');
            }
        } catch (error) {
            console.error('投稿エラー:', error);
            setIsSubmitting(false);
            const errorMessage = error instanceof Error ? error.message : '不明なエラー';
            alert(`投稿エラー: ${errorMessage}\n\nブラウザのコンソールで詳細を確認してください。`);
        }
    };

    // バリデーション
    const isValid = title.trim().length > 0 && selectedCategory !== null;

    if (!isOpen) return null;

    return (
        <>
            {showConfetti && <Confetti pieces={confettiPieces} />}

            {/* AI審査ローディング画面 */}
            <AnimatePresence>
                {(reviewPhase === 'security' || reviewPhase === 'scoring') && (
                    <ReviewLoadingScreen phase={reviewPhase} />
                )}
            </AnimatePresence>

            {/* 審査完了画面 */}
            <AnimatePresence>
                {reviewPhase === 'complete' && (
                    <ReviewCompleteScreen
                        onSubmit={handleActualSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && reviewPhase === 'idle' && (
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
                                <div className="w-20" />
                            </div>

                            {/* 悩み解決ループ: 回答中の悩みバナー */}
                            {linkedWorry && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mx-4 mt-4 relative"
                                >
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

                                {/* 3. 入力モード選択（URL or HTML） */}
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

                                    {inputMode === 'html' && (
                                        <textarea
                                            value={htmlCode}
                                            onChange={(e) => setHtmlCode(e.target.value)}
                                            placeholder="ここにGeminiなどで作成したHTMLコードを貼り付けてください"
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

                            {/* フッター（審査開始ボタン） */}
                            <div className="px-4 py-4 bg-white border-t border-gray-100 safe-area-inset-bottom">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleStartReview}
                                    disabled={!isValid}
                                    className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                                        isValid
                                            ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg shadow-orange-200'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Send className="w-5 h-5" />
                                    投稿する
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
