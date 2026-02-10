'use client';

import { Pencil } from 'lucide-react';

interface FloatingActionButtonProps {
    onClick?: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
            aria-label="投稿する"
        >
            <Pencil className="h-6 w-6" strokeWidth={2.5} />
        </button>
    );
}

