'use client';

import { Pencil } from 'lucide-react';

interface FloatingActionButtonProps {
    onClick?: () => void;
    side?: 'left' | 'right';
    variant?: 'orange' | 'blue';
    ariaLabel?: string;
}

export default function FloatingActionButton({
    onClick,
    side = 'right',
    variant = 'orange',
    ariaLabel = '投稿する',
}: FloatingActionButtonProps) {
    const positionClass = side === 'left' ? 'left-4' : 'right-4';
    const colorClass =
        variant === 'blue'
            ? 'bg-gradient-to-br from-blue-400 to-blue-500'
            : 'bg-gradient-to-br from-orange-400 to-orange-500';

    return (
        <button
            onClick={onClick}
            className={`fixed bottom-28 ${positionClass} z-50 flex h-14 w-14 items-center justify-center rounded-full ${colorClass} text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95`}
            aria-label={ariaLabel}
        >
            <Pencil className="h-6 w-6" strokeWidth={2.5} />
        </button>
    );
}

