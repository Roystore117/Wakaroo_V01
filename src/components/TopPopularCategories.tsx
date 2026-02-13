'use client';

const THEME_COLOR = '#FF9800';

const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export default function TopPopularCategories() {
    return (
        <div className="w-full bg-white py-5">
            {/* 見出し */}
            <h2 className="text-center text-sm font-bold text-gray-800">
                人気のカテゴリ
            </h2>

            {/* アクセントライン */}
            <div
                className="mx-4 h-[1.5px] mt-2 mb-3"
                style={{ backgroundColor: THEME_COLOR }}
            />

            {/* 横スクロールカルーセル */}
            <div
                className="overflow-x-auto scrollbar-hide"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
            >
                <div className="flex gap-3 px-4 w-max">
                    {items.map((label) => (
                        <button
                            key={label}
                            onClick={() => {/* TODO */}}
                            className="flex flex-col items-center gap-1 flex-shrink-0"
                        >
                            <div
                                className="w-[76px] h-[76px] rounded-lg p-[3px] bg-white"
                                style={{ border: `1.5px solid ${THEME_COLOR}` }}
                            >
                                <div className="w-full h-full rounded-md bg-gray-200 flex items-center justify-center">
                                    <span
                                        className="text-lg font-bold"
                                        style={{ color: THEME_COLOR }}
                                    >
                                        {label}
                                    </span>
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold text-gray-800">
                                {label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
