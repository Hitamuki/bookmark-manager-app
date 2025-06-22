"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/contexts/ProfileContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
  Star,
  Clock,
  CheckCircle,
  PauseCircle,
  Plus,
  Search,
  Settings,
  BarChart3,
  Home,
  Bookmark as BookmarkIcon,
  Archive,
  Calendar
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

export function Sidebar({ activeView, onViewChange, className }: SidebarProps) {
  const { currentProfile, switchProfile, profiles } = useProfile();
  const { getDashboardStats } = useBookmarks(currentProfile.id);
  const stats = getDashboardStats();

  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: Home },
    { id: 'calendar', label: 'カレンダー', icon: Calendar },
    { id: 'all', label: 'すべて', icon: BookOpen, count: stats.totalBookmarks + stats.totalReadingList },
    { id: 'bookmarks', label: 'ブックマーク', icon: BookmarkIcon, count: stats.totalBookmarks },
    { id: 'reading-list', label: 'リーディングリスト', icon: BookOpen, count: stats.totalReadingList },
    { id: 'unread', label: '未読', icon: Star, count: stats.unreadCount },
    { id: 'reading', label: '読書中', icon: Clock, count: stats.readingCount },
    { id: 'completed', label: '完了', icon: CheckCircle, count: stats.completedCount },
    { id: 'paused', label: '保留中', icon: PauseCircle },
    { id: 'archived', label: 'アーカイブ', icon: Archive, count: stats.archivedCount },
  ];

  return (
    <div className={cn("w-64 bg-card border-r border-border h-full flex flex-col", className)}>
      {/* Profile Selector */}
      <div className="p-4 border-b border-border">
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">プロファイル</h2>
          <div className="grid gap-1">
            {profiles.map((profile) => (
              <Button
                key={profile.id}
                variant={currentProfile.id === profile.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => switchProfile(profile.id)}
                className="justify-start gap-2 h-8"
              >
                <div className={cn("w-2 h-2 rounded-full", profile.color)} />
                {profile.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewChange(item.id)}
                className="w-full justify-between h-9"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('add')}
            className="w-full justify-start gap-2 h-9 text-primary"
          >
            <Plus className="w-4 h-4" />
            新規追加
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('analytics')}
            className="w-full justify-start gap-2 h-9"
          >
            <BarChart3 className="w-4 h-4" />
            分析
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('settings')}
            className="w-full justify-start gap-2 h-9"
          >
            <Settings className="w-4 h-4" />
            設定
          </Button>
        </div>
      </div>
    </div>
  );
}