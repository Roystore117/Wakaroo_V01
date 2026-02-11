'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, User } from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
}

export default function BottomNav() {
    const pathname = usePathname();

    const navItems: NavItem[] = [
        {
            id: 'home',
            label: 'ホーム',
            href: '/',
            icon: <Home className="h-6 w-6" strokeWidth={1.5} />,
            activeIcon: <Home className="h-6 w-6" fill="currentColor" strokeWidth={0} />,
        },
        {
            id: 'favorites',
            label: 'お気に入り',
            href: '/favorites',
            icon: <Heart className="h-6 w-6" strokeWidth={1.5} />,
            activeIcon: <Heart className="h-6 w-6" fill="currentColor" strokeWidth={0} />,
        },
        {
            id: 'idobata',
            label: 'イドバタ!',
            href: '/community',
            icon: <MessageCircle className="h-6 w-6" strokeWidth={1.5} />,
            activeIcon: <MessageCircle className="h-6 w-6" fill="currentColor" strokeWidth={0} />,
        },
        {
            id: 'mypage',
            label: 'マイページ',
            href: '/profile',
            icon: <User className="h-6 w-6" strokeWidth={1.5} />,
            activeIcon: <User className="h-6 w-6" fill="currentColor" strokeWidth={0} />,
        },
    ];

    // 現在のパスがアイテムのhrefと一致するかチェック
    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <div className="flex justify-around py-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                                flex flex-col items-center px-4 py-1.5 transition-all duration-200
                                ${active
                                    ? 'text-orange-500 scale-105'
                                    : 'text-gray-400 hover:text-gray-600'
                                }
                            `}
                        >
                            {active ? item.activeIcon : item.icon}
                            <span className={`mt-1 text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
            {/* セーフエリア対応 */}
            <div className="h-safe-area-inset-bottom bg-white" />
        </nav>
    );
}
