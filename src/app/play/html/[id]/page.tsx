'use client';

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Home, Hand, Send, PenLine } from 'lucide-react';
import { fetchAppById } from '@/lib/supabase';

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

// 紙吹雪パーティクル
interface ConfettiPiece {
    id: number;
    x: number;
    color: string;
    delay: number;
    rotation: number;
}

// ローディングオーバーレイコンポーネント
function LoadingOverlay() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-orange-50"
        >
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
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-sm text-gray-500"
            >
                アプリを準備中...
            </motion.p>
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

// 紙吹雪コンポーネント
function Confetti({ pieces }: { pieces: ConfettiPiece[] }) {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
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

// ポストプレイ画面コンポーネント
function PostPlayModal({
    onClose,
    onPlayedClick,
}: {
    onClose: () => void;
    onPlayedClick: () => void;
}) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
    const [reviewText, setReviewText] = useState('');
    const [isLetterOpen, setIsLetterOpen] = useState(false);
    const router = useRouter();

    // 紙吹雪を生成して表示
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

    // 送信処理
    const handleSubmit = () => {
        if (hasReview) {
            console.log('Review:', reviewText);
            console.log('あそんだよ！（レビュー付き）');
        } else {
            console.log('あそんだよ！（コメントなし）');
        }

        // 紙吹雪 + ホームへ
        triggerConfetti();
        setTimeout(() => {
            onPlayedClick();
            router.push('/');
        }, 1500);
    };

    const handleFavoriteToggle = () => {
        setIsFavorite(!isFavorite);
        console.log(`お気に入り: ${!isFavorite ? 'ON' : 'OFF'}`);
    };

    const handleGoHome = () => {
        router.push('/');
    };

    const handleToggleLetter = () => {
        setIsLetterOpen(!isLetterOpen);
    };

    const hasReview = reviewText.trim().length > 0;

    return (
        <>
            {showConfetti && <Confetti pieces={confettiPieces} />}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl max-h-[90dvh] overflow-y-auto"
                >
                    {/* ヘッダー装飾 */}
                    <div className="flex justify-center mb-3">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-4xl"
                        >
                            🎉
                        </motion.div>
                    </div>

                    {/* メッセージ */}
                    <h2 className="text-lg font-bold text-gray-700 text-center mb-1">
                        楽しかった？
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-5">
                        また遊ぼうね！
                    </p>

                    {/* メインボタン（あそんだよ！/ 送信モード） */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={showConfetti}
                        className="w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 mb-3 disabled:opacity-70"
                    >
                        <AnimatePresence mode="wait">
                            {hasReview ? (
                                <motion.div
                                    key="send"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 45 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    <span>おてがみを送る！</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="wave"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2"
                                >
                                    <Hand className="w-5 h-5" />
                                    <span>あそんだよ！</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* おてがみトリガー */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleLetter}
                        className={`w-full py-2 flex items-center justify-center gap-1.5 text-xs font-medium mb-3 transition-colors ${
                            isLetterOpen ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <PenLine className="w-3.5 h-3.5" />
                        <span>{isLetterOpen ? 'とじる' : 'おてがみをかく？'}</span>
                        <motion.span
                            animate={{ rotate: isLetterOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[10px]"
                        >
                            ▼
                        </motion.span>
                    </motion.button>

                    {/* アコーディオン：おてがみ入力エリア */}
                    <AnimatePresence>
                        {isLetterOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' as const }}
                                className="overflow-hidden"
                            >
                                <div className="pb-3">
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="ここにかんそうをかいてね！"
                                        className="w-full h-28 p-3 text-sm text-gray-700 bg-orange-50 border-2 border-orange-200 rounded-2xl resize-none focus:outline-none focus:border-orange-400 placeholder-gray-400"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* お気に入りボタン */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFavoriteToggle}
                        className={`w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 mb-3 transition-colors ${
                            isFavorite
                                ? 'bg-pink-100 text-pink-500'
                                : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                        <motion.div
                            animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.3 }}
                        >
                            <Heart
                                className={`w-4 h-4 ${isFavorite ? 'fill-pink-500' : ''}`}
                            />
                        </motion.div>
                        <span className="text-xs font-medium">
                            {isFavorite ? 'お気に入りに追加しました' : 'お気に入りに追加'}
                        </span>
                    </motion.button>

                    {/* ホームに戻るリンク */}
                    <button
                        onClick={handleGoHome}
                        className="w-full text-center text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 py-2"
                    >
                        <Home className="w-3.5 h-3.5" />
                        ホームに戻る
                    </button>
                </motion.div>
            </motion.div>
        </>
    );
}

function HtmlPlayContent() {
    const params = useParams();
    const router = useRouter();
    const appId = params.id as string;

    const [htmlCode, setHtmlCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timerCompleted, setTimerCompleted] = useState(false);
    const [showPostPlay, setShowPostPlay] = useState(false);

    // データ取得
    useEffect(() => {
        async function loadApp() {
            try {
                const app = await fetchAppById(appId);
                if (app && app.htmlCode) {
                    setHtmlCode(app.htmlCode);
                } else {
                    setError('HTMLコードが見つかりません');
                }
            } catch (err) {
                console.error('Error loading app:', err);
                setError('アプリの読み込みに失敗しました');
            }
        }
        loadApp();
    }, [appId]);

    // 最低1500msのタイマー
    useEffect(() => {
        const timer = setTimeout(() => {
            setTimerCompleted(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // HTMLコード取得完了 AND タイマー完了でローディング終了
    useEffect(() => {
        if (htmlCode && timerCompleted) {
            setIsLoading(false);
        }
    }, [htmlCode, timerCompleted]);

    // 閉じるボタン → ポストプレイ画面を表示
    const handleClose = () => {
        setShowPostPlay(true);
    };

    const handlePostPlayClose = () => {
        setShowPostPlay(false);
    };

    const handlePlayedClick = () => {
        // 紙吹雪後のコールバック（ナビゲーションはPostPlayModal内で行う）
    };

    if (error) {
        return (
            <div className="h-dvh w-full flex items-center justify-center bg-orange-50" style={{ height: '100dvh' }}>
                <div className="text-center">
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg"
                    >
                        ホームに戻る
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-dvh w-full relative" style={{ height: '100dvh' }}>
            {/* ローディングオーバーレイ */}
            <AnimatePresence>
                {isLoading && <LoadingOverlay />}
            </AnimatePresence>

            {/* ポストプレイ画面 */}
            <AnimatePresence>
                {showPostPlay && (
                    <PostPlayModal
                        onClose={handlePostPlayClose}
                        onPlayedClick={handlePlayedClick}
                    />
                )}
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

            {/* HTMLコードをsrcdocでレンダリング */}
            {htmlCode && (
                <iframe
                    srcDoc={htmlCode}
                    className={`h-full w-full border-0 transition-opacity duration-500 ${
                        isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    sandbox="allow-scripts allow-same-origin"
                    title="HTML App"
                />
            )}
        </div>
    );
}

export default function HtmlPlayPage() {
    return (
        <Suspense fallback={<LoadingOverlay />}>
            <HtmlPlayContent />
        </Suspense>
    );
}
