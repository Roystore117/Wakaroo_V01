'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Heart, Play, ThumbsUp, Send, Star, CircleUser } from 'lucide-react';
import BottomNav from './BottomNav';
import { Post, categories } from '@/data/mockData';

interface DetailViewProps {
  post: Post;
}

const isImageUrl = (value: string): boolean => {
  return value.startsWith('/') || value.startsWith('http');
};

const ageLabelMap: Record<string, string> = {
  baby: '0〜2歳向け',
  infant: '4〜6歳向け',
  low: '6〜8歳向け',
  high: '9〜12歳向け',
};

const buildRating = (likeCount: number) => {
  const base = 4.5;
  const add = (likeCount % 4) * 0.1;
  return Math.min(4.9, Number((base + add).toFixed(1)));
};

const buildReviewCount = (viewCount: number) => {
  return Math.max(12, Math.floor(viewCount / 150));
};

// 星評価コンポーネント
const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 fill-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

export default function DetailView({ post }: DetailViewProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'details'>('reviews');
  const hasRealImage = isImageUrl(post.thumbnailUrl);
  const categoryLabel = categories.find((item) => item.id === post.category)?.label ?? '';
  const ageLabel = ageLabelMap[post.category] ?? '対象年齢';

  const rating = useMemo(() => buildRating(post.meta.likeCount), [post.meta.likeCount]);
  const reviewCount = useMemo(() => buildReviewCount(post.meta.viewCount), [post.meta.viewCount]);
  const formattedDate = useMemo(() => {
    const date = new Date(post.updatedAt);
    return Number.isNaN(date.getTime()) ? '2026/02/10' : date.toLocaleDateString('ja-JP');
  }, [post.updatedAt]);

  const reviewSamples = useMemo(
    () => [
      {
        id: 'review-1',
        name: '匿名ユーザー',
        time: '2時間前',
        rating: 5,
        comment: '息子が恐竜大好きで、毎日遊んでいます！動きがリアルで驚きました。',
        likes: 12,
      },
      {
        id: 'review-2',
        name: '恐竜博士のパパ',
        time: '5時間前',
        rating: 4,
        comment: '解説がもう少し増えるともっと良いかも。図鑑としても楽しめます。',
        likes: 6,
      },
      {
        id: 'review-3',
        name: 'おーぷんどり',
        time: '昨日',
        rating: 5,
        comment: '図鑑とARの組み合わせが良い。親子で一緒に遊べるのが嬉しいです。',
        likes: 3,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur">
        <Link href="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="text-sm font-semibold text-gray-800">アプリ詳細</div>
      </header>

      <main className="px-4 pb-28 pt-4">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200">
              {hasRealImage ? (
                <img src={post.thumbnailUrl} alt={post.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-orange-400">
                  {post.thumbnailUrl}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-base font-bold text-gray-900">{post.title}</h1>
              <p className="mt-1 text-xs text-gray-500">
                {ageLabel}・{categoryLabel}・{post.tags.slice(0, 2).map((tag) => tag.name).join('・')}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <span className="flex items-center gap-1 font-semibold text-emerald-500">
                  <Star className="w-4 h-4 fill-emerald-500" />
                  {rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">({reviewCount}件のレビュー)</span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            {post.description} 図鑑の中で動き出すアニメーションと、音声ガイドで学びを深められます。
          </p>
          <button className="mt-2 text-sm font-semibold text-emerald-500">もっと見る</button>

          <div className="mt-4 flex items-center gap-3">
            <button className="flex-1 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-100">
              <span className="inline-flex items-center justify-center gap-2">
                <Play className="h-4 w-4" />
                プレイ
              </span>
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-400">
              <Heart className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex gap-6 border-b border-gray-100 text-sm">
            <button
              className={`pb-3 font-semibold ${activeTab === 'reviews' ? 'text-gray-900 border-b-2 border-emerald-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('reviews')}
            >
              レビュー掲示板
            </button>
            <button
              className={`pb-3 font-semibold ${activeTab === 'details' ? 'text-gray-900 border-b-2 border-emerald-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('details')}
            >
              詳細情報
            </button>
          </div>

          {activeTab === 'reviews' ? (
            <div className="mt-4 space-y-4">
              {reviewSamples.map((review) => (
                <div key={review.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <CircleUser className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="font-semibold text-gray-700">{review.name}</span>
                        <span>{review.time}</span>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{review.comment}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {review.likes}
                    </span>
                    <button className="font-semibold">返信</button>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <CircleUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="コメントを入力..."
                    className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                  />
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-white">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">対象年齢</span>
                  <span className="font-semibold text-gray-800">{ageLabel}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-gray-400">カテゴリ</span>
                  <span className="font-semibold text-gray-800">{categoryLabel}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-gray-400">タグ</span>
                  <span className="font-semibold text-gray-800">{post.tags.map((tag) => tag.name).join('・')}</span>
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-gray-400">更新日</span>
                  <span className="font-semibold text-gray-800">{formattedDate}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm">
                <div className="text-xs font-semibold text-gray-400">提供元</div>
                <div className="mt-2 text-base font-semibold text-gray-800">{post.author.name}</div>
                <div className="mt-1 text-xs text-gray-400">安心・安全のチェック済み</div>
              </div>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
