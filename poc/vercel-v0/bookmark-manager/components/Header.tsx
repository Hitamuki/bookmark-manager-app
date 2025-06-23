"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useApp } from "../context/AppContext"
import type { Profile } from "../types"
import { User, Settings } from "lucide-react"

export function Header() {
  const { currentProfile, setCurrentProfile } = useApp()

  return (
    <header className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">ブックマーク管理</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <Select value={currentProfile} onValueChange={(value: Profile) => setCurrentProfile(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="プライベート">プライベート</SelectItem>
                <SelectItem value="ビジネス">ビジネス</SelectItem>
                <SelectItem value="学習">学習</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
