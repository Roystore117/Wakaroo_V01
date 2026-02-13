'use client';

export default function TopBanners() {
    return (
        <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
            <div className="w-full bg-gray-300 flex items-center justify-center" style={{ aspectRatio: '3.3 / 1' }}>
                <span className="text-lg font-bold text-gray-500">Banner 1</span>
            </div>
            <div className="w-full bg-gray-300 flex items-center justify-center" style={{ aspectRatio: '3.3 / 1' }}>
                <span className="text-lg font-bold text-gray-500">Banner 2</span>
            </div>
        </div>
    );
}
