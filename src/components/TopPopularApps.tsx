'use client';

import { Crown } from 'lucide-react';

interface PopularApp {
    id: string;
    label: string;
    title: string;
    author: string;
    playedCount: string;
    rankLabel: string; // "ベビー部門1位" など
}

const dummyApps: PopularApp[] = [
    { id: '1', label: 'A', title: 'ひらがなタッチ', author: 'ロイ@パパエンジニア', playedCount: '987人', rankLabel: 'ベビー部門 1位' },
    { id: '2', label: 'B', title: '電車あそびセット', author: 'ロイ@パパエンジニア', playedCount: '450人', rankLabel: '幼児部門 1位' },
    { id: '3', label: 'C', title: 'フィールドビンゴ 冬', author: 'ロイ@パパエンジニア', playedCount: '120人', rankLabel: '小学生部門 1位' },
];

export default function TopPopularApps() {
    return (
        <div className="px-4 pt-4 pb-4">
            {/* タイトル行 */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-800">
                    Wakarooで人気のアプリ
                </h2>
                <button className="text-xs text-gray-400">
                    もっと見る &gt;
                </button>
            </div>

            {/* リストコンテナ */}
            <div className="bg-white rounded-xl overflow-hidden shadow">
                {dummyApps.map((app, i) => (
                    <div key={app.id}>
                        <div className="flex items-center gap-3 px-4 py-3">
                            {/* アプリ画像 */}
                            <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-300 flex items-center justify-center">
                                <span className="text-xl font-bold text-gray-500">{app.label}</span>
                            </div>

                            {/* 情報カラム */}
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-sm font-bold text-gray-800 truncate">
                                    {app.title}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                    👤 作った人 : {app.author}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                    ✋ あそんだよ : <span className="text-red-500 font-semibold">{app.playedCount}</span>
                                </span>
                                {/* ランキングバッジ */}
                                <span className="flex items-center gap-1 text-[11px]">
                                    <Crown className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                                    <span className="text-amber-600 font-semibold">{app.rankLabel}</span>
                                </span>
                            </div>
                        </div>

                        {/* 区切り線（最後のアイテム以外） */}
                        {i < dummyApps.length - 1 && (
                            <div className="mx-4 h-px bg-gray-100" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
