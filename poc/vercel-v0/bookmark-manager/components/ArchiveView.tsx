"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useApp } from "../context/AppContext"
import { ItemCard } from "./ItemCard"
import { ItemForm } from "./ItemForm"
import type { BookmarkItem } from "../types"
import { Archive } from "lucide-react"

export function ArchiveView() {
  const { getItemsByStatus, updateItem } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BookmarkItem | undefined>()

  const archivedItems = getItemsByStatus("アーカイブ")

  const handleEdit = (item: BookmarkItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleRestore = (item: BookmarkItem) => {
    updateItem(item.id, { status: "未読" })
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingItem(undefined)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center">
          <Archive className="mr-2 h-8 w-8" />
          アーカイブ
        </h2>
        <div className="text-sm text-gray-500">{archivedItems.length}件のアイテム</div>
      </div>

      {archivedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archivedItems.map((item) => (
            <div key={item.id} className="relative">
              <ItemCard item={item} onEdit={handleEdit} />
              <div className="absolute top-2 right-2">
                <Button size="sm" variant="outline" onClick={() => handleRestore(item)} className="bg-white">
                  復元
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Archive className="mx-auto h-12 w-12 mb-4 text-gray-300" />
          <p>アーカイブされたアイテムはありません。</p>
        </div>
      )}

      {showForm && <ItemForm item={editingItem} onClose={handleCloseForm} />}
    </div>
  )
}
