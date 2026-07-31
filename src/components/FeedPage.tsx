import { useState, useEffect } from 'react'
import { getMemos, getTagListStyle } from '../lib/storage'
import type { Memo, TagListStyle } from '../lib/types'
import PostCard from './PostCard'
import StoryViewer, { Post as StoryPost } from './StoryViewer'

interface Props {
  refreshKey: number
  onEdit: (memo: Memo) => void
  onRefresh: () => void
  selectedMemoId: number | null
  onClearSelection: () => void
  onSelectMemo?: (id: number) => void
}

export default function FeedPage({ refreshKey, onEdit, onRefresh, selectedMemoId, onClearSelection, onSelectMemo }: Props) {
  const [memos, setMemos] = useState<Memo[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [tagListStyle, setTagListStyle] = useState<TagListStyle>('circle')

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
    setTagListStyle(getTagListStyle())
  }, [refreshKey, activeTag])

  useEffect(() => {
    if (selectedMemoId) {
      setActiveTag(null)
      setTimeout(() => {
        const element = document.getElementById(`memo-${selectedMemoId}`)
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
        <div className="flex gap-3 overflow-x-auto px-4 py-4">
          {allTags.map(tag => {
            const latestImage = getLatestImageForTag(tag)
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`flex-shrink-0 ${
                  tagListStyle === 'folder' ? 'w-14 h-14 rounded-xl' : 'w-16 h-16 rounded-full'
                } text-[11px] font-medium border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden ${
                  activeTag === tag
                    ? 'border-[#1a1a1a] shadow-md'
                    : 'border-[#e8e3dd] hover:border-[#d0c9c0]'
                } ${!latestImage ? (activeTag === tag ? 'bg-[#1a1a1a] text-white' : 'bg-[#faf9f7] text-[#777]') : ''}`}
              >
                {latestImage && (
                  <>
                    <img
                      src={latestImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </>
                )}
                                {tagListStyle === 'folder' && !latestImage && (
                  <img src="/img/folder01.png" alt="" className="absolute inset-0 w-full h-full object-contain p-2" />
                )}
                <span className={`relative z-10 font-medium px-1 ${latestImage ? 'text-white' : ''}`}>
                  #{tag}
                </span>
              </button>
            )
          })}
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
            if (onSelectMemo) {
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
