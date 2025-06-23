"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "../context/AppContext"
import type { BookmarkItem } from "../types"
import { Edit, Trash2, ExternalLink, Calendar, Clock } from "lucide-react"

interface ItemCardProps {
  item: BookmarkItem
  onEdit: (item: BookmarkItem) => void
}

export function ItemCard({ item, onEdit }: ItemCardProps) {
  const { deleteItem, categories, tags } = useApp()

  const category = categories.find((c) => c.id === item.categoryId)
  const itemTags = tags.filter((t) => item.tagIds.includes(t.id))

  const getStatusColor = (status: string) => {
    const colors = {
      未定: "bg-gray-100 text-gray-800",
      未読: "bg-blue-100 text-blue-800",
      進行中: "bg-yellow-100 text-yellow-800",
      保留: "bg-orange-100 text-orange-800",
      完了: "bg-green-100 text-green-800",
      アーカイブ: "bg-purple-100 text-purple-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                リンクを開く
              </a>
            )}
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {item.memo && <p className="text-gray-600 text-sm mb-3">{item.memo}</p>}

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>

          {category && (
            <Badge variant="outline" className="border-2" style={{ borderColor: category.color }}>
              <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: category.color }} />
              {category.name}
            </Badge>
          )}

          {itemTags.map((tag) => (
            <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color }}>
              <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </Badge>
          ))}
        </div>

        {(item.startDate || item.endDate || item.reminderDate) && (
          <div className="text-xs text-gray-500 space-y-1">
            {item.startDate && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                開始: {item.startDate.toLocaleString()}
              </div>
            )}
            {item.endDate && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                終了: {item.endDate.toLocaleString()}
              </div>
            )}
            {item.reminderDate && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                リマインド: {item.reminderDate.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
