'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Slide {
    id: string;
    label: string;
}

const ORIGINAL_SLIDES: Slide[] = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
    { id: 'c', label: 'C' },
    { id: 'd', label: 'D' },
    { id: 'e', label: 'E' },
    { id: 'f', label: 'F' },
];

const AUTOPLAY_INTERVAL = 5000;
const SLIDE_GAP = 8;
const SLIDE_WIDTH_RATIO = 0.82; // コンテナ幅の82%
const SIDE_PADDING_RATIO = (1 - SLIDE_WIDTH_RATIO) / 2; // 左右9%ずつ

export default function TopHeroCarousel() {
    const total = ORIGINAL_SLIDES.length;

    // 無限ループ用: [clone末尾] + [本体] + [clone先頭]
    const extendedSlides = [
        ORIGINAL_SLIDES[total - 1],
        ...ORIGINAL_SLIDES,
        ORIGINAL_SLIDES[0],
    ];

    const [current, setCurrent] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const touchStartX = useRef(0);
    const touchDeltaX = useRef(0);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // コンテナ幅を計測
    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const slideWidthPx = containerWidth * SLIDE_WIDTH_RATIO;
    const sidePaddingPx = containerWidth * SIDE_PADDING_RATIO;

    // 実際のスライドインデックス (0-based)
    const realIndex = (idx: number) => {
        if (idx <= 0) return total - 1;
        if (idx > total) return 0;
        return idx - 1;
    };

    const goTo = useCallback((index: number) => {
        setIsTransitioning(true);
        setCurrent(index);
    }, []);

    // 無限ループ: アニメーション完了後にクローン→本体へジャンプ
    const handleTransitionEnd = useCallback(() => {
        if (current <= 0) {
            setIsTransitioning(false);
            setCurrent(total);
        } else if (current > total) {
            setIsTransitioning(false);
            setCurrent(1);
        }
    }, [current, total]);

    // Autoplay
    const startAutoplay = useCallback(() => {
        stopAutoplay();
        autoplayRef.current = setInterval(() => {
            setIsTransitioning(true);
            setCurrent((prev) => prev + 1);
        }, AUTOPLAY_INTERVAL);
    }, []);

    const stopAutoplay = useCallback(() => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current);
            autoplayRef.current = null;
        }
    }, []);

    useEffect(() => {
        startAutoplay();
        return stopAutoplay;
    }, [startAutoplay, stopAutoplay]);

    // Touch（stopPropagationでカテゴリスワイプとの競合を防止）
    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        stopAutoplay();
        setIsDragging(true);
        setIsTransitioning(false);
        touchStartX.current = e.touches[0].clientX;
        touchDeltaX.current = 0;
        setDragOffset(0);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const delta = e.touches[0].clientX - touchStartX.current;
        touchDeltaX.current = delta;
        setDragOffset(delta);
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        e.stopPropagation();
        if (!isDragging) return;
        setIsDragging(false);
        if (touchDeltaX.current < -40) goTo(current + 1);
        else if (touchDeltaX.current > 40) goTo(current - 1);
        else setIsTransitioning(true);
        setDragOffset(0);
        touchDeltaX.current = 0;
        startAutoplay();
    };

    // Mouse
    const mouseStartX = useRef(0);
    const mouseDragging = useRef(false);
    const handleMouseDown = (e: React.MouseEvent) => {
        stopAutoplay();
        mouseDragging.current = true;
        setIsDragging(true);
        setIsTransitioning(false);
        mouseStartX.current = e.clientX;
        touchDeltaX.current = 0;
        setDragOffset(0);
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!mouseDragging.current) return;
        const delta = e.clientX - mouseStartX.current;
        touchDeltaX.current = delta;
        setDragOffset(delta);
    };
    const handleMouseUp = () => {
        if (!mouseDragging.current) return;
        mouseDragging.current = false;
        setIsDragging(false);
        if (touchDeltaX.current < -40) goTo(current + 1);
        else if (touchDeltaX.current > 40) goTo(current - 1);
        else setIsTransitioning(true);
        setDragOffset(0);
        touchDeltaX.current = 0;
        startAutoplay();
    };
    const handleMouseLeave = () => {
        if (mouseDragging.current) handleMouseUp();
    };

    // ピクセル単位でオフセット計算
    const getTranslateX = () => {
        const offset = current * (slideWidthPx + SLIDE_GAP);
        return sidePaddingPx - offset + dragOffset;
    };

    return (
        <div className="pt-4 pb-2">
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {/* トラック */}
                <div
                    className="flex select-none"
                    style={{
                        gap: `${SLIDE_GAP}px`,
                        transform: `translateX(${getTranslateX()}px)`,
                        transition: isTransitioning
                            ? 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
                            : 'none',
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {extendedSlides.map((slide, i) => (
                        <div
                            key={`${slide.id}-${i}`}
                            className="flex-shrink-0"
                            style={{ width: `${slideWidthPx}px`, aspectRatio: '2.5 / 1' }}
                        >
                            <div className="relative w-full h-full rounded-[14px] bg-gray-300 flex items-center justify-center overflow-hidden">
                                <span className="text-4xl font-bold text-gray-500">
                                    {slide.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ドットインジケーター */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {ORIGINAL_SLIDES.map((slide, i) => (
                        <button
                            key={slide.id}
                            onClick={() => { goTo(i + 1); startAutoplay(); }}
                            className={`rounded-full transition-all duration-300 ${
                                realIndex(current) === i
                                    ? 'w-5 h-2 bg-white'
                                    : 'w-2 h-2 bg-white/50'
                            }`}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
