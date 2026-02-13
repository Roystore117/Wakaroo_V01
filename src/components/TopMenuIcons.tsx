'use client';

import { Gamepad2, Brush, MessageCircle, Crown } from 'lucide-react';
import { type ComponentType } from 'react';

const THEME_COLOR = '#FF9800';

interface MenuItem {
    label: string;
    icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
    href: string;
}

const menuItems: MenuItem[] = [
    { label: 'あそぶ', icon: Gamepad2, href: '/apps' },
    { label: 'つくる', icon: Brush, href: '/create' },
    { label: 'はなす', icon: MessageCircle, href: '/idobata' },
    { label: 'ランキング', icon: Crown, href: '/ranking' },
];

export default function TopMenuIcons() {
    return (
        <div
            className="w-full bg-white flex flex-col items-center justify-center px-4"
            style={{ aspectRatio: '2.5 / 1' }}
        >
            {/* 見出し */}
            <h2 className="text-center text-sm font-bold text-gray-800">
                今日はなにする？
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
                                <div className="w-[52px] h-[52px] rounded-full bg-gray-200 flex items-center justify-center">
                                    <Icon
                                        className="w-6 h-6"
                                        style={{ color: THEME_COLOR }}
                                    />
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
