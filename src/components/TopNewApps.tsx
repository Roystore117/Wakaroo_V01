'use client';

import { useEffect, useState } from 'react';
import { Post, fetchNewApps } from '@/lib/supabase';

const isImageUrl = (value: string): boolean => {
    return value.startsWith('/') || value.startsWith('http');
};

export default function TopNewApps() {
    const [apps, setApps] = useState<Post[]>([]);

    useEffect(() => {
        fetchNewApps(3).then(setApps);
    }, []);

    if (apps.length === 0) return null;

    return (
        <div className="px-4 pt-4 pb-4">
            {/* タイトル行 */}
            <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-base font-bold text-gray-800">
                    新着アプリ
                </h2>
                <button className="text-xs text-gray-600">
                    もっと見る &gt;
                </button>
            </div>

            {/* リストコンテナ */}
            <div className="bg-white rounded-xl overflow-hidden shadow">
                {apps.map((app, i) => (
                    <div key={app.id}>
                        <div className="flex items-center gap-3 px-4 py-3">
                            {/* アプリ画像 */}
                            <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-300 overflow-hidden">
                                {isImageUrl(app.thumbnailUrl) ? (
                                    <img
                                        src={app.thumbnailUrl}
                                        alt={app.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-xl font-bold text-gray-500">
                                            {app.thumbnailUrl || app.title.charAt(0)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 情報カラム */}
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-sm font-bold text-gray-800 truncate">
                                    {app.title}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                    🐣 作った人 : {app.author.name}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                    ✋ あそんだよ : <span className="text-red-500 font-semibold">{app.meta.playedCount.toLocaleString()}人</span>
                                </span>
                            </div>
                        </div>

                        {/* 区切り線（最後のアイテム以外） */}
                        {i < apps.length - 1 && (
                            <div className="mx-4 h-px bg-gray-100" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
