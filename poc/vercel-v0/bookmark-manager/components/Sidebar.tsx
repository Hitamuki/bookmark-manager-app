"use client"

import { Button } from "@/components/ui/button"
import { useApp } from "../context/AppContext"
import { LayoutDashboard, FolderTree, Calendar, Archive, Trash2, Layers } from "lucide-react"

export function Sidebar() {
  const { currentView, setCurrentView } = useApp()

  const menuItems = [
    { id: "dashboard", label: "ダッシュボード", icon: LayoutDashboard },
    { id: "groups", label: "グループ管理", icon: Layers },
    { id: "tree", label: "ツリー構造", icon: FolderTree },
    { id: "calendar", label: "カレンダー", icon: Calendar },
    { id: "archive", label: "アーカイブ", icon: Archive },
    { id: "trash", label: "ゴミ箱", icon: Trash2 },
  ] as const

  return (
    <aside className="w-64 bg-gray-50 border-r min-h-screen">
      <nav className="p-4 space-y-2">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={currentView === id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView(id)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
