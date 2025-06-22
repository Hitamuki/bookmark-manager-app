"use client";

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus, Bookmark as BookmarkIcon, BookOpen, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BookmarkFormProps {
  bookmark?: Bookmark;
  onSave: () => void;
  onCancel: () => void;
}

export function BookmarkForm({ bookmark, onSave, onCancel }: BookmarkFormProps) {
  const { currentProfile } = useProfile();
  const { addBookmark, updateBookmark } = useBookmarks(currentProfile.id);
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    tags: [] as string[],
    status: 'unread' as const,
    priority: 'medium' as const,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    notes: '',
    type: 'bookmark' as 'bookmark' | 'reading-list'
  });

  const [newTag, setNewTag] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  const categories = [
    'テクノロジー',
    'ビジネス',
    'エンターテイメント',
    'ニュース',
    '教育',
    'デザイン',
    'その他'
  ];

  useEffect(() => {
    if (bookmark) {
      setFormData({
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description || '',
        category: bookmark.category,
        tags: bookmark.tags,
        status: bookmark.status,
        priority: bookmark.priority,
        startDate: bookmark.startDate,
        endDate: bookmark.endDate,
        notes: bookmark.notes,
        type: bookmark.type
      });

      // 既存の日時から時刻を抽出
      if (bookmark.startDate) {
        setStartTime(format(bookmark.startDate, 'HH:mm'));
      }
      if (bookmark.endDate) {
        setEndTime(format(bookmark.endDate, 'HH:mm'));
      }
    }
  }, [bookmark]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = formData.category === 'custom' ? customCategory : formData.category;
    
    if (!formData.title || !formData.url || !finalCategory) {
      alert('タイトル、URL、カテゴリは必須項目です。');
      return;
    }

    // 日付と時刻を結合
    let finalStartDate = formData.startDate;
    let finalEndDate = formData.endDate;

    if (formData.startDate && startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      finalStartDate = new Date(formData.startDate);
      finalStartDate.setHours(hours, minutes, 0, 0);
    }

    if (formData.endDate && endTime) {
      const [hours, minutes] = endTime.split(':').map(Number);
      finalEndDate = new Date(formData.endDate);
      finalEndDate.setHours(hours, minutes, 0, 0);
    }

    const bookmarkData = {
      ...formData,
      category: finalCategory,
      profile: currentProfile.id,
      startDate: finalStartDate,
      endDate: finalEndDate
    };

    if (bookmark) {
      updateBookmark(bookmark.id, bookmarkData);
    } else {
      addBookmark(bookmarkData);
    }

    onSave();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {bookmark ? 'アイテムを編集' : '新しいアイテムを追加'}
          </CardTitle>
          <CardDescription>
            {currentProfile.name}プロファイルに追加されます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            {!bookmark && (
              <div className="space-y-2">
                <Label htmlFor="type">タイプ *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="タイプを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bookmark">
                      <div className="flex items-center gap-2">
                        <BookmarkIcon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">ブックマーク</div>
                          <div className="text-xs text-muted-foreground">永続的に保存するリンク</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="reading-list">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <div>
                          <div className="font-medium">リーディングリスト</div>
                          <div className="text-xs text-muted-foreground">一時的に保存、読後にアーカイブ</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={formData.type === 'bookmark' ? 'ブックマークのタイトル' : '記事のタイトル'}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={formData.type === 'bookmark' ? 'ブックマークの説明' : '記事の概要や読む理由'}
                rows={3}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">カスタム...</SelectItem>
                </SelectContent>
              </Select>
              {formData.category === 'custom' && (
                <Input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="カスタムカテゴリ名"
                />
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>タグ</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="タグを入力"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">ステータス</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unread">未読</SelectItem>
                    <SelectItem value="reading">読書中</SelectItem>
                    <SelectItem value="completed">完了</SelectItem>
                    <SelectItem value="paused">保留中</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">優先度</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <Label className="text-base font-medium">スケジュール設定</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date and Time */}
                <div className="space-y-3">
                  <Label>開始予定日時</Label>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? (
                            format(formData.startDate, "yyyy/MM/dd", { locale: ja })
                          ) : (
                            "開始日を選択"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {formData.startDate && (
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="時刻を選択" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* End Date and Time */}
                <div className="space-y-3">
                  <Label>
                    {formData.type === 'reading-list' ? '読了予定日時' : '終了予定日時'}
                  </Label>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? (
                            format(formData.endDate, "yyyy/MM/dd", { locale: ja })
                          ) : (
                            formData.type === 'reading-list' ? '読了予定日を選択' : '終了日を選択'
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {formData.endDate && (
                      <Select value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="時刻を選択" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              {/* Date/Time Preview */}
              {(formData.startDate || formData.endDate) && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="font-medium mb-1">設定されたスケジュール:</div>
                  {formData.startDate && (
                    <div>
                      開始: {format(formData.startDate, 'yyyy年MM月dd日', { locale: ja })} {startTime}
                    </div>
                  )}
                  {formData.endDate && (
                    <div>
                      {formData.type === 'reading-list' ? '読了予定' : '終了'}: {format(formData.endDate, 'yyyy年MM月dd日', { locale: ja })} {endTime}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                {formData.type === 'bookmark' ? 'メモ' : '読書メモ・感想'}
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={formData.type === 'bookmark' ? 'メモや感想を入力' : '読書中のメモや感想、重要なポイントなど'}
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                キャンセル
              </Button>
              <Button type="submit">
                {bookmark ? '更新' : '追加'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}