"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "../context/AppContext"
import { ItemForm } from "./ItemForm"
import { FolderForm } from "./FolderForm"
import type { BookmarkItem, Folder, TreeNode } from "../types"
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  Edit,
  Trash2,
  Plus,
  FolderIcon,
  FileText,
  FolderPlus,
} from "lucide-react"

export function TreeView() {
  const {
    getItemsByProfile,
    folders,
    deleteItem,
    deleteFolder,
    categories,
    tags,
    currentProfile,
    moveItem,
    moveFolder,
  } = useApp()

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showItemForm, setShowItemForm] = useState(false)
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BookmarkItem | undefined>()
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>()
  const [targetFolderId, setTargetFolderId] = useState<string | undefined>()
  const [draggedItem, setDraggedItem] = useState<{ type: "item" | "folder"; id: string } | null>(null)

  const items = getItemsByProfile()
  const currentFolders = folders.filter((folder) => folder.profile === currentProfile)

  // ツリー構造を構築
  const buildTree = (): TreeNode[] => {
    const folderMap = new Map<string, TreeNode>()
    const itemMap = new Map<string, TreeNode>()
    const rootNodes: TreeNode[] = []

    // フォルダノードを作成
    currentFolders.forEach((folder) => {
      const node: TreeNode = {
        id: folder.id,
        type: "folder",
        data: folder,
        children: [],
      }
      folderMap.set(folder.id, node)
    })

    // アイテムノードを作成
    items.forEach((item) => {
      const node: TreeNode = {
        id: item.id,
        type: "item",
        data: item,
        children: [],
      }
      itemMap.set(item.id, node)
    })

    // フォルダの親子関係を構築
    currentFolders.forEach((folder) => {
      const node = folderMap.get(folder.id)!
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId)!.children.push(node)
      } else {
        rootNodes.push(node)
      }
    })

    // アイテムをフォルダに配置
    items.forEach((item) => {
      const node = itemMap.get(item.id)!
      if (item.folderId && folderMap.has(item.folderId)) {
        folderMap.get(item.folderId)!.children.push(node)
      } else {
        rootNodes.push(node)
      }
    })

    // 子要素をソート（フォルダが先、その後アイテム）
    const sortChildren = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type === "folder" && b.type === "item") return -1
        if (a.type === "item" && b.type === "folder") return 1

        const aName = a.type === "folder" ? (a.data as Folder).name : (a.data as BookmarkItem).title
        const bName = b.type === "folder" ? (b.data as Folder).name : (b.data as BookmarkItem).title
        return aName.localeCompare(bName)
      })

      nodes.forEach((node) => {
        if (node.children.length > 0) {
          sortChildren(node.children)
        }
      })
    }

    sortChildren(rootNodes)
    return rootNodes
  }

  const treeNodes = buildTree()

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedItems(newExpanded)
  }

  const handleEditItem = (item: BookmarkItem) => {
    setEditingItem(item)
    setTargetFolderId(undefined)
    setShowItemForm(true)
  }

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder)
    setTargetFolderId(undefined)
    setShowFolderForm(true)
  }

  const handleAddItem = (folderId?: string) => {
    setEditingItem(undefined)
    setTargetFolderId(folderId)
    setShowItemForm(true)
  }

  const handleAddFolder = (parentId?: string) => {
    setEditingFolder(undefined)
    setTargetFolderId(parentId)
    setShowFolderForm(true)
  }

  const handleCloseItemForm = () => {
    setShowItemForm(false)
    setEditingItem(undefined)
    setTargetFolderId(undefined)
  }

  const handleCloseFolderForm = () => {
    setShowFolderForm(false)
    setEditingFolder(undefined)
    setTargetFolderId(undefined)
  }

  const handleDragStart = (e: React.DragEvent, type: "item" | "folder", id: string) => {
    setDraggedItem({ type, id })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetType: "folder" | "root", targetId?: string) => {
    e.preventDefault()

    if (!draggedItem) return

    if (draggedItem.type === "item") {
      moveItem(draggedItem.id, targetType === "folder" ? targetId : undefined)
    } else if (draggedItem.type === "folder") {
      // フォルダを自分自身や子フォルダにドロップすることを防ぐ
      if (targetId !== draggedItem.id) {
        moveFolder(draggedItem.id, targetType === "folder" ? targetId : undefined)
      }
    }

    setDraggedItem(null)
  }

  const renderTreeNode = (node: TreeNode, level = 0) => {
    const isExpanded = expandedItems.has(node.id)
    const hasChildren = node.children.length > 0

    if (node.type === "folder") {
      const folder = node.data as Folder

      return (
        <div key={node.id} className="mb-2">
          <Card
            className="hover:shadow-sm transition-shadow cursor-move"
            draggable
            onDragStart={(e) => handleDragStart(e, "folder", node.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "folder", node.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center space-x-2" style={{ marginLeft: `${level * 24}px` }}>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpanded(node.id)}>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>

                <FolderIcon className="h-5 w-5 text-blue-600" />

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{folder.name}</h4>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleAddItem(node.id)}
                        title="アイテムを追加"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleAddFolder(node.id)}
                        title="サブフォルダを追加"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditFolder(folder)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteFolder(node.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isExpanded && hasChildren && (
            <div className="mt-2">{node.children.map((child) => renderTreeNode(child, level + 1))}</div>
          )}
        </div>
      )
    } else {
      const item = node.data as BookmarkItem
      const category = categories.find((c) => c.id === item.categoryId)
      const itemTags = tags.filter((t) => item.tagIds.includes(t.id))

      return (
        <div key={node.id} className="mb-2">
          <Card
            className="hover:shadow-sm transition-shadow cursor-move"
            draggable
            onDragStart={(e) => handleDragStart(e, "item", node.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center space-x-2" style={{ marginLeft: `${level * 24}px` }}>
                <div className="w-6 h-6 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-gray-500" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.status}
                        </Badge>
                        {category && (
                          <Badge variant="outline" className="text-xs" style={{ borderColor: category.color }}>
                            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: category.color }} />
                            {category.name}
                          </Badge>
                        )}
                        {itemTags.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs" style={{ borderColor: tag.color }}>
                            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditItem(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteItem(node.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center">
          <FolderTree className="mr-2 h-8 w-8" />
          ツリー構造
        </h2>
        <div className="flex space-x-2">
          <Button onClick={() => handleAddFolder()}>
            <FolderPlus className="mr-2 h-4 w-4" />
            新規フォルダ
          </Button>
          <Button onClick={() => handleAddItem()}>
            <Plus className="mr-2 h-4 w-4" />
            新規アイテム
          </Button>
        </div>
      </div>

      <div
        className="min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg p-4"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, "root")}
      >
        {treeNodes.length > 0 ? (
          <div className="space-y-2">{treeNodes.map((node) => renderTreeNode(node))}</div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FolderTree className="mx-auto h-12 w-12 mb-4 text-gray-300" />
            <p>フォルダやアイテムがありません。</p>
            <p>「新規フォルダ」または「新規アイテム」ボタンから作成してください。</p>
          </div>
        )}
      </div>

      {showItemForm && <ItemForm item={editingItem} folderId={targetFolderId} onClose={handleCloseItemForm} />}

      {showFolderForm && (
        <FolderForm folder={editingFolder} parentId={targetFolderId} onClose={handleCloseFolderForm} />
      )}
    </div>
  )
}
