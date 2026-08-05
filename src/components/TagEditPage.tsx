import { useState, useEffect } from 'react'
import { getAllTags, renameTag, deleteTag } from '../lib/storage'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  refreshKey?: number
  onRefresh?: () => void
}

export default function TagEditPage({ refreshKey, onRefresh }: Props) {
  const { theme } = useTheme()
  const [tags, setTags] = useState<string[]>([])
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [deletingTag, setDeletingTag] = useState<string | null>(null)

  useEffect(() => {
    setTags(getAllTags())
  }, [refreshKey])

  const handleRename = (oldTag: string) => {
    if (!newTagName.trim() || newTagName.trim() === oldTag) {
      setEditingTag(null)
      setNewTagName('')
      return
    }
    renameTag(oldTag, newTagName.trim())
    setTags(getAllTags())
    setEditingTag(null)
    setNewTagName('')
    onRefresh?.()
  }

  const handleDelete = (tag: string) => {
    if (confirm(`Delete tag "#${tag}"? This will remove it from all entries.`)) {
      deleteTag(tag)
      setTags(getAllTags())
      setDeletingTag(null)
      onRefresh?.()
    }
  }

  const startEdit = (tag: string) => {
    setEditingTag(tag)
    setNewTagName(tag)
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setNewTagName('')
  }

  return (
    <div className="px-5 py-6">
      <h2 className="text-[20px] font-black tracking-widest uppercase text-[#1a1a1a] mb-6">[ TAG_MANAGE ]</h2>



      {tags.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-2">
          <span className="text-4xl opacity-20">🏷️</span>
          <p className={`text-[14px] font-bold ${theme.textSecondary}`}>[ NO_TAGS_YET ]</p>
          <p className={`text-[12px] font-bold ${theme.textSecondary}`}>
            ADD_TAGS_TO_YOUR_DIARY_ENTRIES_TO_ORGANIZE_THEM
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map(tag => (
            <div
              key={tag}
              className={`flex items-center justify-between px-4 py-3 ${theme.chipBg} border-2 ${theme.border} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
            >
              {editingTag === tag ? (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-zinc-400 text-sm font-bold">#</span>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename(tag)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="flex-1 px-2 py-1 bg-white border-2 border-black dark:border-white text-black text-[13px] outline-none focus:border-black font-mono uppercase"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(tag)}
                    className="px-3 py-1 bg-black text-white border-2 border-black text-[12px] font-black hover:bg-zinc-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase"
                  >
                    [ SAVE ]
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 border-2 border-zinc-700 bg-zinc-900 text-white text-[12px] font-black hover:bg-zinc-800 transition-colors uppercase"
                  >
                    [ CANCEL ]
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-sm font-bold">#</span>
                    <span className={`text-[14px] ${theme.textPrimary} font-black uppercase`}>{tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(tag)}
                      className={`w-8 h-8 border-2 ${theme.border} ${theme.chipBg} flex items-center justify-center ${theme.textSecondary} hover:bg-black hover:text-white transition-colors text-sm font-black`}
                      aria-label="Edit tag"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeletingTag(tag)}
                      className={`w-8 h-8 border-2 ${theme.border} ${theme.chipBg} flex items-center justify-center ${theme.textSecondary} hover:bg-red-900 hover:text-white transition-colors text-sm font-black`}
                      aria-label="Delete tag"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setDeletingTag(null)}
          />
          <div className={`relative w-full max-w-sm ${theme.cardBg} border-2 border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
            <h3 className={`text-[18px] font-black tracking-widest uppercase ${theme.textPrimary} mb-2`}>[ DELETE_TAG ]</h3>
            <p className={`text-[14px] ${theme.textSecondary} mb-6 font-bold`}>
              ARE_YOU_SURE_YOU_WANT_TO_DELETE_"#{deletingTag}"?_THIS_WILL_REMOVE_IT_FROM_ALL_ENTRIES
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingTag(null)}
                className={`flex-1 px-4 py-3 border-2 ${theme.border} ${theme.chipBg} ${theme.textPrimary} text-[14px] font-black rounded-xl hover:bg-black hover:text-white transition-colors uppercase`}
              >
                [ CANCEL ]
              </button>
              <button
                onClick={() => handleDelete(deletingTag)}
                className="flex-1 px-4 py-3 bg-red-500 text-white border-2 border-red-700 text-[14px] font-black rounded-xl hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase"
              >
                [ DELETE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
