"use client";

import { useState, useEffect } from 'react';
import { Bookmark, DashboardStats } from '@/types';
import { BookmarkStore } from '@/lib/data';

export function useBookmarks(profile?: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const store = BookmarkStore.getInstance();

  const refreshBookmarks = () => {
    setBookmarks(store.getBookmarks(profile));
  };

  useEffect(() => {
    refreshBookmarks();
    setLoading(false);
  }, [profile]);

  const addBookmark = (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    store.addBookmark(bookmark);
    refreshBookmarks();
  };

  const updateBookmark = (id: string, updates: Partial<Bookmark>) => {
    store.updateBookmark(id, updates);
    refreshBookmarks();
  };

  const deleteBookmark = (id: string) => {
    store.deleteBookmark(id);
    refreshBookmarks();
  };

  const searchBookmarks = (query: string) => {
    return store.searchBookmarks(query, profile);
  };

  const getDashboardStats = (): DashboardStats => {
    return store.getDashboardStats(profile || 'private');
  };

  return {
    bookmarks,
    loading,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    searchBookmarks,
    getDashboardStats,
    refreshBookmarks
  };
}