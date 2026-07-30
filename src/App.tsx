import { useState, useCallback } from "react"
import type { Memo, Page } from "./lib/types"
import { initSampleData, getMemo, deleteMemo } from "./lib/storage"
import FeedPage from "./components/FeedPage"
import SearchPage from "./components/SearchPage"
import MyPage from "./components/MyPage"
import BookmarkPage from "./components/BookmarkPage"
import EditorModal from "./components/EditorModal"
import BottomNav from "./components/BottomNav"
import PostDetailPage from "./components/PostDetailPage"

initSampleData()

const PAGE_LABELS: Record<Page, string> = {
  home: "DayLOG",
  search: "Search",
  my: "My Page",
  bookmark: "Saved",
}

export default function App() {
  const [page, setPage] = useState<Page>("home")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedMemoId, setSelectedMemoId] = useState<number | null>(null)
  // undefined = editor closed, null = new entry, Memo = editing
  const [editing, setEditing] = useState<Memo | null | undefined>(undefined)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const openNew = () => setEditing(null)
  const openEdit = (memo: Memo) => setEditing(memo)
  const closeEditor = () => setEditing(undefined)
  const handleSave = () => {
    closeEditor()
    refresh()
  }
  const handleSelectMemo = (id: number) => {
    setSelectedMemoId(id)
    setPage("home")
  }

  return (
    <div className="min-h-screen bg-[#e8e3dd] flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen bg-white relative shadow-[0_0_40px_rgba(0,0,0,0.06)]">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 flex items-center px-5 py-4 bg-white/95 backdrop-blur-sm border-b border-[#f0ede8]">
          <h1
            className={`font-serif text-[22px] font-bold text-[#1a1a1a] leading-none ${
              page === "home" ? "italic" : "not-italic text-[19px]"
            }`}
          >
            {PAGE_LABELS[page]}
          </h1>
        </header>

        {/* Page content */}
        <main className="pb-16">
          {page === "home" && selectedMemoId ? (
            <PostDetailPage
              memo={getMemo(selectedMemoId)}
              onBack={() => setSelectedMemoId(null)}
              onEdit={openEdit}
              onDelete={(id) => {
                deleteMemo(id)
                setSelectedMemoId(null)
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
            />
          ) : page === "search" ? (
            <SearchPage onEdit={openEdit} onRefresh={refresh} />
          ) : page === "my" ? (
            <MyPage
              refreshKey={refreshKey}
              onEdit={openEdit}
              onSelectMemo={handleSelectMemo}
            />
          ) : (
            <BookmarkPage
              refreshKey={refreshKey}
              onEdit={openEdit}
              onRefresh={refresh}
            />
          )}
        </main>

        {/* Bottom navigation */}
        <BottomNav current={page} onChange={setPage} onNew={openNew} />

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
