"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useApp } from "../context/AppContext"
import type { Folder } from "../types"
import { X } from "lucide-react"

interface FolderFormProps {
  folder?: Folder
  parentId?: string
  onClose: () => void
}

export function FolderForm({ folder, parentId, onClose }: FolderFormProps) {
  const { addFolder, updateFolder, currentProfile } = useApp()

  const [formData, setFormData] = useState({
    name: folder?.name || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const folderData = {
      name: formData.name,
      parentId: parentId,
      profile: currentProfile,
    }

    if (folder) {
      updateFolder(folder.id, folderData)
    } else {
      addFolder(folderData)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{folder ? "フォルダ編集" : "新規フォルダ"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">フォルダ名 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                placeholder="フォルダ名を入力"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit">{folder ? "更新" : "作成"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
