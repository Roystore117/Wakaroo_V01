import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabaseが設定されているかチェック
export const isSupabaseConfigured = (): boolean => {
    return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

// Supabaseクライアント（設定されていない場合はnull）
export const supabase: SupabaseClient | null = isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ========================================
// 型定義
// ========================================

export type Category = 'top' | 'baby' | 'infant' | 'low' | 'high';
export type PostStatus = 'draft' | 'published' | 'archived' | 'deleted';

export interface Tag {
    id: string;
    name: string;
    slug: string;
}

export interface Author {
    id: string;
    name: string;
    avatar_url: string | null;
    is_verified: boolean;
    role: string;
    badges: string[];
}

export interface Story {
    title: string;
    content: string;
}

export interface WorryTag {
    id: string;
    label: string;
    category_label: string;
}

// Supabaseから取得するアプリデータの型
export interface AppRow {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    category: Category;
    tags: Tag[];
    author: Author;
    status: PostStatus;
    is_ranking: boolean;
    rank: number | null;
    is_featured: boolean;
    view_count: number;
    like_count: number;
    comment_count: number;
    share_count: number;
    bookmark_count: number;
    played_count: number;
    story: Story | null;
    worry_tag_ids: string[];
    app_url: string | null;
    html_code: string | null;
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

// フロントエンド用に変換した型（既存のPost型と互換）
export interface Post {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    category: Category;
    tags: Tag[];
    author: {
        id: string;
        name: string;
        avatarUrl: string | null;
        isVerified: boolean;
        role: string;
        badges: string[];
    };
    status: PostStatus;
    isRanking: boolean;
    rank: number | null;
    isFeatured: boolean;
    meta: {
        viewCount: number;
        likeCount: number;
        commentCount: number;
        shareCount: number;
        bookmarkCount: number;
        playedCount: number;
    };
    story: Story;
    worryTagIds: string[];
    appUrl: string | null;
    htmlCode: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
}

// ========================================
// データ変換ヘルパー
// ========================================

// Supabaseのスネークケースをキャメルケースに変換
export function transformAppRow(row: AppRow): Post {
    return {
        id: row.id,
        title: row.title,
        description: row.description || '',
        thumbnailUrl: row.thumbnail_url || '',
        category: row.category,
        tags: row.tags || [],
        author: {
            id: row.author.id,
            name: row.author.name,
            avatarUrl: row.author.avatar_url,
            isVerified: row.author.is_verified,
            role: row.author.role,
            badges: row.author.badges || [],
        },
        status: row.status,
        isRanking: row.is_ranking,
        rank: row.rank,
        isFeatured: row.is_featured,
        meta: {
            viewCount: row.view_count,
            likeCount: row.like_count,
            commentCount: row.comment_count,
            shareCount: row.share_count,
            bookmarkCount: row.bookmark_count,
            playedCount: row.played_count,
        },
        story: row.story || { title: '', content: '' },
        worryTagIds: row.worry_tag_ids || [],
        appUrl: row.app_url,
        htmlCode: row.html_code,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        publishedAt: row.published_at,
    };
}

// ========================================
// データ取得関数
// ========================================

// 全アプリを取得
export async function fetchAllApps(): Promise<Post[]> {
    if (!supabase) {
        console.warn('Supabase is not configured');
        return [];
    }

    const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching apps:', error);
        return [];
    }

    return (data as AppRow[]).map(transformAppRow);
}

// カテゴリ別アプリを取得
export async function fetchAppsByCategory(category: Category): Promise<Post[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching apps by category:', error);
        return [];
    }

    return (data as AppRow[]).map(transformAppRow);
}

// ランキングアプリを取得
export async function fetchRankingApps(category?: Category): Promise<Post[]> {
    if (!supabase) return [];

    let query = supabase
        .from('apps')
        .select('*')
        .eq('status', 'published')
        .eq('is_ranking', true)
        .order('rank', { ascending: true });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching ranking apps:', error);
        return [];
    }

    return (data as AppRow[]).map(transformAppRow);
}

// 悩みタグIDでアプリを取得
export async function fetchAppsByWorryTagId(tagId: string): Promise<Post[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('status', 'published')
        .contains('worry_tag_ids', [tagId]);

    if (error) {
        console.error('Error fetching apps by worry tag:', error);
        return [];
    }

    return (data as AppRow[]).map(transformAppRow);
}

// IDでアプリを取得
export async function fetchAppById(id: string): Promise<Post | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching app by id:', error);
        return null;
    }

    return transformAppRow(data as AppRow);
}

// appUrlのスラッグでアプリを取得
export async function fetchAppBySlug(slug: string): Promise<Post | null> {
    if (!supabase) return null;

    const targetPath = `/apps/${slug}`;
    const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('app_url', targetPath)
        .single();

    if (error) {
        console.error('Error fetching app by slug:', error);
        return null;
    }

    return transformAppRow(data as AppRow);
}

// 悩みタグ一覧を取得
export async function fetchWorryTags(): Promise<WorryTag[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('worry_tags')
        .select('*');

    if (error) {
        console.error('Error fetching worry tags:', error);
        return [];
    }

    return data as WorryTag[];
}

