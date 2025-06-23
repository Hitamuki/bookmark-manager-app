"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "../context/AppContext"
import { ItemCard } from "./ItemCard"
import { ItemForm } from "./ItemForm"
import type { BookmarkItem } from "../types"
import { Plus, BarChart3 } from "lucide-react"

export function Dashboard() {
  const { getItemsByProfile, getItemsByStatus } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BookmarkItem | undefined>()

  const items = getItemsByProfile()
  const statusCounts = {
    未定: getItemsByStatus("未定").length,
    未読: getItemsByStatus("未読").length,
    進行中: getItemsByStatus("進行中").length,
    保留: getItemsByStatus("保留").length,
    完了: getItemsByStatus("完了").length,
  }

  const handleEdit = (item: BookmarkItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(undefined)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">ダッシュボード</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規アイテム
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{status}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 最近のアイテム */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          最近のアイテム
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 6)
            .map((item) => (
              <ItemCard key={item.id} item={item} onEdit={handleEdit} />
            ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>まだアイテムがありません。</p>
            <p>「新規アイテム」ボタンから最初のアイテムを作成してください。</p>
          </div>
        )}
      </div>

      {showForm && <ItemForm item={editingItem} onClose={handleCloseForm} />}
    </div>
  )
}
