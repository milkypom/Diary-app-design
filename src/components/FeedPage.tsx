import { useState, useEffect } from 'react'
import { getMemos } from '../lib/storage'
import type { Memo } from '../lib/types'
import PostCard from './PostCard'
import StoryViewer, { Post as StoryPost } from './StoryViewer'

interface Props {
  refreshKey: number
  onEdit: (memo: Memo) => void
  onRefresh: () => void
  selectedMemoId: number | null
  onClearSelection: () => void
}

export default function FeedPage({ refreshKey, onEdit, onRefresh, selectedMemoId, onClearSelection }: Props) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // story state
  const [storyOpen, setStoryOpen] = useState(false)
  const [storyPosts, setStoryPosts] = useState<StoryPost[]>([])
  const [storyIndex, setStoryIndex] = useState(0)

  useEffect(() => {
    const all = getMemos()
      .filter(m => !m.deleted)
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )

    const tags = Array.from(new Set(all.flatMap(m => m.tags || [])))
    setAllTags(tags)
    setMemos(activeTag ? all.filter(m => m.tags?.includes(activeTag)) : all)
  }, [refreshKey, activeTag])

  useEffect(() => {
    if (selectedMemoId) {
      console.log('selectedMemoId:', selectedMemoId)
      setActiveTag(null)
      setTimeout(() => {
        const element = document.getElementById(`memo-${selectedMemoId}`)
        console.log('element found:', element)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('ring-2', 'ring-[#c87941]', 'ring-offset-2')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-[#c87941]', 'ring-offset-2')
            onClearSelection()
          }, 2000)
        }
      }, 300)
    }
  }, [selectedMemoId, onClearSelection])

  const handleTagClick = (tag: string) => {
    // Build story posts for the tag
    const posts = getMemos()
      .filter(m => !m.deleted && m.tags?.includes(tag))
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .map(m => ({
        id: m.id,
        imageUrl: m.images?.[0] ?? undefined,
        content: m.title || m.content || undefined,
      }))

    if (posts.length === 0) {
      setActiveTag(prev => (prev === tag ? null : tag))
      return
    }

    setStoryPosts(posts)
    setStoryIndex(0)
    setStoryOpen(true)
  }

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex gap-3 overflow-x-auto px-4 py-4">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
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
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl opacity-30">📖</span>
          <p className="text-[14px] text-[#9a9a9a]">
            {activeTag ? `No entries tagged #${activeTag}` : 'Start your diary — tap + to write'}
          </p>
          {activeTag && (
            <button
              className="text-[13px] text-[#c87941] font-medium"
              onClick={() => setActiveTag(null)}
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div>
          {memos.map(memo => (
            <PostCard
              key={memo.id}
              id={`memo-${memo.id}`}
              memo={memo}
              onEdit={onEdit}
              onRefresh={onRefresh}
              onTagClick={handleTagClick}
            />
          ))}
        </div>
      )}

      {storyOpen && (
        <StoryViewer
          posts={storyPosts}
          initialIndex={storyIndex}
          onClose={() => setStoryOpen(false)}
        />
      )}
    </div>
  )
}
const posts = getMemos()
  .filter(m => !m.deleted && m.tags?.includes(tag))
  .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
  .map(m => ({
    id: m.id,
    imageUrl: m.images?.[0] ?? undefined,
    title: m.title ?? undefined,
    content: m.content ?? undefined,
    authorName: m.authorName ?? 'My Diary', // 메모에 author 필드가 없다면 기본값 사용
    avatarUrl: m.avatarUrl ?? undefined,    // 없다면 기본 아이콘(placeholder) 사용
    date: m.date || m.createdAt,
    durationMs: 3500, // 필요 시 per-post duration
  }))
