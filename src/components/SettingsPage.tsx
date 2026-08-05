import { useState, useEffect } from 'react'
import { downloadExportFile, importData, getDeletedMemos, restoreMemo, permanentDeleteMemo, emptyTrash, type ExportData } from '../lib/storage'
import type { Memo } from '../lib/types'
import ThemePage from './ThemePage'

interface Props {
  refreshKey?: number
  onRefresh?: () => void
  onTagEditClick?: () => void
}

export default function SettingsPage({ refreshKey, onRefresh, onTagEditClick }: Props) {
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [deletedMemos, setDeletedMemos] = useState<Memo[]>([])
  const [permanentlyDeleting, setPermanentlyDeleting] = useState<number | null>(null)
  const [showThemePage, setShowThemePage] = useState(false)

  useEffect(() => {
    setDeletedMemos(getDeletedMemos())
  }, [refreshKey])

  const handleExport = () => {
    downloadExportFile()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as ExportData
        const result = await importData(data)
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
      {showThemePage ? (
        <ThemePage onBack={() => setShowThemePage(false)} />
      ) : (
        <>
          <h2 className="text-[20px] font-semibold text-[#1a1a1a] mb-6">Settings</h2>

          {/* Theme Selection Link */}
          <div className="mb-8">
            <button
              onClick={() => setShowThemePage(true)}
              className="w-full px-4 py-3 bg-[#1a1a1a] text-white text-[14px] font-medium rounded-xl hover:bg-[#333] transition-colors"
            >
              Theme Selection
            </button>
          </div>

          {/* Tag Management Link */}
          <div className="mb-8">
            <button
              onClick={onTagEditClick}
              className="w-full px-4 py-3 bg-[#1a1a1a] text-white text-[14px] font-medium rounded-xl hover:bg-[#333] transition-colors"
            >
              Edit Tags
            </button>
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
              <label className="flex-1 px-4 py-3 bg-[#1a1a1a] text-white text-[14px] font-medium rounded-xl hover:bg-[#333] transition-colors text-center cursor-pointer">
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
        </>
      )}



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
          <label className="flex-1 px-4 py-3 bg-[#1a1a1a] text-white text-[14px] font-medium rounded-xl hover:bg-[#333] transition-colors text-center cursor-pointer">
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
