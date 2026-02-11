'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { X } from 'lucide-react';

function PlayContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const url = searchParams.get('url');

    const handleClose = () => {
        router.push('/');
    };

    if (!url) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">URLが指定されていません</p>
            </div>
        );
    }

    return (
        <div className="h-screen w-full relative">
            {/* 閉じるボタン */}
            <button
                onClick={handleClose}
                className="absolute top-4 left-4 z-50 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white px-3 py-2 rounded-full shadow-lg backdrop-blur-sm transition-colors"
            >
                <X className="w-5 h-5" />
                <span className="text-sm font-medium">閉じる</span>
            </button>

            {/* iframe */}
            <iframe
                src={url}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}

export default function PlayPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">読み込み中...</p>
            </div>
        }>
            <PlayContent />
        </Suspense>
    );
}
