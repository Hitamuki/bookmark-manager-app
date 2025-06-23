"use client"

import { AppProvider, useApp } from "../context/AppContext"
import { Header } from "../components/Header"
import { Sidebar } from "../components/Sidebar"
import { Dashboard } from "../components/Dashboard"
import { GroupView } from "../components/GroupView"
import { TreeView } from "../components/TreeView"
import { CalendarView } from "../components/CalendarView"
import { ArchiveView } from "../components/ArchiveView"
import { TrashView } from "../components/TrashView"

function AppContent() {
  const { currentView } = useApp()

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />
      case "groups":
        return <GroupView />
      case "tree":
        return <TreeView />
      case "calendar":
        return <CalendarView />
      case "archive":
        return <ArchiveView />
      case "trash":
        return <TrashView />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">{renderCurrentView()}</main>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
