'use client';

import Link from 'next/link';
import { Post } from '@/data/mockData';
import { Crown, Hand, CircleUser } from 'lucide-react';

interface HorizontalAppCardProps {
    post: Post;
    categoryLabel?: string;
}

// 数値をフォーマット（カンマ区切り）
const formatNumber = (num: number): string => {
    return num.toLocaleString();
};

// 画像URLかプレースホルダー文字かを判定
const isImageUrl = (value: string): boolean => {
    return value.startsWith('/') || value.startsWith('http');
};

export default function HorizontalAppCard({ post, categoryLabel = '生活部門' }: HorizontalAppCardProps) {
    const hasRealImage = isImageUrl(post.thumbnailUrl);
    const playedCount = post.meta.playedCount;
    const isRanked = post.rank !== null && post.rank <= 3;

    const card = (
        <div className="flex gap-3 bg-white rounded-xl p-3 shadow-md border border-white/50 active:scale-[0.99] transition-transform">
            {/* 左側：サムネイル（正方形） */}
            <div className="w-[72px] aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {hasRealImage ? (
                    <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400">
                            {post.thumbnailUrl}
                        </span>
                    </div>
                )}
            </div>

            {/* 右側：情報エリア（行間詰め） */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                {/* タイトル */}
                <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
                    {post.title}
                </h3>

                {/* 作った人 */}
                <p className="flex items-center gap-1 text-[11px] text-gray-500 leading-tight mb-0.5">
                    <CircleUser className="w-3 h-3 text-gray-400" />
                    <span>作った人：</span>
                    <span className="text-gray-600 truncate">{post.author.name}</span>
                </p>

                {/* あそんだよ（数字を赤太字で強調） */}
                <p className="flex items-center gap-1 text-[11px] text-gray-500 leading-tight mb-0.5">
                    <Hand className="w-3 h-3 text-orange-400" />
                    <span>あそんだよ：</span>
                    <span className="font-bold text-red-500">{formatNumber(playedCount)}人</span>
                </p>

                {/* ランキングバッジ */}
                {isRanked && (
                    <p className="flex items-center gap-1 text-[11px] leading-tight">
                        <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                        <span className="text-amber-600 font-semibold">
                            {categoryLabel} {post.rank}位
                        </span>
                    </p>
                )}
            </div>
        </div>
    );

    // すべてのアプリを同じURLでプレイ画面に遷移（仮）
    const playUrl = `/play?url=${encodeURIComponent('https://clock-study-nu.vercel.app/')}`;

    return (
        <Link href={playUrl} aria-label={`${post.title}をプレイ`} className="block">
            {card}
        </Link>
    );
}
