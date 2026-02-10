import Link from 'next/link';
import { Post, categories } from '@/data/mockData';
import { Crown, Medal, Hand, CircleUser } from 'lucide-react';

interface AppCardProps {
    post: Post;
    variant?: 'ranking' | 'grid';
}

// カテゴリに応じた背景色を取得
const getCategoryBgClass = (category: string): string => {
    const cat = categories.find((c) => c.id === category);
    return cat?.bgClass || 'bg-gray-300';
};

// 数値を短縮形式に変換（例: 1240 → 1.2k）
const formatCount = (count: number): string => {
    if (count >= 1000) {
        return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
};

// 画像URLかプレースホルダー文字かを判定
const isImageUrl = (value: string): boolean => {
    return value.startsWith('/') || value.startsWith('http');
};

// ランクに応じたバッジコンポーネントを取得
const RankBadge = ({ rank }: { rank: number }) => {
    const badgeConfig = {
        1: { bgColor: 'bg-yellow-400', iconColor: 'text-yellow-700', fillColor: 'fill-yellow-600' },
        2: { bgColor: 'bg-gray-300', iconColor: 'text-gray-600', fillColor: 'fill-gray-500' },
        3: { bgColor: 'bg-amber-500', iconColor: 'text-amber-800', fillColor: 'fill-amber-700' },
    }[rank];

    if (!badgeConfig) return null;

    return (
        <div className={`absolute top-2 left-2 z-10 w-7 h-7 ${badgeConfig.bgColor} rounded-full flex items-center justify-center shadow-md`}>
            {rank === 1 ? (
                <Crown className={`w-4 h-4 ${badgeConfig.iconColor} ${badgeConfig.fillColor}`} />
            ) : (
                <Medal className={`w-4 h-4 ${badgeConfig.iconColor} ${badgeConfig.fillColor}`} />
            )}
        </div>
    );
};

export default function AppCard({ post }: AppCardProps) {
    const hasRealImage = isImageUrl(post.thumbnailUrl);
    const categoryBgClass = getCategoryBgClass(post.category);
    const playedCount = post.meta.playedCount;

    const card = (
        <div className="group bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]">
            {/* サムネイル画像エリア（4:3） */}
            <div className="relative aspect-[4/3] overflow-hidden">
                {/* ランキングバッジ */}
                {post.rank && post.rank <= 3 && <RankBadge rank={post.rank} />}

                {/* 画像 or プレースホルダー */}
                {hasRealImage ? (
                    <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                ) : (
                    <div
                        className={`w-full h-full ${categoryBgClass} flex items-center justify-center`}
                    >
                        <span className="text-5xl font-bold text-white/60">
                            {post.thumbnailUrl}
                        </span>
                    </div>
                )}
            </div>

            {/* 情報エリア */}
            <div className="p-3">
                {/* タイトル（2行まで） */}
                <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">
                    {post.title}
                </h3>

                {/* メタ情報行 */}
                <div className="flex items-center justify-between">
                    {/* 左：作者情報 */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        {/* 作者アイコン */}
                        {post.author.avatarUrl ? (
                            <img
                                src={post.author.avatarUrl}
                                alt={post.author.name}
                                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <CircleUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        {/* 作者名（切り捨て） */}
                        <span className="text-xs text-gray-500 truncate">
                            {post.author.name}
                        </span>
                    </div>

                    {/* 右：あそんだ数 */}
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Hand className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-xs font-semibold text-orange-500">
                            {formatCount(playedCount)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!post.appUrl) {
        return card;
    }

    return (
        <Link href={post.appUrl} aria-label={`${post.title}の詳細へ`} className="block">
            {card}
        </Link>
    );
}
