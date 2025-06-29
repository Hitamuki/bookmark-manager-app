import {
  Archive,
  Bookmark,
  Calendar,
  Clock,
  ExternalLink,
  Filter,
  Flag,
  Folder,
  Menu,
  Plus,
  Search,
  Star,
  Tag,
  Trash,
  X
} from 'lucide-react';
import React, { useState } from 'react';

// 型定義
interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  memo?: string;
  category: string;
  tags: string[];
  status: 'undefined' | 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'archived' | 'deleted';
  priority: 'high' | 'medium' | 'low';
  startDate?: string;
  endDate?: string;
  reminder?: string;
  profileId: string;
  folderId?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  profileId: string;
  children?: Folder[];
  items?: BookmarkItem[];
}

const BookmarkTodoApp = () => {
  // State管理
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentProfile, setCurrentProfile] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<BookmarkItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // サンプルデータ
  const [profiles] = useState<Profile[]>([
    { id: 'all', name: '全て', color: 'bg-gray-500', icon: '📚' },
    { id: 'private', name: 'プライベート', color: 'bg-blue-500', icon: '🏠' },
    { id: 'business', name: 'ビジネス', color: 'bg-green-500', icon: '💼' },
    { id: 'learning', name: '学習', color: 'bg-purple-500', icon: '📖' },
  ]);

  const [items] = useState<BookmarkItem[]>([
    {
      id: '1',
      title: 'React公式ドキュメント',
      url: 'https://react.dev',
      description: 'React v18の新機能について学ぶ',
      memo: 'Suspenseとconcurrent featuresを重点的に',
      category: 'フロントエンド',
      tags: ['React', 'JavaScript', 'Web開発'],
      status: 'in_progress',
      priority: 'high',
      startDate: '2025-06-20',
      endDate: '2025-06-25',
      profileId: 'learning',
      isFavorite: true,
      createdAt: '2025-06-20T10:00:00Z',
      updatedAt: '2025-06-22T15:30:00Z'
    },
    {
      id: '2',
      title: 'TypeScript Deep Dive',
      url: 'https://basarat.gitbook.io/typescript/',
      description: 'TypeScriptの詳細なガイド',
      memo: '型システムの理解を深める',
      category: 'プログラミング',
      tags: ['TypeScript', 'プログラミング'],
      status: 'not_started',
      priority: 'medium',
      profileId: 'learning',
      isFavorite: false,
      createdAt: '2025-06-21T09:00:00Z',
      updatedAt: '2025-06-21T09:00:00Z'
    },
    {
      id: '3',
      title: '新しいプロジェクトのアイデア',
      url: 'https://example.com/ideas',
      description: 'サイドプロジェクトのアイデア集',
      memo: 'AI活用のアプリケーション開発',
      category: 'アイデア',
      tags: ['プロジェクト', 'AI', '開発'],
      status: 'undefined',
      priority: 'low',
      profileId: 'private',
      isFavorite: false,
      createdAt: '2025-06-19T14:00:00Z',
      updatedAt: '2025-06-19T14:00:00Z'
    }
  ]);

  // ステータスラベル
  const statusLabels = {
    'undefined': '未定',
    'not_started': '未着手',
    'in_progress': '進行中',
    'on_hold': '保留',
    'completed': '完了',
    'archived': 'アーカイブ',
    'deleted': '削除'
  };

  // 優先度ラベル
  const priorityLabels = {
    'high': '高',
    'medium': '中',
    'low': '低'
  };

  // 優先度カラー
  const priorityColors = {
    'high': 'text-red-600',
    'medium': 'text-yellow-600',
    'low': 'text-green-600'
  };

  // ステータスカラー
  const statusColors = {
    'undefined': 'bg-gray-100 text-gray-800',
    'not_started': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'on_hold': 'bg-orange-100 text-orange-800',
    'completed': 'bg-green-100 text-green-800',
    'archived': 'bg-purple-100 text-purple-800',
    'deleted': 'bg-red-100 text-red-800'
  };

  // フィルタリングされたアイテム
  const filteredItems = items.filter(item => {
    const matchesProfile = currentProfile === 'all' || item.profileId === currentProfile;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProfile && matchesSearch;
  });

  // サイドバーメニュー項目
  const sidebarItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'tree', label: 'ツリー表示', icon: <Folder className="w-5 h-5" /> },
    { id: 'calendar', label: 'カレンダー', icon: <Calendar className="w-5 h-5" /> },
    { id: 'favorites', label: 'お気に入り', icon: <Star className="w-5 h-5" /> },
    { id: 'archive', label: 'アーカイブ', icon: <Archive className="w-5 h-5" /> },
    { id: 'trash', label: 'ゴミ箱', icon: <Trash className="w-5 h-5" /> },
  ];

  // アイテム詳細モーダル
  const ItemModal = ({ item, onClose }: { item: BookmarkItem; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {item.url}
            </a>
          </div>

          {item.description && (
            <div>
              <h3 className="font-medium mb-2">説明</h3>
              <p className="text-gray-700">{item.description}</p>
            </div>
          )}

          {item.memo && (
            <div>
              <h3 className="font-medium mb-2">メモ</h3>
              <p className="text-gray-700">{item.memo}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">ステータス</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                {statusLabels[item.status]}
              </span>
            </div>

            <div>
              <h3 className="font-medium mb-2">優先度</h3>
              <span className={`flex items-center gap-1 ${priorityColors[item.priority]}`}>
                <Flag className="w-4 h-4" />
                {priorityLabels[item.priority]}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">カテゴリ</h3>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
              {item.category}
            </span>
          </div>

          {item.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">タグ</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(item.startDate || item.endDate) && (
            <div>
              <h3 className="font-medium mb-2">スケジュール</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {item.startDate && `開始: ${item.startDate}`}
                {item.startDate && item.endDate && ' - '}
                {item.endDate && `終了: ${item.endDate}`}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            編集
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );

  // アイテムカード
  const ItemCard = ({ item }: { item: BookmarkItem }) => (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedItem(item)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
        {item.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
      </div>

      {item.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
            {statusLabels[item.status]}
          </span>
          <span className={`text-xs ${priorityColors[item.priority]}`}>
            {priorityLabels[item.priority]}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {item.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 2 && (
            <span className="text-xs text-gray-500">+{item.tags.length - 2}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* サイドバー */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {sidebarOpen && <h1 className="text-xl font-bold text-gray-900">BookmarkTodo</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* プロファイル選択 */}
          {sidebarOpen && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">プロファイル</label>
              <select
                value={currentProfile}
                onChange={(e) => setCurrentProfile(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.icon} {profile.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ナビゲーション */}
          <nav className="space-y-1">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentView === 'dashboard' && 'ダッシュボード'}
              {currentView === 'tree' && 'ツリー表示'}
              {currentView === 'calendar' && 'カレンダー'}
              {currentView === 'favorites' && 'お気に入り'}
              {currentView === 'archive' && 'アーカイブ'}
              {currentView === 'trash' && 'ゴミ箱'}
            </h2>

            <div className="flex items-center gap-3">
              {/* 検索バー */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="アイテムを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* フィルターボタン */}
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* 新規追加ボタン */}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                新規追加
              </button>
            </div>
          </div>
        </header>

        {/* メインエリア */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentView === 'dashboard' && (
            <div>
              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">総アイテム数</p>
                      <p className="text-2xl font-bold text-gray-900">{filteredItems.length}</p>
                    </div>
                    <Bookmark className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">進行中</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {filteredItems.filter(item => item.status === 'in_progress').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">完了</p>
                      <p className="text-2xl font-bold text-green-600">
                        {filteredItems.filter(item => item.status === 'completed').length}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">お気に入り</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {filteredItems.filter(item => item.isFavorite).length}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>

              {/* アイテム一覧 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {currentView !== 'dashboard' && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-lg">{currentView === 'tree' && 'ツリー表示'}
                 {currentView === 'calendar' && 'カレンダー'}
                 {currentView === 'favorites' && 'お気に入り'}
                 {currentView === 'archive' && 'アーカイブ'}
                 {currentView === 'trash' && 'ゴミ箱'}機能は開発中です</p>
            </div>
          )}
        </main>
      </div>

      {/* アイテム詳細モーダル */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default BookmarkTodoApp;
