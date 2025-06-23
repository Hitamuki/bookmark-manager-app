"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useApp } from "../context/AppContext"
import type { BookmarkItem, Status } from "../types"
import { X } from "lucide-react"

interface ItemFormProps {
  item?: BookmarkItem
  folderId?: string // この行を追加
  onClose: () => void
}

export function ItemForm({ item, folderId, onClose }: ItemFormProps) {
  const { addItem, updateItem, categories, tags, currentProfile } = useApp()

  const [formData, setFormData] = useState({
    title: item?.title || "",
    url: item?.url || "",
    memo: item?.memo || "",
    categoryId: item?.categoryId || "",
    tagIds: item?.tagIds || [],
    status: item?.status || ("未定" as Status),
    startDate: item?.startDate ? item.startDate.toISOString().slice(0, 16) : "",
    endDate: item?.endDate ? item.endDate.toISOString().slice(0, 16) : "",
    reminderDate: item?.reminderDate ? item.reminderDate.toISOString().slice(0, 16) : "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const itemData = {
      title: formData.title,
      url: formData.url,
      memo: formData.memo,
      categoryId: formData.categoryId,
      tagIds: formData.tagIds,
      status: formData.status,
      profile: currentProfile,
      folderId: folderId || item?.folderId, // この行を追加
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      reminderDate: formData.reminderDate ? new Date(formData.reminderDate) : undefined,
    }

    if (item) {
      updateItem(item.id, itemData)
    } else {
      addItem(itemData)
    }

    onClose()
  }

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{item ? "アイテム編集" : "新規アイテム"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">タイトル *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="memo">メモ</Label>
              <Textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => setFormData((prev) => ({ ...prev, memo: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">カテゴリ</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">ステータス</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Status) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="未定">未定</SelectItem>
                    <SelectItem value="未読">未読</SelectItem>
                    <SelectItem value="進行中">進行中</SelectItem>
                    <SelectItem value="保留">保留</SelectItem>
                    <SelectItem value="完了">完了</SelectItem>
                    <SelectItem value="アーカイブ">アーカイブ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>タグ</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={formData.tagIds.includes(tag.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag.id)}
                  >
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">開始日時</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="endDate">終了日時</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="reminderDate">リマインド</Label>
                <Input
                  id="reminderDate"
                  type="datetime-local"
                  value={formData.reminderDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reminderDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit">{item ? "更新" : "作成"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