// ========================================
// ヒーロー記事
// ========================================

export interface HeroArticle {
    id: string;
    title: string;
    subtitle: string | null;
    authorName: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    category: Category | null;
    isActive: boolean;
    displayOrder: number;
}

interface HeroArticleRow {
    id: string;
    title: string;
    subtitle: string | null;
    author_name: string | null;
    image_url: string | null;
    link_url: string | null;
    category: Category | null;
    is_active: boolean;
    display_order: number;
}

// カテゴリ別のヒーロー記事を取得
export async function fetchHeroArticleByCategory(category: Category): Promise<HeroArticle | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('hero_articles')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('display_order', { ascending: true })
        .limit(1)
        .single();

    if (error) {
        // データがない場合はnullを返す（エラーログは出さない）
        if (error.code === 'PGRST116') return null;
        console.error('Error fetching hero article:', error);
        return null;
    }

    const row = data as HeroArticleRow;
    return {
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        authorName: row.author_name,
        imageUrl: row.image_url,
        linkUrl: row.link_url,
        category: row.category,
        isActive: row.is_active,
        displayOrder: row.display_order,
    };
}

// 全てのアクティブなヒーロー記事を取得
export async function fetchHeroArticles(): Promise<HeroArticle[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('hero_articles')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching hero articles:', error);
        return [];
    }

    return (data as HeroArticleRow[]).map(row => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        authorName: row.author_name,
        imageUrl: row.image_url,
        linkUrl: row.link_url,
        category: row.category,
        isActive: row.is_active,
        displayOrder: row.display_order,
    }));
}

// ========================================
// データ投稿関数
// ========================================

// 新規アプリ投稿用の入力型
export interface CreateAppInput {
    id?: string;  // 指定しない場合は自動生成
    title: string;
    description?: string;
    thumbnailUrl?: string;
    category: Category;
    story?: string;
    worryTagIds?: string[];
    customTags?: string[];  // ユーザーが入力したカスタムタグ名
    appUrl?: string;
    htmlCode?: string;  // GeminiなどでユーザーがHTMLコードを直接貼り付ける用
    authorName?: string;
}

// アプリID生成ヘルパー
export function generateAppId(category: Category): string {
    return `${category}-${Date.now()}`;
}

// アプリを新規投稿
export async function createApp(input: CreateAppInput): Promise<Post | null> {
    if (!supabase) {
        console.error('Supabase is not configured');
        return null;
    }

    // IDを使用（指定がなければ生成）
    const id = input.id || generateAppId(input.category);

    // デフォルトのauthor情報
    const defaultAuthor: Author = {
        id: 'user-anonymous',
        name: input.authorName || 'ゲストユーザー',
        avatar_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80',
        is_verified: false,
        role: 'アプリ投稿者',
        badges: [],
    };

    // デフォルトのサムネイル（入力がない場合）
    const defaultThumbnail = 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=400&q=80';

    // カスタムタグを処理
    const customTags = input.customTags || [];
    const customTagObjects: Tag[] = customTags.map((name, index) => ({
        id: `custom-${Date.now()}-${index}`,
        name: name.startsWith('#') ? name : `#${name}`,
        slug: name.replace(/^#/, '').toLowerCase(),
    }));

    // worry_tag_idsを構築（カスタムタグがあれば wt10 を追加）
    let worryTagIds = input.worryTagIds || [];
    if (customTags.length > 0 && !worryTagIds.includes('wt10')) {
        worryTagIds = [...worryTagIds, 'wt10'];
    }

    const newApp = {
        id,
        title: input.title,
        description: input.description || '',
        thumbnail_url: input.thumbnailUrl || defaultThumbnail,
        category: input.category,
        tags: customTagObjects, // カスタムタグをここに保存
        author: defaultAuthor,
        status: 'published',
        is_ranking: false,
        rank: null,
        is_featured: false,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
        bookmark_count: 0,
        played_count: 0,
        story: input.story ? { title: '開発のきっかけ', content: input.story } : null,
        worry_tag_ids: worryTagIds,
        app_url: input.appUrl || null,
        html_code: input.htmlCode || null,
    };

    const { data, error } = await supabase
        .from('apps')
        .insert(newApp)
        .select()
        .single();

    if (error) {
        console.error('=== Supabase INSERT Error ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Attempted data:', JSON.stringify(newApp, null, 2));
        throw new Error(`${error.code}: ${error.message}`);
    }

    return transformAppRow(data as AppRow);
}

// 画像をSupabase Storageにアップロード
export async function uploadThumbnail(
    file: File,
    appId: string
): Promise<string | null> {
    if (!supabase) {
        console.error('Supabase is not configured');
        return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${appId}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { error } = await supabase.storage
        .from('app-images')
        .upload(filePath, file, { upsert: true });

    if (error) {
        console.error('Error uploading thumbnail:', error);
        return null;
    }

    // 公開URLを取得
    const { data } = supabase.storage
        .from('app-images')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
