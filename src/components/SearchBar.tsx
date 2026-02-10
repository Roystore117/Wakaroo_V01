'use client';

import { Search } from 'lucide-react';

export default function SearchBar() {
    return (
        <div className="px-4 py-4">
            <div className="flex items-center rounded-xl bg-gray-100 px-4 py-3 shadow-inner transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-300">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="アプリをさがす"
                    className="ml-3 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}
