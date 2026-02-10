'use client';

import { Home, Heart, MessageCircle, User } from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    active?: boolean;
}

export default function BottomNav() {
    const navItems: NavItem[] = [
        {
            id: 'home',
            label: 'ホーム',
            icon: <Home className="h-6 w-6" strokeWidth={1.5} />,
            activeIcon: <Home className="h-6 w-6" fill="currentColor" strokeWidth={0} />,
            active: true
        },
        {
            id: 'favorites',
            label: 'お気に入り',
            icon: <Heart className="h-6 w-6" strokeWidth={1.5} />,
            activeIcon: <Heart className="h-6 w-6" fill="currentColor" strokeWidth={0} />,
        },
        {
            id: 'idobata',
            label: 'イドバタ!',
            icon: <MessageCircle className="h-6 w-6" strokeWidth={1.5} />,
            activeIcon: <MessageCircle className="h-6 w-6" fill="currentColor" strokeWidth={0} />,
        },
        {
            id: 'mypage',
            label: 'マイページ',
            icon: <User className="h-6 w-6" strokeWidth={1.5} />,
            activeIcon: <User className="h-6 w-6" fill="currentColor" strokeWidth={0} />,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="flex justify-around py-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`
              flex flex-col items-center px-4 py-1.5 transition-all duration-200
              ${item.active
                                ? 'text-orange-500 scale-105'
                                : 'text-gray-400 hover:text-gray-600'
                            }
            `}
                    >
                        {item.active ? item.activeIcon : item.icon}
                        <span className={`mt-1 text-[10px] font-medium ${item.active ? 'font-bold' : ''}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
            {/* セーフエリア対応 */}
            <div className="h-safe-area-inset-bottom bg-white" />
        </nav>
    );
}
