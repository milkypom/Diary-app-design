import { useState, useEffect } from 'react'
import { getMemos } from '../lib/storage'
import type { Memo } from '../lib/types'
import PostCard from './PostCard'

interface Props {
  refreshKey: number
  onEdit: (memo: Memo) => void
  onRefresh: () => void
}

export default function BookmarkPage({ refreshKey, onEdit, onRefresh }: Props) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => {
    const bookmarked = getMemos()
      .filter(m => !m.deleted && m.bookmark)
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )
    const tags = Array.from(new Set(bookmarked.flatMap(m => m.tags || [])))
    setAllTags(tags)
    setMemos(activeTag ? bookmarked.filter(m => m.tags?.includes(activeTag)) : bookmarked)
  }, [refreshKey, activeTag])

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex gap-3 overflow-x-auto px-4 py-4">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(prev => (prev === tag ? null : tag))}
              className={`flex-shrink-0 w-16 h-16 rounded-full text-[11px] font-medium border-2 transition-all flex flex-col items-center justify-center ${
                activeTag === tag
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md'
                  : 'bg-[#faf9f7] text-[#777] border-[#e8e3dd] hover:bg-[#f5f0eb] hover:border-[#d0c9c0]'
              }`}
            >
              <span className="truncate max-w-full px-1">#{tag}</span>
            </button>
          ))}
        </div>
      )}

      {memos.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <span className="text-5xl opacity-20">☆</span>
          <p className="text-[14px] text-[#9a9a9a]">No saved entries yet</p>
          <p className="text-[12px] text-[#bbb]">Tap ☆ on any entry to save it</p>
        </div>
      ) : (
        memos.map(memo => (
          <PostCard
            key={memo.id}
            memo={memo}
            onEdit={onEdit}
            onRefresh={onRefresh}
          />
        ))
      )}
    </div>
  )
}
