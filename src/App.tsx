import { useState, useCallback, useEffect } from "react"
import type { Memo, Page } from "./lib/types"
import { initSampleData, getMemo, deleteMemo, migrateStoredImages } from "./lib/storage"
import FeedPage from "./components/FeedPage"
import SearchPage from "./components/SearchPage"
import MyPage from "./components/MyPage"
import BookmarkPage from "./components/BookmarkPage"
import SettingsPage from "./components/SettingsPage"
import TagEditPage from "./components/TagEditPage"
import EditorModal from "./components/EditorModal"
import BottomNav from "./components/BottomNav"
import PostDetailPage from "./components/PostDetailPage"
import ThemedLayout from "./components/ThemedLayout"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import { hydrateStoredImages } from "./lib/imageStore"

initSampleData()

const PAGE_LABELS: Record<Page, string> = {
  home: "FEED_LOG",
  search: "SEARCH_LOG",
  my: "MY_PAGE",
  bookmark: "SAVED_DRAFTS",
  settings: "SYSTEM_CONFIG",
  tagEdit: "TAG_MANAGE",
}

function AppContent() {
  const [page, setPage] = useState<Page>("home")
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedMemoId, setSelectedMemoId] = useState<number | null>(null)
  // undefined = editor closed, null = new entry, Memo = editing
  const [editing, setEditing] = useState<Memo | null | undefined>(undefined)
  const [pageStack, setPageStack] = useState<Page[]>(["home"])
  const [imagesReady, setImagesReady] = useState(false)
  const [storyTag, setStoryTag] = useState<string | null>(null)
  const [storyReturnTag, setStoryReturnTag] = useState<string | null>(null)
  const { theme } = useTheme()

  // Remove dark mode class on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    migrateStoredImages()
      .then(hydrateStoredImages)
      .catch(() => undefined)
      .finally(() => setImagesReady(true))
  }, [])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  if (!imagesReady) {
    return <div className={`min-h-screen ${theme.bg}`} />
  }
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
    setStoryReturnTag(null)
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
    <ThemedLayout>
      {/* Sticky header */}
      {!selectedMemoId && (
        <header className={`sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b-2 ${theme.border} ${theme.cardBg} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
          <div className="flex items-center gap-3">
            {(page === "settings" || page === "tagEdit") && (
              <button
                onClick={page === "settings" ? handleBackFromSettings : handleBackFromTagEdit}
                className={`w-8 h-8 flex items-center justify-center transition-colors text-lg border-2 ${theme.border} ${theme.chipBg} hover:bg-black hover:text-white`}
                aria-label="Back"
              >
                ‹
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-current bg-black text-white flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Y2K
              </div>
              <h1
                className="text-base font-black tracking-widest uppercase"
              >
                {PAGE_LABELS[page]}
              </h1>
            </div>
          </div>
          {page === "my" && (
            <button
              onClick={handleSettingsClick}
              className={`w-8 h-8 flex items-center justify-center transition-colors text-lg border-2 ${theme.border} ${theme.chipBg} hover:bg-black hover:text-white`}
              aria-label="Settings"
            >
              ⚙️
            </button>
          )}
        </header>
      )}

      {/* Page content */}
      <main className="pb-20 p-4">
        {selectedMemoId ? (
          <PostDetailPage
            memo={getMemo(selectedMemoId)}
            currentPage={pageStack[pageStack.length - 1] || "home"}
            onBack={() => {
              setSelectedMemoId(null)
              if (storyReturnTag) {
                setPageStack(["home"])
                setPage("home")
                setStoryTag(storyReturnTag)
                setStoryReturnTag(null)
              } else {
                setPage(pageStack[pageStack.length - 1] || "home")
              }
            }}
            onEdit={openEdit}
            onDelete={(id) => {
              deleteMemo(id)
              setSelectedMemoId(null)
              setPage(pageStack[pageStack.length - 1] || "home")
              refresh()
            }}
            onRefresh={refresh}
            onTagClick={(tag) => {
              setSelectedMemoId(null)
              setPageStack(["home"])
              setPage("home")
              setStoryTag(tag)
            }}
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
            storyTag={storyTag}
            onStoryTagOpened={() => setStoryTag(null)}
            onOpenStoryPost={(id, tag) => {
              setStoryReturnTag(tag)
              handleSelectMemo(id)
            }}
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
    </ThemedLayout>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
