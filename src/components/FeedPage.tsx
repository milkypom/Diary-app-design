import { useState, useEffect } from 'react'
import { getMemos } from '../lib/storage'
import type { Memo } from '../lib/types'
import PostCard from './PostCard'
import StoryViewer, { Post as StoryPost } from './StoryViewer'
import { useTheme } from '../contexts/ThemeContext'

interface Props {
  refreshKey: number
  onEdit: (memo: Memo) => void
  onRefresh: () => void
  selectedMemoId: number | null
  onClearSelection: () => void
  onSelectMemo?: (id: number) => void
  onTagEditClick?: () => void
  storyTag?: string | null
  onStoryTagOpened?: () => void
  onOpenStoryPost?: (id: number, tag: string) => void
}

export default function FeedPage({ refreshKey, onEdit, onRefresh, selectedMemoId, onClearSelection, onSelectMemo, onTagEditClick, storyTag, onStoryTagOpened, onOpenStoryPost }: Props) {
  const { theme } = useTheme()
  const [memos, setMemos] = useState<Memo[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // story state & tag progression
  const [storyOpen, setStoryOpen] = useState(false)
  const [storyPosts, setStoryPosts] = useState<StoryPost[]>([])
  const [storyIndex, setStoryIndex] = useState(0)

  // tag order + current tag pointer for "next-tag" progression
  const [tagOrder, setTagOrder] = useState<string[]>([])
  const [currentTagIndex, setCurrentTagIndex] = useState<number | null>(null)

  useEffect(() => {
    const all = getMemos()
      .filter(m => !m.deleted)
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )

    // remove falsy/empty tags when building the tag list
    const tags = Array.from(new Set(all.flatMap(m => m.tags || []).filter(Boolean)))
    setAllTags(tags)
    setMemos(activeTag ? all.filter(m => m.tags?.includes(activeTag)) : all)
  }, [refreshKey, activeTag])

  useEffect(() => {
    if (selectedMemoId) {
      setActiveTag(null)
      setTimeout(() => {
        const element = document.getElementById(`memo-${selectedMemoId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('ring-2', 'ring-[#1a1a1a]', 'ring-offset-2')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-[#1a1a1a]', 'ring-offset-2')
            onClearSelection()
          }, 2000)
        }
      }, 300)
    }
  }, [selectedMemoId, onClearSelection])

  // helper: build StoryPost[] for a tag
  function buildPostsForTag(tag: string): StoryPost[] {
    return getMemos()
      .filter(m => !m.deleted && m.tags?.includes(tag))
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .map(m => ({
        id: m.id,
        imageUrl: m.images?.[0] ?? undefined,
        title: m.title ?? undefined,
        content: m.content ?? undefined,
        authorName: (m as any).authorName ?? 'My Diary', // 메모에 author 필드가 있으면 사용
        avatarUrl: (m as any).avatarUrl ?? undefined,
        date: m.date || m.createdAt,
        durationMs: 3500,
        mood: m.mood ?? undefined,
      }))
  }

  // helper: get latest image for a tag
  function getLatestImageForTag(tag: string): string | undefined {
    const memosWithTag = getMemos()
      .filter(m => !m.deleted && m.tags?.includes(tag) && m.images?.length > 0)
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
    return memosWithTag[0]?.images?.[0]
  }

  // open story viewer starting at the clicked tag; also prepare tagOrder and currentTagIndex
  const handleTagClick = (tag: string) => {
    const tags = allTags // use current allTags order; you can reorder if desired
    const startIndex = tags.indexOf(tag)
    if (startIndex === -1) {
      // fallback: single-tag behavior
      const posts = buildPostsForTag(tag)
      if (posts.length === 0) {
        setActiveTag(prev => (prev === tag ? null : tag))
        return
      }
      setStoryPosts(posts)
      setStoryIndex(0)
      setStoryOpen(true)
      setTagOrder([tag])
      setCurrentTagIndex(0)
      return
    }

    // prepare order starting from the clicked tag (optional: you can keep original order)
    const ordered = tags.slice(startIndex).concat(tags.slice(0, startIndex))
    setTagOrder(ordered)
    setCurrentTagIndex(0) // pointer into ordered (0 means ordered[0] is the clicked tag)
    const posts = buildPostsForTag(ordered[0])
    if (posts.length === 0) {
      // if no posts for this tag, just toggle filter instead
      setActiveTag(prev => (prev === tag ? null : tag))
      return
    }
    setStoryPosts(posts)
    setStoryIndex(0)
    setStoryOpen(true)
  }

  useEffect(() => {
    if (!storyTag || allTags.length === 0) return
    handleTagClick(storyTag)
    onStoryTagOpened?.()
  }, [storyTag, allTags, onStoryTagOpened])

  // called when StoryViewer finishes all posts in the current tag
  function handleTagFinish() {
    if (currentTagIndex == null) {
      setStoryOpen(false)
      return
    }
    const nextIndex = currentTagIndex + 1
    if (nextIndex >= tagOrder.length) {
      // no more tags in this sequence
      setStoryOpen(false)
      setCurrentTagIndex(null)
      setTagOrder([])
      return
    }
    // move to next tag
    let foundIndex = nextIndex
    while (foundIndex < tagOrder.length) {
      const p = buildPostsForTag(tagOrder[foundIndex])
      if (p.length > 0) {
        setStoryPosts(p)
        setStoryIndex(0)
        setCurrentTagIndex(foundIndex)
        return
      }
      foundIndex++
    }
    setStoryOpen(false)
    setCurrentTagIndex(null)
    setTagOrder([])
  }

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {allTags.map(tag => {
            const latestImage = getLatestImageForTag(tag)
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="flex flex-col items-center gap-1.5 group shrink-0"
              >
                <div className="relative p-0.5 border-2 border-black dark:border-white bg-white dark:bg-black group-hover:scale-105 transition duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="w-16 h-16 bg-zinc-900 overflow-hidden relative border border-zinc-700">
                    {latestImage && (
                      <img
                        src={latestImage}
                        alt=""
                        className="w-full h-full object-cover transition duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition flex items-center justify-center">
                      <span className="text-[10px] font-black text-white bg-black/80 px-1 border border-zinc-500">
                        #{tag}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold tracking-tight uppercase truncate max-w-[80px]">
                  #{tag}
                </span>
              </button>
            )
          })}
          {onTagEditClick && (
            <button
              onClick={onTagEditClick}
              className="flex flex-col items-center gap-1.5 group shrink-0"
            >
              <div className="w-16 h-16 border-2 border-black dark:border-white bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition">
                <span className="text-2xl font-black">+</span>
              </div>
              <span className="text-[10px] font-bold tracking-tight uppercase">ADD_TAG</span>
            </button>
          )}
        </div>
      )}

      {memos.length === 0 ? (
        <div className={`p-10 text-center border-2 ${theme.border} ${theme.cardBg} space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
          <p className="text-3xl">📟</p>
          <p className="font-bold text-sm tracking-widest">[ NO_ENTRIES_FOUND ]</p>
          <p className={`text-xs ${theme.textSecondary}`}>
            {activeTag ? `No entries tagged #${activeTag}` : '새로운 일기를 기록하거나 필터를 변경해 보세요.'}
          </p>
          {activeTag && (
            <button
              className={`text-xs font-bold px-3 py-1 border-2 ${theme.border} ${theme.chipBg} hover:bg-black hover:text-white transition`}
              onClick={() => setActiveTag(null)}
            >
              CLEAR_FILTER
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {memos.map(memo => (
            <PostCard
              key={memo.id}
              id={`memo-${memo.id}`}
              memo={memo}
              onEdit={onEdit}
              onRefresh={onRefresh}
              onTagClick={handleTagClick}
              onSelectMemo={onSelectMemo}
            />
          ))}
        </div>
      )}

      {storyOpen && (
        <StoryViewer
          posts={storyPosts}
          initialIndex={storyIndex}
          tag={tagOrder[currentTagIndex ?? 0] ?? undefined}
          onClose={() => {
            setStoryOpen(false)
            setCurrentTagIndex(null)
            setTagOrder([])
          }}
          onFinish={handleTagFinish}
          onOpenPost={(id) => {
            // close viewer first, then navigate to post via prop or fallback to edit
            setStoryOpen(false)
            setCurrentTagIndex(null)
            setTagOrder([])
            const parsedId = typeof id === 'string' ? parseInt(id, 10) : id
            const activeStoryTag = tagOrder[currentTagIndex ?? 0]
            if (onOpenStoryPost && activeStoryTag) {
              onOpenStoryPost(parsedId, activeStoryTag)
            } else if (onSelectMemo) {
              onSelectMemo(parsedId)
            } else {
              const memoObj = getMemos().find(m => m.id === parsedId)
              if (memoObj) onEdit(memoObj)
            }
          }}
        />
      )}

    </div>
  )
}
