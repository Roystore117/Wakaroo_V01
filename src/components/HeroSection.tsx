'use client';

import Link from 'next/link';
import { Clock, Award } from 'lucide-react';
import { HeroArticle } from '@/lib/supabase';

interface HeroSectionProps {
    article?: HeroArticle | null;
}

export default function HeroSection({ article }: HeroSectionProps) {
    // デフォルト値（データがない場合）
    const title = article?.title || '時計が読めた！';
    const subtitle = article?.subtitle || '感動の3日間';
    const authorName = article?.authorName || 'ロイ＠パパエンジニア';
    const imageUrl = article?.imageUrl;
    const linkUrl = article?.linkUrl;

    const content = (
        <section className="relative w-full aspect-[16/9] overflow-hidden">
            {/* 背景（画像またはグラデーション） */}
            <div className="absolute inset-0">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <>
                        {/* ベースグラデーション */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-pink-100" />

                        {/* 装飾的な円 */}
                        <div className="absolute top-4 right-8 w-32 h-32 bg-white/40 rounded-full blur-2xl" />
                        <div className="absolute bottom-4 left-4 w-24 h-24 bg-pink-200/50 rounded-full blur-xl" />
                        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-200/40 rounded-full blur-lg" />
                    </>
                )}

                {/* 下部のオーバーレイ（テキスト視認性向上） */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* 右側のイメージアイコン（画像がない場合のみ表示） */}
            {!imageUrl && (
                <div className="absolute top-1/2 right-6 -translate-y-1/2">
                    <Clock className="w-16 h-16 text-amber-600/70" strokeWidth={1.5} />
                </div>
            )}

            {/* テキストコンテンツ（左下） */}
            <div className="absolute inset-0 flex flex-col justify-end p-4">
                {/* メインタイトル（白文字＋シャドウ） */}
                <h2
                    className="text-xl font-bold text-white leading-tight mb-1"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.4)' }}
                >
                    {title}
                    {subtitle && (
                        <>
                            <br />
                            {subtitle}
                        </>
                    )}
                </h2>

                {/* 考案者（右下寄せ） */}
                {authorName && (
                    <div className="flex justify-end items-center gap-1 mt-1">
                        <span
                            className="text-[11px] text-white/95 font-medium flex items-center gap-1"
                            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
                        >
                            考案者：{authorName}
                            <Award className="w-3.5 h-3.5 text-orange-300 fill-orange-200" />
                        </span>
                    </div>
                )}
            </div>
        </section>
    );

    // リンクがある場合はクリック可能に
    if (linkUrl) {
        return (
            <Link href={linkUrl} className="block">
                {content}
            </Link>
        );
    }

    return content;
}
