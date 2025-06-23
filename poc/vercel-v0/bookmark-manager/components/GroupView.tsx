"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "../context/AppContext"
import { ItemCard } from "./ItemCard"
import { ItemForm } from "./ItemForm"
import type { BookmarkItem } from "../types"

export function GroupView() {
  const { getItemsByProfile, categories, tags } = useApp()
  const [groupBy, setGroupBy] = useState<"status" | "category" | "tag">("status")
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BookmarkItem | undefined>()

  const items = getItemsByProfile()

  const groupItems = () => {
    const groups: { [key: string]: BookmarkItem[] } = {}

    items.forEach((item) => {
      let groupKeys: string[] = []

      switch (groupBy) {
        case "status":
          groupKeys = [item.status]
          break
        case "category":
          const category = categories.find((c) => c.id === item.categoryId)
          groupKeys = [category?.name || "未分類"]
          break
        case "tag":
          groupKeys =
            item.tagIds.length > 0
              ? item.tagIds.map((tagId) => tags.find((t) => t.id === tagId)?.name || "不明")
              : ["タグなし"]
          break
      }

      groupKeys.forEach((key) => {
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(item)
      })
    })

    return groups
  }

  const groups = groupItems()

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
        <h2 className="text-3xl font-bold">グループ管理</h2>
        <Select value={groupBy} onValueChange={(value: "status" | "category" | "tag") => setGroupBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status">ステータス別</SelectItem>
            <SelectItem value="category">カテゴリ別</SelectItem>
            <SelectItem value="tag">タグ別</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {Object.entries(groups).map(([groupName, groupItems]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{groupName}</span>
                <span className="text-sm font-normal text-gray-500">{groupItems.length}件</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupItems.map((item) => (
                  <ItemCard key={item.id} item={item} onEdit={handleEdit} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(groups).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>表示するアイテムがありません。</p>
        </div>
      )}

      {showForm && <ItemForm item={editingItem} onClose={handleCloseForm} />}
    </div>
  )
}
