"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "../context/AppContext"
import { ItemForm } from "./ItemForm"
import type { BookmarkItem } from "../types"
import { format, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"

export function CalendarView() {
  const { getItemsByProfile } = useApp()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BookmarkItem | undefined>()

  const items = getItemsByProfile()

  const getItemsForDate = (date: Date) => {
    return items.filter((item) => {
      if (item.startDate && isSameDay(item.startDate, date)) return true
      if (item.endDate && isSameDay(item.endDate, date)) return true
      if (item.reminderDate && isSameDay(item.reminderDate, date)) return true
      return false
    })
  }

  const selectedDateItems = selectedDate ? getItemsForDate(selectedDate) : []

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
      <h2 className="text-3xl font-bold mb-6">カレンダー</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>カレンダー</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ja}
                className="rounded-md border"
                modifiers={{
                  hasItems: (date) => getItemsForDate(date).length > 0,
                }}
                modifiersStyles={{
                  hasItems: { backgroundColor: "#dbeafe", fontWeight: "bold" },
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, "yyyy年M月d日", { locale: ja }) : "日付を選択"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateItems.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEdit(item)}
                    >
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.startDate && isSameDay(item.startDate, selectedDate!) && (
                          <div>開始: {format(item.startDate, "HH:mm")}</div>
                        )}
                        {item.endDate && isSameDay(item.endDate, selectedDate!) && (
                          <div>終了: {format(item.endDate, "HH:mm")}</div>
                        )}
                        {item.reminderDate && isSameDay(item.reminderDate, selectedDate!) && (
                          <div>リマインド: {format(item.reminderDate, "HH:mm")}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">この日にはアイテムがありません。</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showForm && <ItemForm item={editingItem} onClose={handleCloseForm} />}
    </div>
  )
}
