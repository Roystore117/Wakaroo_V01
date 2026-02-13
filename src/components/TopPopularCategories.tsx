'use client';

import { useEffect, useState } from 'react';
import { fetchPopularApps, fetchWorryTags, WorryTag } from '@/lib/supabase';

const THEME_COLOR = '#FF9800';

export default function TopPopularCategories() {
    const [tags, setTags] = useState<WorryTag[]>([]);

    useEffect(() => {
        (async () => {
            // played_count上位のアプリを多めに取得
            const apps = await fetchPopularApps(50);
            // worry_tag_idsを順に見てユニークな上位10件を抽出
            const seen = new Set<string>();
            const topTagIds: string[] = [];
            for (const app of apps) {
                for (const tagId of app.worryTagIds) {
                    if (!seen.has(tagId)) {
                        seen.add(tagId);
                        topTagIds.push(tagId);
                        if (topTagIds.length >= 10) break;
                    }
                }
                if (topTagIds.length >= 10) break;
            }

            // worry_tagsテーブルからラベルを取得
            const allTags = await fetchWorryTags();
            const tagMap = new Map(allTags.map(t => [t.id, t]));

            // 順序を保ったままマッチ
            const matched = topTagIds
                .map(id => tagMap.get(id))
                .filter((t): t is WorryTag => !!t);

            setTags(matched);
        })();
    }, []);

    if (tags.length === 0) return null;

    return (
        <div className="w-full bg-white py-5">
            {/* 見出し */}
            <h2 className="text-center text-sm font-bold text-gray-800">
                人気のカテゴリ
            </h2>

            {/* アクセントライン */}
            <div
                className="mx-4 h-[1.5px] mt-2 mb-3"
                style={{ backgroundColor: THEME_COLOR }}
            />

            {/* 横スクロールカルーセル */}
            <div
                className="overflow-x-auto scrollbar-hide"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
            >
                <div className="flex gap-3 px-4 w-max">
                    {tags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => {/* TODO */}}
                            className="flex flex-col items-center gap-1 flex-shrink-0"
                        >
                            <div
                                className="w-[76px] h-[76px] rounded-lg p-[3px] bg-white"
                                style={{ border: `1.5px solid ${THEME_COLOR}` }}
                            >
                                <div className="w-full h-full rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {tag.image_url ? (
                                        <img
                                            src={tag.image_url}
                                            alt={tag.label}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span
                                            className="text-[11px] font-bold text-center leading-tight px-1"
                                            style={{ color: THEME_COLOR }}
                                        >
                                            {tag.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold text-gray-800 max-w-[76px] text-center break-words leading-tight">
                                {tag.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
