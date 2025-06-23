"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { AppState, BookmarkItem, Category, Tag, Profile, Status, Folder } from "../types"
import { useLocalStorage } from "../hooks/useLocalStorage"

interface AppContextType extends AppState {
  addItem: (item: Omit<BookmarkItem, "id" | "createdAt" | "updatedAt">) => void
  updateItem: (id: string, updates: Partial<BookmarkItem>) => void
  deleteItem: (id: string) => void
  addCategory: (category: Omit<Category, "id">) => void
  addTag: (tag: Omit<Tag, "id">) => void
  setCurrentProfile: (profile: Profile) => void
  setCurrentView: (view: AppState["currentView"]) => void
  getItemsByProfile: () => BookmarkItem[]
  getItemsByStatus: (status: Status) => BookmarkItem[]
  addFolder: (folder: Omit<Folder, "id" | "createdAt" | "updatedAt">) => void
  updateFolder: (id: string, updates: Partial<Folder>) => void
  deleteFolder: (id: string) => void
  moveItem: (itemId: string, targetFolderId?: string) => void
  moveFolder: (folderId: string, targetFolderId?: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const initialState: AppState = {
  items: [],
  folders: [],
  categories: [
    { id: "1", name: "技術記事", color: "#3b82f6" },
    { id: "2", name: "ニュース", color: "#ef4444" },
    { id: "3", name: "学習資料", color: "#10b981" },
  ],
  tags: [
    { id: "1", name: "React", color: "#61dafb" },
    { id: "2", name: "JavaScript", color: "#f7df1e" },
    { id: "3", name: "重要", color: "#f59e0b" },
  ],
  currentProfile: "プライベート",
  currentView: "dashboard",
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorage<AppState>("bookmark-app-state", initialState)

  const addItem = (item: Omit<BookmarkItem, "id" | "createdAt" | "updatedAt">) => {
    const newItem: BookmarkItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setState((prev) => ({ ...prev, items: [...prev.items, newItem] }))
  }

  const updateItem = (id: string, updates: Partial<BookmarkItem>) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item)),
    }))
  }

  const deleteItem = (id: string) => {
    updateItem(id, { status: "削除" })
  }

  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    }
    setState((prev) => ({ ...prev, categories: [...prev.categories, newCategory] }))
  }

  const addTag = (tag: Omit<Tag, "id">) => {
    const newTag: Tag = {
      ...tag,
      id: Date.now().toString(),
    }
    setState((prev) => ({ ...prev, tags: [...prev.tags, newTag] }))
  }

  const setCurrentProfile = (profile: Profile) => {
    setState((prev) => ({ ...prev, currentProfile: profile }))
  }

  const setCurrentView = (view: AppState["currentView"]) => {
    setState((prev) => ({ ...prev, currentView: view }))
  }

  const getItemsByProfile = () => {
    return state.items.filter((item) => item.profile === state.currentProfile && item.status !== "削除")
  }

  const getItemsByStatus = (status: Status) => {
    return state.items.filter((item) => item.status === status && item.profile === state.currentProfile)
  }

  const addFolder = (folder: Omit<Folder, "id" | "createdAt" | "updatedAt">) => {
    const newFolder: Folder = {
      ...folder,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setState((prev) => ({ ...prev, folders: [...prev.folders, newFolder] }))
  }

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.map((folder) =>
        folder.id === id ? { ...folder, ...updates, updatedAt: new Date() } : folder,
      ),
    }))
  }

  const deleteFolder = (id: string) => {
    // フォルダ内のアイテムを親フォルダに移動
    setState((prev) => ({
      ...prev,
      folders: prev.folders.filter((folder) => folder.id !== id),
      items: prev.items.map((item) => (item.folderId === id ? { ...item, folderId: undefined } : item)),
    }))
  }

  const moveItem = (itemId: string, targetFolderId?: string) => {
    updateItem(itemId, { folderId: targetFolderId })
  }

  const moveFolder = (folderId: string, targetFolderId?: string) => {
    updateFolder(folderId, { parentId: targetFolderId })
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        addItem,
        updateItem,
        deleteItem,
        addCategory,
        addTag,
        setCurrentProfile,
        setCurrentView,
        getItemsByProfile,
        getItemsByStatus,
        addFolder,
        updateFolder,
        deleteFolder,
        moveItem,
        moveFolder,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
