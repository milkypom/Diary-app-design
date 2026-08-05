import { useState, useCallback, useEffect } from "react"
import type { Memo, Page } from "./lib/types"
import { initSampleData, getMemo, deleteMemo } from "./lib/storage"
import FeedPage from "./components/FeedPage"
import SearchPage from "./components/SearchPage"
import MyPage from "./components/MyPage"
import BookmarkPage from "./components/BookmarkPage"
import SettingsPage from "./components/SettingsPage"
import TagEditPage from "./components/TagEditPage"
import EditorModal from "./components/EditorModal"
import BottomNav from "./components/BottomNav"
import PostDetailPage from "./components/PostDetailPage"

initSampleData()

const PAGE_LABELS: Record<Page, string> = {
  home: "CONTACT.",
  search: "Search",
  my: "My Page",
  bookmark: "Saved",
  settings: "Settings",
  tagEdit: "Edit Tags",
}

export default function App() {
  const [page, setPage] = useState<Page>("home")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedMemoId, setSelectedMemoId] = useState<number | null>(null)
  // undefined = editor closed, null = new entry, Memo = editing
  const [editing, setEditing] = useState<Memo | null | undefined>(undefined)
  const [pageStack, setPageStack] = useState<Page[]>(["home"])

  // Remove dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const openNew = () => setEditing(null)
  const openEdit = (memo: Memo) => setEditing(memo)
  const closeEditor = () => setEditing(undefined)
  const handleSave = () => {
    closeEditor()
    refresh()
  }
  const handleSelectMemo = (id: number) => {
    setPageStack([...pageStack, page])
    setSelectedMemoId(id)
  }

  const handlePageChange = (newPage: Page) => {
    setSelectedMemoId(null)
    setPageStack([newPage])
    setPage(newPage)
  }

  const handleSettingsClick = () => {
    setPageStack([...pageStack, "settings"])
    setPage("settings")
  }

  const handleBackFromSettings = () => {
    const newStack = [...pageStack]
    newStack.pop()
    const previousPage = newStack[newStack.length - 1] || "home"
    setPageStack(newStack)
    setPage(previousPage)
  }

  const handleTagEditClick = () => {
    setPageStack([...pageStack, "tagEdit"])
    setPage("tagEdit")
  }

  const handleBackFromTagEdit = () => {
    const newStack = [...pageStack]
    newStack.pop()
    const previousPage = newStack[newStack.length - 1] || "home"
    setPageStack(newStack)
    setPage(previousPage)
  }

  return (
    <div className="min-h-screen flex justify-center bg-[#e8e3dd]">
      <div className="w-full max-w-[480px] min-h-screen relative shadow-[0_0_40px_rgba(0,0,0,0.06)] bg-white">
        {/* Sticky header */}
        {!selectedMemoId && (
          <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-4 backdrop-blur-sm border-b bg-white/95 border-[#f0ede8]">
          <div className="flex items-center gap-3">
            {(page === "settings" || page === "tagEdit") && (
              <button
                onClick={page === "settings" ? handleBackFromSettings : handleBackFromTagEdit}
                className="w-8 h-8 flex items-center justify-center transition-colors text-lg text-[#bbb] hover:text-[#555]"
                aria-label="Back"
              >
                ‹
              </button>
            )}
            <h1
              className="font-sans text-[19px] font-bold leading-none not-italic text-[#1a1a1a]"
            >
              {PAGE_LABELS[page]}
            </h1>
          </div>
          {page === "my" && (
            <button
              onClick={handleSettingsClick}
              className="w-8 h-8 flex items-center justify-center transition-colors text-lg text-[#bbb] hover:text-[#555]"
              aria-label="Settings"
            >
              ⚙️
            </button>
          )}
        </header>
        )}

        {/* Page content */}
        <main className="pb-16">
          {selectedMemoId ? (
            <PostDetailPage
              memo={getMemo(selectedMemoId)}
              currentPage={pageStack[pageStack.length - 1] || "home"}
              onBack={() => {
                setSelectedMemoId(null)
                setPage(pageStack[pageStack.length - 1] || "home")
              }}
              onEdit={openEdit}
              onDelete={(id) => {
                deleteMemo(id)
                setSelectedMemoId(null)
                setPage(pageStack[pageStack.length - 1] || "home")
                refresh()
              }}
              onRefresh={refresh}
            />
          ) : page === "home" ? (
            <FeedPage
              refreshKey={refreshKey}
              onEdit={openEdit}
              onRefresh={refresh}
              selectedMemoId={selectedMemoId}
              onClearSelection={() => setSelectedMemoId(null)}
              onSelectMemo={handleSelectMemo}
              onTagEditClick={handleTagEditClick}
            />
          ) : page === "search" ? (
            <SearchPage onEdit={openEdit} onRefresh={refresh} onSelectMemo={handleSelectMemo} />
          ) : page === "my" ? (
            <MyPage
              refreshKey={refreshKey}
              onEdit={openEdit}
              onSelectMemo={handleSelectMemo}
            />
          ) : page === "settings" ? (
            <SettingsPage refreshKey={refreshKey} onRefresh={refresh} onTagEditClick={handleTagEditClick} />
          ) : page === "tagEdit" ? (
            <TagEditPage refreshKey={refreshKey} onRefresh={refresh} />
          ) : (
            <BookmarkPage
              refreshKey={refreshKey}
              onEdit={openEdit}
              onRefresh={refresh}
            />
          )}
        </main>

        {/* Bottom navigation */}
        <BottomNav current={selectedMemoId ? (pageStack[pageStack.length - 1] || "home") : page} onChange={handlePageChange} onNew={openNew} />

        {/* Editor modal — editing !== undefined means it's open */}
        {editing !== undefined && (
          <EditorModal
            memo={editing}
            onSave={handleSave}
            onClose={closeEditor}
          />
        )}
      </div>
    </div>
  )
}
