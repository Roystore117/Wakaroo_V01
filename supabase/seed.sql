-- ========================================
-- Wakaroo 初期データ投入SQL
-- Supabase SQL Editor で実行してください
-- ========================================

-- 悩みタグデータ
INSERT INTO worry_tags (id, label, category_label) VALUES
    ('wt1', '#5分で終わる', '生活部門'),
    ('wt2', '#時計読めない', '学習部門'),
    ('wt3', '#歯磨き嫌い', '生活部門'),
    ('wt4', '#夜泣き', 'ベビー部門'),
    ('wt5', '#ひらがな覚えたい', '学習部門'),
    ('wt6', '#数字に興味', '学習部門'),
    ('wt10', '#その他', 'その他')
ON CONFLICT (id) DO NOTHING;

-- アプリデータ（ベビー カテゴリ）
INSERT INTO apps (id, title, description, thumbnail_url, category, tags, author, status, is_ranking, rank, is_featured, view_count, like_count, played_count, story, worry_tag_ids, app_url) VALUES
    ('baby-1', '音と色のあそび', 'タッチすると音が鳴る！色と音で感覚を育てる',
     'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80',
     'baby', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', true, 1, true, 15000, 1200, 1240,
     '{"title": "赤ちゃんの好奇心を刺激したくて", "content": "息子が生後6ヶ月の頃、スマホの画面に興味津々で。安心して触れるアプリを作りたかったんです。"}'::jsonb,
     ARRAY['wt1', 'wt4'], '/apps/sound-color'),

    ('baby-2', 'いないいないばあ', '赤ちゃんが喜ぶいないいないばあアプリ',
     'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
     'baby', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', true, 2, false, 12000, 980, 856,
     '{"title": "子どもの「なぜ？」から生まれたアプリ", "content": "息子と遊んでいるときに、こんなアプリがあったらいいなと思い開発しました。"}'::jsonb,
     ARRAY['wt4'], '/apps/peekaboo'),

    ('baby-3', 'タッチでぴょん', 'タッチするとキャラクターがジャンプ！',
     'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?auto=format&fit=crop&w=400&q=80',
     'baby', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', true, 3, false, 9500, 750, 623,
     '{"title": "子どもの「なぜ？」から生まれたアプリ", "content": "息子と遊んでいるときに、こんなアプリがあったらいいなと思い開発しました。"}'::jsonb,
     ARRAY['wt1'], '/apps/touch-jump'),

    ('baby-4', 'ゆらゆらオルゴール', '優しいメロディで赤ちゃんもリラックス',
     'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80',
     'baby', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', false, null, true, 8000, 620, 445,
     '{"title": "子どもの「なぜ？」から生まれたアプリ", "content": "息子と遊んでいるときに、こんなアプリがあったらいいなと思い開発しました。"}'::jsonb,
     ARRAY['wt4'], '/apps/music-box');

-- アプリデータ（幼児 カテゴリ）
INSERT INTO apps (id, title, description, thumbnail_url, category, tags, author, status, is_ranking, rank, is_featured, view_count, like_count, played_count, story, worry_tag_ids, app_url) VALUES
    ('infant-1', '動く！ずかんアプリ', '恐竜や動物たちが画面の中で動き出す！',
     'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80',
     'infant', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', true, 1, true, 18000, 1500, 2340,
     '{"title": "恐竜好きな息子のために", "content": "4歳の息子が恐竜に夢中で、図鑑だけじゃ物足りなくなったので動くずかんを作りました！"}'::jsonb,
     ARRAY[]::text[], '/apps/zukan'),

    ('infant-2', 'かず・とけいアプリ', '数字と時計の読み方を遊びながら学べる！',
     'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
     'infant', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', true, 2, false, 14000, 1100, 1890,
     '{"title": "子どもの「なぜ？」から生まれたアプリ", "content": "息子と遊んでいるときに、こんなアプリがあったらいいなと思い開発しました。"}'::jsonb,
     ARRAY['wt2', 'wt6'], '/apps/clock'),

    ('infant-4', 'ひらがなタッチ', 'ひらがなを指でなぞって覚えよう',
     'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80',
     'infant', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', false, null, true, 9500, 720, 987,
     '{"title": "子どもの「なぜ？」から生まれたアプリ", "content": "息子と遊んでいるときに、こんなアプリがあったらいいなと思い開発しました。"}'::jsonb,
     ARRAY['wt5'], '/apps/hiragana-touch');

