import { useState, useEffect } from 'react'
import { downloadExportFile, importData, getTheme, saveTheme, getDeletedMemos, restoreMemo, permanentDeleteMemo, emptyTrash, getTagListStyle, saveTagListStyle, type ExportData } from '../lib/storage'
import type { Theme, Memo, TagListStyle } from '../lib/types'

interface Props {
  refreshKey?: number
  onRefresh?: () => void
  onTagEditClick?: () => void
}

export default function SettingsPage({ refreshKey, onRefresh, onTagEditClick }: Props) {
  const [tagListStyle, setTagListStyle] = useState<TagListStyle>('circle')
  const [theme, setTheme] = useState<Theme>('auto')
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [deletedMemos, setDeletedMemos] = useState<Memo[]>([])
  const [permanentlyDeleting, setPermanentlyDeleting] = useState<number | null>(null)

  useEffect(() => {
    setTagListStyle(getTagListStyle())
    setTheme(getTheme())
    setDeletedMemos(getDeletedMemos())
  }, [refreshKey])
 
  const handleTagListStyleChange = (style: TagListStyle) => {
    setTagListStyle(style)
    saveTagListStyle(style)
    onRefresh?.()
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    saveTheme(newTheme)
    onRefresh?.()
  }

  const handleExport = () => {
    downloadExportFile()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as ExportData
        const result = importData(data)
        setImportStatus(result)
        if (result.success) {
          onRefresh?.()
        }
      } catch (error) {
        setImportStatus({ success: false, message: 'Failed to parse file' })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleRestore = (id: number) => {
    restoreMemo(id)
    setDeletedMemos(getDeletedMemos())
    onRefresh?.()
  }

  const handlePermanentDelete = (id: number) => {
    if (confirm('Permanently delete this entry? This cannot be undone.')) {
      permanentDeleteMemo(id)
      setDeletedMemos(getDeletedMemos())
      onRefresh?.()
    }
  }

  const handleEmptyTrash = () => {
    if (confirm(`Permanently delete all ${deletedMemos.length} items in trash? This cannot be undone.`)) {
      emptyTrash()
      setDeletedMemos([])
      onRefresh?.()
    }
  }

  return (
    <div className="px-5 py-6">
      <h2 className="text-[20px] font-semibold text-[#1a1a1a] mb-6">Settings</h2>

      {/* Tag Management Link */}
      <div className="mb-8">
        <button
          onClick={onTagEditClick}
          className="w-full px-4 py-3 bg-[#faf9f7] rounded-xl border border-[#f0ede8] flex items-center justify-between hover:bg-[#f0ede8] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🏷️</span>
            <span className="text-[14px] font-medium text-[#1a1a1a]">Edit Tags</span>
          </div>
          <span className="text-[#bbb]">›</span>
        </button>
      </div>

      {/* Theme Setting */}
      <div className="mb-8">
        <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-4">Theme</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              theme === 'light'
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-[#e8e3dd] bg-white text-[#1a1a1a] hover:border-[#c87941]'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">☀️</span>
              <span className="text-[12px] font-medium">Light</span>
            </div>
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-[#e8e3dd] bg-white text-[#1a1a1a] hover:border-[#c87941]'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🌙</span>
              <span className="text-[12px] font-medium">Dark</span>
            </div>
          </button>
          <button
            onClick={() => handleThemeChange('auto')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              theme === 'auto'
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-[#e8e3dd] bg-white text-[#1a1a1a] hover:border-[#c87941]'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🔄</span>
              <span className="text-[12px] font-medium">Auto</span>
            </div>
          </button>
        </div>
      </div>

      {/* Data Management Section */}
      <h2 className="text-[20px] font-semibold text-[#1a1a1a] mb-6 mt-8">Data Management</h2>

      {/* Export/Import */}
      <div className="mb-8">
        <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-4">Export/Import Data</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-3 bg-[#1a1a1a] text-white text-[14px] font-medium rounded-xl hover:bg-[#333] transition-colors"
          >
            Export Data
          </button>
          <label className="flex-1 px-4 py-3 bg-[#e8e3dd] text-[#1a1a1a] text-[14px] font-medium rounded-xl hover:bg-[#d0c9c0] transition-colors text-center cursor-pointer">
            Import Data
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        {importStatus && (
          <div className={`mt-3 px-4 py-2 rounded-lg text-[13px] ${importStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {importStatus.message}
          </div>
        )}
      </div>

      {/* Trash Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold text-[#1a1a1a]">Trash</h3>
          <button
            onClick={() => setShowTrash(!showTrash)}
            className="text-[13px] text-[#c87941] font-medium"
          >
            {showTrash ? 'Hide' : 'Show'} ({deletedMemos.length})
          </button>
        </div>

        {showTrash && (
          <div className="space-y-2">
            {deletedMemos.length === 0 ? (
              <div className="text-center py-8 text-[#9a9a9a] text-[14px]">
                Trash is empty
              </div>
            ) : (
              <>
                {deletedMemos.map(memo => (
                  <div
                    key={memo.id}
                    className="flex items-center justify-between px-4 py-3 bg-[#faf9f7] rounded-xl border border-[#f0ede8]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#1a1a1a] truncate">{memo.title}</p>
                      <p className="text-[12px] text-[#999]">{memo.date}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => handleRestore(memo.id)}
                        className="px-3 py-1 bg-[#1a1a1a] text-white text-[12px] rounded-lg font-medium hover:bg-[#333] transition-colors"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(memo.id)}
                        className="px-3 py-1 bg-red-500 text-white text-[12px] rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {deletedMemos.length > 0 && (
                  <button
                    onClick={handleEmptyTrash}
                    className="w-full px-4 py-3 bg-red-500 text-white text-[14px] font-medium rounded-xl hover:bg-red-600 transition-colors mt-4"
                  >
                    Empty Trash
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
