import imageCompression from 'browser-image-compression';

/**
 * 画像を正方形にクロップしてリサイズ・圧縮する
 * - 最大幅・高さ: 800px
 * - 中央合わせで正方形 (1:1) にクロップ
 * - WebP形式に変換
 * - ファイルサイズ: 150KB以下
 */
export async function processImageForUpload(file: File): Promise<File> {
    // 1. まず画像をCanvasに読み込んで正方形にクロップ
    const croppedBlob = await cropToSquare(file);

    // 2. browser-image-compressionで圧縮・リサイズ・WebP変換
    const options = {
        maxSizeMB: 0.15, // 150KB
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/webp' as const,
    };

    const compressedFile = await imageCompression(croppedBlob, options);

    // ファイル名をWebP拡張子に変更
    const webpFileName = file.name.replace(/\.[^/.]+$/, '.webp');
    return new File([compressedFile], webpFileName, { type: 'image/webp' });
}

/**
 * 画像を中央合わせで正方形にクロップ
 */
async function cropToSquare(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        img.onload = () => {
            // 正方形のサイズを決定（短辺に合わせる）
            const size = Math.min(img.width, img.height);

            // 中央からクロップする位置を計算
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;

            // Canvasサイズを設定
            canvas.width = size;
            canvas.height = size;

            // 中央からクロップして描画
            ctx.drawImage(
                img,
                offsetX, offsetY, size, size, // ソース領域
                0, 0, size, size               // 描画領域
            );

            // Blobに変換
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                'image/jpeg',
                0.95
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));

        // ファイルをDataURLとして読み込む
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