-- アプリデータ（低学年 カテゴリ）
INSERT INTO apps (id, title, description, thumbnail_url, category, tags, author, status, is_ranking, rank, is_featured, view_count, like_count, played_count, story, worry_tag_ids, app_url) VALUES
    ('low-1', 'ひらがな・カタカナアプリ', '楽しくひらがなとカタカナを覚えよう！',
     'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80',
     'low', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', true, 1, true, 16000, 1300, 3120,
     '{"title": "小1の宿題がきっかけで", "content": "娘が小学校に入学してひらがな練習に苦戦していたので、楽しく練習できるアプリを作りました！"}'::jsonb,
     ARRAY['wt5'], '/apps/hiragana'),

    ('low-2', 'たしざん・ひきざん', '計算の基礎をゲーム感覚で学ぼう',
     'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
     'low', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', true, 2, false, 13000, 1050, 2450,
     '{"title": "子どもの「なぜ？」から生まれたアプリ", "content": "息子と遊んでいるときに、こんなアプリがあったらいいなと思い開発しました。"}'::jsonb,
     ARRAY['wt6'], '/apps/math-basic'),

    ('low-7', 'とけいマスター', '時計の読み方を完璧にマスター',
     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
     'low', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', false, null, false, 7500, 520, 712,
     '{"title": "子どもの「なぜ？」から生まれたアプリ", "content": "息子と遊んでいるときに、こんなアプリがあったらいいなと思い開発しました。"}'::jsonb,
     ARRAY['wt2'], '/apps/clock-master');

-- アプリデータ（高学年 カテゴリ）
INSERT INTO apps (id, title, description, thumbnail_url, category, tags, author, status, is_ranking, rank, is_featured, view_count, like_count, played_count, story, worry_tag_ids, app_url) VALUES
    ('high-1', '理科実験室', 'バーチャル実験で科学の不思議を体験',
     'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80',
     'high', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', true, 1, true, 17000, 1400, 4560,
     '{"title": "理科の実験を安全に楽しめるように", "content": "学校では危険でできない実験も、アプリなら安全に体験できます。好奇心を育てたいと思って作りました。"}'::jsonb,
     ARRAY[]::text[], '/apps/science'),

    ('high-2', '漢字クイズ', '読み書きで漢字力アップ',
     'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
     'high', '[]'::jsonb,
     '{"id": "author-1", "name": "ロイ＠パパエンジニア", "avatar_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80", "is_verified": true, "role": "アプリ開発者", "badges": ["公認クリエイター", "人気作者"]}'::jsonb,
     'published', true, 2, false, 14500, 1150, 3240,
     '{"title": "子どもの「なぜ？」から生まれたアプリ", "content": "息子と遊んでいるときに、こんなアプリがあったらいいなと思い開発しました。"}'::jsonb,
     ARRAY[]::text[], '/apps/kanji');

-- ========================================
-- ヒーロー記事テーブル
-- ========================================

CREATE TABLE IF NOT EXISTS hero_articles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subtitle TEXT,
  author_name TEXT,
  image_url TEXT,
  link_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLSポリシー
ALTER TABLE hero_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read hero" ON hero_articles
FOR SELECT TO anon USING (true);

-- カテゴリ別ヒーロー記事データ
INSERT INTO hero_articles (id, title, subtitle, author_name, category, is_active, display_order) VALUES
('hero-baby', '夜泣きが止まった！', '魔法の3分間', 'ママエンジニア', 'baby', true, 1),
('hero-infant', '時計が読めた！', '感動の3日間', 'ロイ＠パパエンジニア', 'infant', true, 1),
('hero-low', 'ひらがな完璧！', '楽しく覚えた1週間', 'パパプログラマー', 'low', true, 1),
('hero-high', '算数が好きになった！', '苦手克服の物語', '理系ママ', 'high', true, 1)
ON CONFLICT (id) DO NOTHING;
