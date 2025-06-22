"use client";

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  Search, 
  Calendar,
  Clock,
  Flag,
  BookOpen,
  CheckCircle,
  PauseCircle,
  Star,
  Archive,
  ArchiveRestore,
  Bookmark as BookmarkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface BookmarkListProps {
  filter: string;
  onEdit: (bookmark: Bookmark) => void;
}

export function BookmarkList({ filter, onEdit }: BookmarkListProps) {
  const { currentProfile } = useProfile();
  const { bookmarks, updateBookmark, deleteBookmark } = useBookmarks(currentProfile.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'reading': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused': return <PauseCircle className="w-4 h-4 text-gray-500" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unread': return '未読';
      case 'reading': return '読書中';
      case 'completed': return '完了';
      case 'paused': return '保留中';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getFilterTitle = (filter: string) => {
    switch (filter) {
      case 'all': return 'すべてのアイテム';
      case 'bookmarks': return 'ブックマーク';
      case 'reading-list': return 'リーディングリスト';
      case 'unread': return '未読';
      case 'reading': return '読書中';
      case 'completed': return '完了';
      case 'paused': return '保留中';
      case 'archived': return 'アーカイブ';
      default: return 'アイテム';
    }
  };

  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      // アーカイブフィルター
      if (filter === 'archived') {
        return bookmark.isArchived;
      } else if (filter !== 'all') {
        if (bookmark.isArchived) return false;
      }

      // タイプフィルター
      if (filter === 'bookmarks' && bookmark.type !== 'bookmark') return false;
      if (filter === 'reading-list' && bookmark.type !== 'reading-list') return false;
      
      // ステータスフィルター
      if (['unread', 'reading', 'completed', 'paused'].includes(filter) && bookmark.status !== filter) {
        return false;
      }
      
      // 検索クエリ適用
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          bookmark.title.toLowerCase().includes(query) ||
          bookmark.description?.toLowerCase().includes(query) ||
          bookmark.tags.some(tag => tag.toLowerCase().includes(query)) ||
          bookmark.category.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'endDate':
          if (!a.endDate && !b.endDate) return 0;
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleStatusChange = (bookmarkId: string, newStatus: string) => {
    updateBookmark(bookmarkId, { status: newStatus as any });
  };

  const handleArchive = (bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (bookmark?.type === 'reading-list' && bookmark.status === 'completed') {
      updateBookmark(bookmarkId, { isArchived: true });
    }
  };

  const handleUnarchive = (bookmarkId: string) => {
    updateBookmark(bookmarkId, { isArchived: false });
  };

  const handleDelete = (bookmarkId: string) => {
    if (confirm('このアイテムを削除しますか？')) {
      deleteBookmark(bookmarkId);
    }
  };

  const isOverdue = (bookmark: Bookmark) => {
    return bookmark.endDate && 
           new Date(bookmark.endDate) < new Date() && 
           bookmark.status !== 'completed';
  };

  const canArchive = (bookmark: Bookmark) => {
    return bookmark.type === 'reading-list' && 
           bookmark.status === 'completed' && 
           !bookmark.isArchived;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {getFilterTitle(filter)}
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredBookmarks.length}件のアイテム
          </p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="アイテムを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="並び順" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">作成日時</SelectItem>
            <SelectItem value="title">タイトル</SelectItem>
            <SelectItem value="priority">優先度</SelectItem>
            <SelectItem value="endDate">期限日</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookmark List */}
      <div className="grid gap-4">
        {filteredBookmarks.length > 0 ? (
          filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className={`hover:shadow-md transition-all ${isOverdue(bookmark) ? 'border-red-200 bg-red-50/50' : ''} ${bookmark.isArchived ? 'opacity-75' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {bookmark.type === 'bookmark' ? 
                        <BookmarkIcon className="w-4 h-4 text-blue-500" /> : 
                        <BookOpen className="w-4 h-4 text-green-500" />
                      }
                      {getStatusIcon(bookmark.status)}
                      <span className="truncate">{bookmark.title}</span>
                      {isOverdue(bookmark) && (
                        <Badge variant="destructive" className="text-xs">
                          期限切れ
                        </Badge>
                      )}
                      {bookmark.isArchived && (
                        <Badge variant="outline" className="text-xs">
                          アーカイブ済み
                        </Badge>
                      )}
                    </CardTitle>
                    {bookmark.description && (
                      <CardDescription className="mt-1">
                        {bookmark.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className={`w-4 h-4 ${getPriorityColor(bookmark.priority)}`} />
                    {!bookmark.isArchived && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(bookmark)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {canArchive(bookmark) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(bookmark.id)}
                            title="アーカイブ"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                    {bookmark.isArchived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnarchive(bookmark.id)}
                        title="アーカイブから復元"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(bookmark.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Type and Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={bookmark.type === 'bookmark' ? 'default' : 'secondary'}>
                      {bookmark.type === 'bookmark' ? 'ブックマーク' : 'リーディングリスト'}
                    </Badge>
                    <Badge variant="secondary">{bookmark.category}</Badge>
                    {bookmark.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Dates */}
                  {(bookmark.startDate || bookmark.endDate) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {bookmark.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          開始: {format(new Date(bookmark.startDate), 'MM/dd', { locale: ja })}
                        </div>
                      )}
                      {bookmark.endDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {bookmark.type === 'reading-list' ? '読了予定' : '期限'}: {format(new Date(bookmark.endDate), 'MM/dd', { locale: ja })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {!bookmark.isArchived && (
                        <Select
                          value={bookmark.status}
                          onValueChange={(value) => handleStatusChange(bookmark.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unread">未読</SelectItem>
                            <SelectItem value="reading">読書中</SelectItem>
                            <SelectItem value="completed">完了</SelectItem>
                            <SelectItem value="paused">保留中</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {bookmark.estimatedReadTime && (
                        <span className="text-sm text-muted-foreground">
                          約{bookmark.estimatedReadTime}分
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(bookmark.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      開く
                    </Button>
                  </div>

                  {/* Notes */}
                  {bookmark.notes && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      {bookmark.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? '検索条件に一致するアイテムが見つかりません' : 'まだアイテムがありません'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}