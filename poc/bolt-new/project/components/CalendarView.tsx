"use client";

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Bookmark as BookmarkIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle,
  PauseCircle
} from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';

interface CalendarViewProps {
  onEdit: (bookmark: Bookmark) => void;
}

export function CalendarView({ onEdit }: CalendarViewProps) {
  const { currentProfile } = useProfile();
  const { bookmarks } = useBookmarks(currentProfile.id);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // 開始予定日時が設定されているアイテムのみフィルタ
  const scheduledBookmarks = bookmarks.filter(b => 
    b.startDate && !b.isArchived
  );

  // 選択された日のアイテム
  const selectedDateBookmarks = scheduledBookmarks.filter(b =>
    b.startDate && isSameDay(new Date(b.startDate), selectedDate)
  );

  // カレンダーに表示する日付にアイテムがあるかチェック
  const hasBookmarksOnDate = (date: Date) => {
    return scheduledBookmarks.some(b =>
      b.startDate && isSameDay(new Date(b.startDate), date)
    );
  };

  // 今月のアイテム数
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthBookmarks = scheduledBookmarks.filter(b =>
    b.startDate && 
    new Date(b.startDate) >= monthStart && 
    new Date(b.startDate) <= monthEnd
  );

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

  const isOverdue = (bookmark: Bookmark) => {
    return bookmark.endDate && 
           new Date(bookmark.endDate) < new Date() && 
           bookmark.status !== 'completed';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">カレンダー</h1>
          <p className="text-muted-foreground mt-1">
            スケジュール設定されたアイテムを表示
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="w-4 h-4" />
          今月: {monthBookmarks.length}件
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {format(currentMonth, 'yyyy年MM月', { locale: ja })}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  今月
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              アイテムがある日付をクリックして詳細を表示
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={ja}
              modifiers={{
                hasBookmarks: (date) => hasBookmarksOnDate(date)
              }}
              modifiersStyles={{
                hasBookmarks: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold'
                }
              }}
              className="rounded-md border"
            />
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span>アイテムあり</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border border-border"></div>
                <span>アイテムなし</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {format(selectedDate, 'MM月dd日', { locale: ja })}
            </CardTitle>
            <CardDescription>
              {selectedDateBookmarks.length}件のアイテム
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateBookmarks.length > 0 ? (
              <div className="space-y-3">
                {selectedDateBookmarks
                  .sort((a, b) => {
                    if (!a.startDate || !b.startDate) return 0;
                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                  })
                  .map((bookmark) => (
                    <div 
                      key={bookmark.id} 
                      className={`p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                        isOverdue(bookmark) ? 'border-red-200 bg-red-50/50' : ''
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {bookmark.type === 'bookmark' ? 
                                <BookmarkIcon className="w-4 h-4 text-blue-500" /> : 
                                <BookOpen className="w-4 h-4 text-green-500" />
                              }
                              {getStatusIcon(bookmark.status)}
                              <span className="font-medium text-sm truncate">
                                {bookmark.title}
                              </span>
                            </div>
                            {bookmark.startDate && (
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(bookmark.startDate), 'HH:mm', { locale: ja })} 開始
                                {bookmark.endDate && (
                                  <span> - {format(new Date(bookmark.endDate), 'HH:mm', { locale: ja })}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(bookmark)}
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
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
                            {getStatusText(bookmark.status)}
                          </Badge>
                          {isOverdue(bookmark) && (
                            <Badge variant="destructive" className="text-xs">
                              期限切れ
                            </Badge>
                          )}
                        </div>

                        {bookmark.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {bookmark.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  この日にはアイテムがありません
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            今後の予定
          </CardTitle>
          <CardDescription>
            今後7日間のスケジュール
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const upcomingBookmarks = scheduledBookmarks
              .filter(b => {
                if (!b.startDate) return false;
                const startDate = new Date(b.startDate);
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return startDate >= now && startDate <= weekFromNow;
              })
              .sort((a, b) => {
                if (!a.startDate || !b.startDate) return 0;
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
              })
              .slice(0, 10);

            return upcomingBookmarks.length > 0 ? (
              <div className="space-y-2">
                {upcomingBookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {bookmark.type === 'bookmark' ? 
                        <BookmarkIcon className="w-4 h-4 text-blue-500 flex-shrink-0" /> : 
                        <BookOpen className="w-4 h-4 text-green-500 flex-shrink-0" />
                      }
                      <span className="truncate">{bookmark.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(bookmark.startDate!), 'MM/dd HH:mm', { locale: ja })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(bookmark.url, '_blank')}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                今後7日間の予定はありません
              </p>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}