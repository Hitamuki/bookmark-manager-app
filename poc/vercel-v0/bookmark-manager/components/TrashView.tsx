"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useApp } from "../context/AppContext"
import { ItemCard } from "./ItemCard"
import { ItemForm } from "./ItemForm"
import type { BookmarkItem } from "../types"
import { Trash2, RotateCcw } from "lucide-react"

export function TrashView() {
  const { getItemsByStatus, updateItem, items, setItems } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BookmarkItem | undefined>()

  const deletedItems = getItemsByStatus("削除")

  const handleEdit = (item: BookmarkItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleRestore = (item: BookmarkItem) => {
    updateItem(item.id, { status: "未読" })
  }

  const handlePermanentDelete = (itemId: string) => {
    if (confirm("このアイテムを完全に削除しますか？この操作は取り消せません。")) {
      // 実際にアイテムを配列から削除
      const updatedItems = items.filter((item) => item.id !== itemId)
      // setItemsがない場合は、contextを更新する別の方法を使用
      localStorage.setItem(
        "bookmark-app-state",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("bookmark-app-state") || "{}"),
          items: updatedItems,
        }),
      )
      window.location.reload() // 簡単な更新方法
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(undefined)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center">
          <Trash2 className="mr-2 h-8 w-8" />
          ゴミ箱
        </h2>
        <div className="text-sm text-gray-500">{deletedItems.length}件のアイテム</div>
      </div>

      {deletedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deletedItems.map((item) => (
            <div key={item.id} className="relative">
              <div className="opacity-60">
                <ItemCard item={item} onEdit={handleEdit} />
              </div>
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button size="sm" variant="outline" onClick={() => handleRestore(item)} className="bg-white">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  復元
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handlePermanentDelete(item.id)}>
                  完全削除
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Trash2 className="mx-auto h-12 w-12 mb-4 text-gray-300" />
          <p>ゴミ箱は空です。</p>
        </div>
      )}

      {showForm && <ItemForm item={editingItem} onClose={handleCloseForm} />}
    </div>
  )
}
