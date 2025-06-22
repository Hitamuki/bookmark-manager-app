"use client";

import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Plus,
  Bookmark as BookmarkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const { currentProfile } = useProfile();
  const { bookmarks, getDashboardStats } = useBookmarks(currentProfile.id);
  const stats = getDashboardStats();

  const recentBookmarks = bookmarks
    .filter(b => !b.isArchived)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const overdueBookmarks = bookmarks.filter(b => 
    b.endDate && 
    new Date(b.endDate) < new Date() && 
    b.status !== 'completed' &&
    !b.isArchived
  );

  const upcomingBookmarks = bookmarks
    .filter(b => 
      b.endDate && 
      new Date(b.endDate) > new Date() && 
      new Date(b.endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
      !b.isArchived
    )
    .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
    .slice(0, 3);

  const completionRate = stats.totalBookmarks + stats.totalReadingList > 0 
    ? Math.round((stats.completedCount / (stats.totalBookmarks + stats.totalReadingList)) * 100) 
    : 0;

  const statCards = [
    {
      title: 'ブックマーク',
      value: stats.totalBookmarks,
      icon: BookmarkIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      onClick: () => onViewChange('bookmarks')
    },
    {
      title: 'リーディングリスト',
      value: stats.totalReadingList,
      icon: BookOpen,
      color: 'text-green-600',
      bg: 'bg-green-50',
      onClick: () => onViewChange('reading-list')
    },
    {
      title: '未読',
      value: stats.unreadCount,
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      onClick: () => onViewChange('unread')
    },
    {
      title: '完了',
      value: stats.completedCount,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      onClick: () => onViewChange('completed')
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ダッシュボード</h1>
          <p className="text-muted-foreground mt-1">
            {currentProfile.name}プロファイルの概要
          </p>
        </div>
        <Button onClick={() => onViewChange('add')} className="gap-2">
          <Plus className="w-4 h-4" />
          新規追加
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              進捗状況
            </CardTitle>
            <CardDescription>
              読書の進捗と完了率
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>完了率</span>
                <span>{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            {stats.overdueCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">
                  {stats.overdueCount}件の期限切れアイテムがあります
                </span>
              </div>
            )}

            {/* Upcoming Items */}
            {upcomingBookmarks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">今週の予定</h4>
                {upcomingBookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                    <span className="truncate">{bookmark.title}</span>
                    <span className="text-blue-600 text-xs">
                      {format(new Date(bookmark.endDate!), 'MM/dd HH:mm', { locale: ja })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>
              よく使用する機能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => onViewChange('unread')}
            >
              <Star className="w-4 h-4" />
              未読を見る ({stats.unreadCount})
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => onViewChange('reading')}
            >
              <Clock className="w-4 h-4" />
              読書中を見る ({stats.readingCount})
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => onViewChange('reading-list')}
            >
              <BookOpen className="w-4 h-4" />
              リーディングリスト ({stats.totalReadingList})
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={() => onViewChange('add')}
            >
              <Plus className="w-4 h-4" />
              新規追加
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            最近のアイテム
          </CardTitle>
          <CardDescription>
            最近追加されたアイテム
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookmarks.length > 0 ? (
            <div className="space-y-3">
              {recentBookmarks.map((bookmark) => (
                <div key={bookmark.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {bookmark.type === 'bookmark' ? 
                        <BookmarkIcon className="w-4 h-4 text-blue-500" /> : 
                        <BookOpen className="w-4 h-4 text-green-500" />
                      }
                      <p className="font-medium truncate">{bookmark.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {bookmark.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {bookmark.category}
                      </Badge>
                      <Badge 
                        variant={
                          bookmark.status === 'completed' ? 'default' :
                          bookmark.status === 'reading' ? 'secondary' :
                          'outline'
                        }
                        className="text-xs"
                      >
                        {bookmark.status === 'unread' ? '未読' :
                         bookmark.status === 'reading' ? '読書中' :
                         bookmark.status === 'completed' ? '完了' : '保留中'}
                      </Badge>
                      {bookmark.endDate && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(bookmark.endDate), 'MM/dd HH:mm', { locale: ja })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              まだアイテムがありません
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}