'use client';

import { motion } from 'framer-motion';
import {
    User,
    Settings,
    ChevronRight,
    LogOut,
    FileEdit,
    Bell,
    HelpCircle,
    BadgeCheck,
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

// ダミーのユーザーデータ
const userData = {
    name: 'ロイ＠パパエンジニア',
    role: 'アプリ開発者',
    avatarUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=100&q=80', // 柴犬アバター
    isVerified: true,
    badges: ['公認クリエイター', '人気作者'],
};

// ダミーの活動実績（3つのステータス）
const activityStats = [
    { id: 'played', label: 'あそんだ', value: 12, unit: '回', emoji: '🙌' },
    { id: 'posted', label: '投稿', value: 3, unit: '件', emoji: '🚀' },
    { id: 'wakaru', label: 'わかるー', value: 156, unit: '', emoji: '🧡' },
];

// 設定メニュー
const menuItems = [
    {
        id: 'manage-apps',
        label: '投稿したアプリの管理',
        icon: FileEdit,
        onClick: () => console.log('投稿したアプリの管理'),
    },
    {
        id: 'notifications',
        label: '通知設定',
        icon: Bell,
        onClick: () => console.log('通知設定'),
    },
    {
        id: 'help',
        label: 'ヘルプ・お問い合わせ',
        icon: HelpCircle,
        onClick: () => console.log('ヘルプ・お問い合わせ'),
    },
    {
        id: 'logout',
        label: 'ログアウト',
        icon: LogOut,
        onClick: () => console.log('ログアウト'),
        danger: true,
    },
];

export default function ProfilePage() {
    return (
        <div className="min-h-screen">
            {/* ヘッダー */}
            <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-gray-700">マイページ</h1>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* メインコンテンツ */}
            <main className="pb-24 px-4 pt-4">
                {/* プロフィールカード */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-orange-100 mb-4"
                >
                    {/* プロフィール上部：アバター中央配置 */}
                    <div className="flex flex-col items-center mb-4">
                        {/* アバター */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center mb-3 shadow-md">
                            {userData.avatarUrl ? (
                                <img
                                    src={userData.avatarUrl}
                                    alt={userData.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-10 h-10 text-orange-400" />
                            )}
                        </div>

                        {/* ユーザー名 */}
                        <div className="flex items-center gap-1.5 mb-1">
                            <h2 className="text-base font-bold text-gray-700">
                                {userData.name}
                            </h2>
                            {userData.isVerified && (
                                <BadgeCheck className="w-4 h-4 text-blue-500" />
                            )}
                        </div>

                        {/* 役割 */}
                        <p className="text-xs text-gray-500 mb-2">
                            {userData.role}
                        </p>

                        {/* バッジ */}
                        <div className="flex flex-wrap justify-center gap-1">
                            {userData.badges.map((badge) => (
                                <span
                                    key={badge}
                                    className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium"
                                >
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* ステータス：3つ横並び */}
                    <div className="grid grid-cols-3 gap-2">
                        {activityStats.map((stat, index) => (
                            <motion.div
                                key={stat.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 text-center shadow-sm border border-orange-100"
                            >
                                {/* 絵文字 */}
                                <div className="text-2xl mb-1">{stat.emoji}</div>
                                {/* 数値 */}
                                <p className="text-xl font-bold text-gray-700">
                                    {stat.value}
                                    <span className="text-xs font-normal text-gray-400 ml-0.5">
                                        {stat.unit}
                                    </span>
                                </p>
                                {/* ラベル */}
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* 設定メニュー */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <h3 className="text-sm font-bold text-gray-700 mb-3">
                        設定
                    </h3>
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                        {menuItems.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={item.onClick}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-orange-50 transition-colors ${
                                        index !== menuItems.length - 1
                                            ? 'border-b border-gray-100'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <IconComponent
                                            className={`w-5 h-5 ${
                                                item.danger
                                                    ? 'text-red-400'
                                                    : 'text-gray-400'
                                            }`}
                                        />
                                        <span
                                            className={`text-sm ${
                                                item.danger
                                                    ? 'text-red-500'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* フッター */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        Wakaroo v1.0.0
                    </p>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
