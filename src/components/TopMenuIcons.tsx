'use client';

import { Gamepad2, Brush, MessageCircle, Crown } from 'lucide-react';
import { type ComponentType } from 'react';

const THEME_COLOR = '#FF9800';

interface MenuItem {
    label: string;
    icon?: ComponentType<{ className?: string; style?: React.CSSProperties }>;
    imageUrl?: string;
    href: string;
    bgColor?: string;
    iconSize?: string;
}

const menuItems: MenuItem[] = [
    { label: 'あそぶ', imageUrl: '/images/icon-asobu.png', href: '/apps' },
    { label: 'つくる', imageUrl: '/images/icon-tsukuru.png', href: '/create' },
    { label: 'はなす', imageUrl: '/images/icon-hanasu.png', href: '/idobata' },
    { label: 'ランキング', imageUrl: '/images/icon-ranking.png', href: '/ranking' },
];

export default function TopMenuIcons() {
    return (
        <div
            className="w-full bg-white flex flex-col items-center justify-center px-4"
            style={{ paddingTop: '20px', paddingBottom: '20px' }}
        >
            {/* 見出し */}
            <h2 className="text-center text-base font-bold text-gray-800">
                Wakarooで何する？
            </h2>

            {/* アクセントライン（横幅いっぱい） */}
            <div
                className="w-full h-[1.5px] mt-2 mb-3"
                style={{ backgroundColor: THEME_COLOR }}
            />

            {/* アイコン行 */}
            <div className="flex justify-evenly w-full">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={() => {/* TODO: navigation */}}
                            className="flex flex-col items-center gap-1"
                        >
                            <div
                                className="rounded-full p-[3px] bg-white"
                                style={{ border: `1.5px solid ${THEME_COLOR}` }}
                            >
                                <div
                                    className="w-[72px] h-[72px] rounded-full flex items-center justify-center overflow-hidden"
                                    style={{ backgroundColor: item.bgColor || '#E5E7EB' }}
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.label}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : Icon ? (
                                        <Icon
                                            className={item.iconSize || 'w-6 h-6'}
                                            style={{ color: THEME_COLOR }}
                                        />
                                    ) : null}
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
