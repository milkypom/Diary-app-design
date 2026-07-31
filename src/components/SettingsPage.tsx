import { useState, useEffect } from 'react'
import { getAllTags, renameTag, deleteTag, getTagListStyle, saveTagListStyle } from '../lib/storage'
import type { TagListStyle } from '../lib/types'

interface Props {
  refreshKey?: number
  onRefresh?: () => void
}

export default function SettingsPage({ refreshKey, onRefresh }: Props) {
  const [tags, setTags] = useState<string[]>([])
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [deletingTag, setDeletingTag] = useState<string | null>(null)
 const [tagListStyle, setTagListStyle] = useState<TagListStyle>('circle')

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
 
  const handleTagListStyleChange = (style: TagListStyle) => {
    setTagListStyle(style)
    saveTagListStyle(style)
    onRefresh?.()
  }
  const handleDelete = (tag: string) => {
    if (confirm(`Delete tag "#${tag}"? This will remove it from all entries.`)) {
      deleteTag(tag)
      setTags(getAllTags())
      setDeletingTag(null)
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
      <h2 className="text-[20px] font-semibold text-[#1a1a1a] mb-6">Settings</h2>

      {/* Tag List Style Setting */}
      <div className="mb-8">
        <h3 className="text-[16px] font-semibold text-[#1a1a1a] mb-4">Tag List Style</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleTagListStyleChange('circle')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              tagListStyle === 'circle'
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-[#e8e3dd] bg-white text-[#1a1a1a] hover:border-[#c87941]'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#e8e3dd] border-2 border-[#c87941] flex items-center justify-center text-[10px] font-bold text-[#1a1a1a]">
                #tag
              </div>
              <span className="text-[12px] font-medium">Circle</span>
            </div>
          </button>
          <button
            onClick={() => handleTagListStyleChange('folder')}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              tagListStyle === 'folder'
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-[#e8e3dd] bg-white text-[#1a1a1a] hover:border-[#c87941]'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <img src="/img/folder01.png" alt="folder" className="w-8 h-8 object-contain" />
              <span className="text-[12px] font-medium">Folder</span>
            </div>
          </button>
        </div>
      </div>

      <h2 className="text-[20px] font-semibold text-[#1a1a1a] mb-6">Manage Tags</h2>

      {tags.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-2">
          <span className="text-4xl opacity-20">🏷️</span>
          <p className="text-[14px] text-[#9a9a9a]">No tags yet</p>
          <p className="text-[12px] text-[#bbb]">
            Add tags to your diary entries to organize them
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map(tag => (
            <div
              key={tag}
              className="flex items-center justify-between px-4 py-3 bg-[#faf9f7] rounded-xl border border-[#f0ede8]"
            >
              {editingTag === tag ? (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[#999] text-sm">#</span>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename(tag)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="flex-1 px-2 py-1 bg-white rounded-lg text-[13px] outline-none border border-[#e8e3dd] focus:border-[#bbb]"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(tag)}
                    className="px-3 py-1 bg-[#1a1a1a] text-white text-[12px] rounded-lg font-medium hover:bg-[#333] transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 bg-[#e8e3dd] text-[#1a1a1a] text-[12px] rounded-lg font-medium hover:bg-[#d0c9c0] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-[#999] text-sm">#</span>
                    <span className="text-[14px] text-[#1a1a1a] font-medium">{tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(tag)}
                      className="w-8 h-8 flex items-center justify-center text-[#bbb] hover:text-[#555] transition-colors text-sm"
                      aria-label="Edit tag"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeletingTag(tag)}
                      className="w-8 h-8 flex items-center justify-center text-[#bbb] hover:text-red-400 transition-colors text-sm"
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
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setDeletingTag(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-[18px] font-semibold text-[#1a1a1a] mb-2">Delete Tag</h3>
            <p className="text-[14px] text-[#666] mb-6">
              Are you sure you want to delete "#{deletingTag}"? This will remove it from all entries.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingTag(null)}
                className="flex-1 px-4 py-3 bg-[#faf9f7] text-[#1a1a1a] text-[14px] font-medium rounded-xl hover:bg-[#f0ede8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingTag)}
                className="flex-1 px-4 py-3 bg-red-500 text-white text-[14px] font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
