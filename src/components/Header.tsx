'use client';

import { Category, categories } from '@/data/mockData';
import { Menu, Search } from 'lucide-react';

interface HeaderProps {
    activeCategory: Category;
    onCategoryChange: (category: Category) => void;
}

export default function Header({ activeCategory, onCategoryChange }: HeaderProps) {
    // 現在のカテゴリ設定を取得
    const activeConfig = categories.find((c) => c.id === activeCategory) || categories[0];

    return (
        <header className="sticky top-0 z-50">
            {/* 1. タブエリア（各タブが個別の背景色を持つ） */}
            <div className="flex">
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={`
                                flex-1 py-2.5 text-sm font-bold text-white transition-all duration-300
                                ${cat.bgClass}
                            `}
                        >
                            {cat.label}
                        </button>
                    );
                })}
                {/* ハンバーガーメニュー */}
                <button className="flex items-center justify-center bg-gray-100 px-4 text-gray-500 hover:bg-gray-200 transition-colors">
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* 2. 検索バーエリア（選択中のカテゴリ色を背景にする → タブと結合して見える） */}
            <div className={`p-3 ${activeConfig.bgClass} transition-colors duration-300`}>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="アプリをさがす"
                        className="w-full bg-white/90 rounded-full py-2 px-10 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
            </div>
        </header>
    );
}
