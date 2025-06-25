"use client"

// プロジェクトの骨組み（フロントエンド: Next.js + Tailwind CSS）
// これはアプリのレイアウトと基本構造の初期コードです

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Star } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [selectedProfile, setSelectedProfile] = useState("all");

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📚 Bookmark ✕ ToDo Dashboard</h1>
        <div className="flex gap-2">
          <Input placeholder="検索..." className="w-64" />
          <Button variant="outline"><Search /></Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label>プロファイル:</label>
        <select
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
          className="p-2 rounded border"
        >
          <option value="all">全て</option>
          <option value="private">プライベート</option>
          <option value="business">ビジネス</option>
          <option value="study">学習</option>
        </select>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList>
          <TabsTrigger value="status">ステータス別</TabsTrigger>
          <TabsTrigger value="category">カテゴリ別</TabsTrigger>
          <TabsTrigger value="tag">タグ別</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['未着手', '進行中', '完了'].map((status) => (
              <Card key={status} className="bg-white shadow-md">
                <CardContent className="p-4">
                  <h2 className="font-bold mb-2">{status}</h2>
                  {/* アイテムリスト */}
                  <div className="space-y-2">
                    <div className="p-2 border rounded flex justify-between items-center">
                      <div>
                        <p className="font-semibold">React公式ドキュメント</p>
                        <p className="text-sm text-gray-500">https://react.dev/</p>
                      </div>
                      <Star size={16} className="text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* カテゴリ・タグなどの他の表示も同様に実装 */}
      </Tabs>

      <Button className="fixed bottom-4 right-4 rounded-full p-4" variant="default">
        <Plus />
      </Button>
    </div>
  );
}
