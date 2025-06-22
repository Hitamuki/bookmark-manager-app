"use client";

import React, { useState } from 'react';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { BookmarkList } from '@/components/BookmarkList';
import { BookmarkForm } from '@/components/BookmarkForm';
import { CalendarView } from '@/components/CalendarView';
import { Bookmark } from '@/types';

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setEditingBookmark(null);
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setActiveView('edit');
  };

  const handleSaveBookmark = () => {
    setEditingBookmark(null);
    setActiveView('dashboard');
  };

  const handleCancelEdit = () => {
    setEditingBookmark(null);
    setActiveView('dashboard');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} />;
      case 'calendar':
        return <CalendarView onEdit={handleEditBookmark} />;
      case 'add':
        return (
          <BookmarkForm
            onSave={handleSaveBookmark}
            onCancel={handleCancelEdit}
          />
        );
      case 'edit':
        return (
          <BookmarkForm
            bookmark={editingBookmark || undefined}
            onSave={handleSaveBookmark}
            onCancel={handleCancelEdit}
          />
        );
      case 'all':
      case 'bookmarks':
      case 'reading-list':
      case 'unread':
      case 'reading':
      case 'completed':
      case 'paused':
      case 'archived':
        return (
          <BookmarkList
            filter={activeView}
            onEdit={handleEditBookmark}
          />
        );
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <ProfileProvider>
      <div className="flex h-screen bg-background">
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </ProfileProvider>
  );
}