export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  tags: string[];
  status: 'unread' | 'reading' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  startDate?: Date;
  endDate?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  profile: 'private' | 'business' | 'learning';
  favicon?: string;
  estimatedReadTime?: number;
  type: 'bookmark' | 'reading-list';
  isArchived?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  profile: 'private' | 'business' | 'learning';
}

export interface Profile {
  id: 'private' | 'business' | 'learning';
  name: string;
  color: string;
  icon: string;
}

export interface DashboardStats {
  totalBookmarks: number;
  totalReadingList: number;
  unreadCount: number;
  readingCount: number;
  completedCount: number;
  overdueCount: number;
  archivedCount: number;
}