export type Status = "未定" | "未読" | "進行中" | "保留" | "完了" | "アーカイブ" | "削除"
export type Profile = "プライベート" | "ビジネス" | "学習"

export interface Category {
  id: string
  name: string
  color: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface BookmarkItem {
  id: string
  title: string
  url?: string
  memo: string
  categoryId?: string
  tagIds: string[]
  status: Status
  profile: Profile
  startDate?: Date
  endDate?: Date
  reminderDate?: Date
  createdAt: Date
  updatedAt: Date
  folderId?: string // parentIdをfolderIdに変更
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  profile: Profile
  createdAt: Date
  updatedAt: Date
}

export interface TreeNode {
  id: string
  type: "folder" | "item"
  data: Folder | BookmarkItem
  children: TreeNode[]
}

export interface AppState {
  items: BookmarkItem[]
  folders: Folder[] // この行を追加
  categories: Category[]
  tags: Tag[]
  currentProfile: Profile
  currentView: "dashboard" | "groups" | "tree" | "calendar" | "archive" | "trash"
}
