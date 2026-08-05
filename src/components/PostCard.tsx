import { useState, useEffect, useRef } from 'react'
import type { Memo, Comment } from '../lib/types'
import { toggleBookmark, deleteMemo, getComments, addComment, deleteComment, getProfile } from '../lib/storage'

const WEATHER_ICON: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
}
const MOOD_ICON: Record<string, string> = {
  happy: '😊',
  normal: '😐',
  sad: '😢',
  angry: '😡',
  excited: '🤩',
  tired: '😴',
  anxious: '😰',
  grateful: '🙏',
}

const AVATAR_COLORS = [
  '#e8c4a2',
  '#a2c4e8',
  '#c4a2e8',
  '#a2e8c4',
  '#e8d0a2',
  '#e8a2c4',
]

function getEngagement(id: number) {
  const seed = id % 997
  return { likes: ((seed * 7 + 13) % 180) + 8 }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFullTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function commentRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

interface Props {
  memo: Memo
  onEdit: (memo: Memo) => void
  onRefresh: () => void
  onTagClick?: (tag: string) => void
  id?: string
}

export default function PostCard({ memo, onEdit, onRefresh, onTagClick, id }: Props) {
  const [imgIdx, setImgIdx] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(memo.bookmark)
  const [expanded, setExpanded] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [showFullTime, setShowFullTime] = useState(false)
  const [profile, setProfile] = useState(getProfile())
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setBookmarked(memo.bookmark)
  }, [memo.bookmark])

  useEffect(() => {
    if (commentOpen) {
      setComments(getComments(memo.id))
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [commentOpen, memo.id])

  const engagement = getEngagement(memo.id)
  const likeCount = engagement.likes + (liked ? 1 : 0)
  const images = memo.images || []
  const isLong = (memo.content?.length || 0) > 130
  const displayContent =
    !expanded && isLong ? memo.content.slice(0, 130) + '…' : memo.content

  const handleBookmark = () => {
    setBookmarked(b => !b)
    toggleBookmark(memo.id)
    onRefresh()
  }

  const handleDelete = () => {
    if (!confirm('Delete this entry?')) return
    deleteMemo(memo.id)
    onRefresh()
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    const c = addComment(memo.id, commentText)
    setComments(prev => [...prev, c])
    setCommentText('')
  }

  const handleDeleteComment = (cid: number) => {
    deleteComment(cid)
    setComments(prev => prev.filter(c => c.id !== cid))
  }

  const toggleComments = () => setCommentOpen(o => !o)
  const prevImg = () => setImgIdx(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setImgIdx(i => (i + 1) % images.length)
  const avatarColor = AVATAR_COLORS[memo.id % AVATAR_COLORS.length]
  const displayDate = memo.date || memo.createdAt

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      nextImg()
    } else if (distance < -minSwipeDistance) {
      prevImg()
    }
  }

  return (
    <article id={id} className="bg-white border-b border-[#f0ede8] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center px-4 py-3 gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[22px] flex-shrink-0 select-none"
          style={{ background: avatarColor }}
        >
          {memo.mood ? MOOD_ICON[memo.mood] : '📝'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-none text-[#1a1a1a]">{profile.name}</p>
          <button
            className="text-[11px] text-[#9a9a9a] mt-0.5 text-left hover:text-[#666] transition-colors"
            onClick={() => setShowFullTime(t => !t)}
            title={formatFullTime(displayDate)}
          >
            {showFullTime ? formatFullTime(displayDate) : relativeTime(displayDate)}
          </button>
        </div>
        {/* Menu */}
        <div className="relative ml-1">
          <button
            className="w-8 h-8 flex items-center justify-center transition-transform active:scale-110"
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Post options"
          >
            <img
              src="/img/post options.png"
              alt="Post options"
              className="w-5 h-5 object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 bg-white rounded-2xl shadow-xl border border-[#f0ede8] overflow-hidden min-w-[130px]">
                <button
                  className="w-full px-4 py-3 text-left text-[13px] text-[#1a1a1a] hover:bg-[#faf9f7] transition-colors"
                  onClick={() => { setMenuOpen(false); onEdit(memo) }}
                >
                  Edit entry
                </button>
                <div className="h-px bg-[#f0ede8]" />
                <button
                  className="w-full px-4 py-3 text-left text-[13px] text-red-400 hover:bg-red-50 transition-colors"
                  onClick={() => { setMenuOpen(false); handleDelete() }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image slider */}
      {images.length > 0 ? (
        <div
          className="relative w-full aspect-square overflow-hidden bg-[#f5f0eb]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Photo ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                i === imgIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            />
          ))}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Photo ${i + 1}`}
                  className={`h-1.5 rounded-full bg-white transition-all duration-200 ${
                    i === imgIdx ? 'w-4 opacity-100' : 'w-1.5 opacity-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setImgIdx(i)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-[#fdf4f0] to-[#f0e8de] flex items-center justify-center">
          <span className="text-5xl opacity-20">📷</span>
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center px-4 pt-3 pb-1">
        <div className="flex items-center gap-4 flex-1">
          <button
            className="flex items-center gap-1.5"
            onClick={() => setLiked(l => !l)}
            aria-label="Like"
          >
            <img
              src={liked ? '/img/heart_fill.png' : '/img/heart_line.png'}
              alt={liked ? 'Liked' : 'Not liked'}
              className="w-6 h-6 object-contain transition-transform active:scale-125 select-none"
            />
            <span className="text-[12px] text-[#9a9a9a] font-medium tabular-nums">{likeCount}</span>
          </button>
          <button
            className="flex items-center gap-1.5"
            onClick={toggleComments}
            aria-label="Comments"
          >
            <span className={`text-[19px] leading-none select-none transition-transform active:scale-110 ${commentOpen ? 'opacity-100' : 'opacity-70'}`}>
              💬
            </span>
            <span className={`text-[12px] font-medium tabular-nums transition-colors ${commentOpen ? 'text-[#1a1a1a]' : 'text-[#9a9a9a]'}`}>
              {comments.length > 0 ? comments.length : getComments(memo.id).length}
            </span>
          </button>
        </div>
        <button
          className="w-6 h-6 transition-transform active:scale-125 select-none"
          onClick={handleBookmark}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <img
            src={bookmarked ? '/img/saved_on.png' : '/img/saved_off.png'}
            alt={bookmarked ? 'Bookmarked' : 'Not bookmarked'}
            className="w-full h-full object-contain"
          />
        </button>
      </div>

      {/* Text content */}
      <div className="px-4 pb-4 pt-1">
        {memo.title && (
          <h2 className="text-[15px] font-semibold italic text-[#1a1a1a] mb-1.5 leading-snug flex items-center gap-1.5">
            <span>{memo.title}</span>
            {memo.weather && <span className="text-[14px]" title={memo.weather}>{WEATHER_ICON[memo.weather]}</span>}
          </h2>
        )}
        {memo.content && (
          <p className="text-[13px] text-[#555] leading-relaxed">
            {displayContent}
            {isLong && (
              <button
                className="ml-1 text-[#9a9a9a] font-medium hover:text-[#555] transition-colors"
                onClick={() => setExpanded(e => !e)}
              >
                {expanded ? 'less' : 'more'}
              </button>
            )}
          </p>
        )}
        {memo.tags?.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2.5">
            {memo.tags.map(tag => (
              <button
                key={tag}
                className="text-[12px] text-[#1a1a1a] hover:text-[#333] transition-colors font-medium"
                onClick={() => onTagClick?.(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
        {memo.location && (
          <p className="text-[11px] text-[#9a9a9a] mt-2 flex items-center gap-1">
            <span>📍</span>{memo.location}
          </p>
        )}
      </div>

      {/* Comment modal */}
      {commentOpen && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setCommentOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            className="relative w-full bg-white rounded-t-3xl shadow-2xl flex flex-col"
            style={{ maxHeight: '75vh', animation: 'slideUp 0.28s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#f0ede8] flex-shrink-0">
              <div className="w-10 h-1 bg-[#e0dbd5] rounded-full absolute top-2.5 left-1/2 -translate-x-1/2" />
              <span className="text-[14px] font-semibold text-[#1a1a1a]">Comments</span>
              <button
                className="w-7 h-7 flex items-center justify-center text-[#bbb] hover:text-[#555] transition-colors rounded-full bg-[#f5f2ef]"
                onClick={() => setCommentOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 min-h-0">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-3xl opacity-30">💬</span>
                  <p className="text-[13px] text-[#bbb]">No comments yet. Be the first!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {comments.map(c => (
                    <li key={c.id} className="flex items-start gap-3 group">
                      <div
                        className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-0.5 bg-gradient-to-br ${profile.avatarColor} flex items-center justify-center`}
                      >
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[18px]">{profile.avatarEmoji}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-semibold text-[#1a1a1a]">{profile.name}</span>
                          <span className="text-[11px] text-[#bbb]">{commentRelativeTime(c.createdAt)}</span>
                        </div>
                        <p className="text-[13px] text-[#555] leading-relaxed mt-0.5">{c.text}</p>
                      </div>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-[12px] text-[#ccc] hover:text-red-400 transition-all flex-shrink-0 mt-1 px-1"
                        onClick={() => handleDeleteComment(c.id)}
                        aria-label="Delete comment"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Comment input */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-[#f0ede8] bg-white flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br ${profile.avatarColor} flex items-center justify-center`}
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-[18px]">{profile.avatarEmoji}</span>
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                placeholder="Write a comment…"
                className="flex-1 bg-[#f5f2ef] border border-transparent rounded-full px-4 py-2.5 text-[13px] outline-none focus:border-[#1a1a1a] focus:bg-white transition-all"
              />
              <button
                className={`text-[13px] font-semibold transition-colors px-1 flex-shrink-0 ${commentText.trim() ? 'text-[#1a1a1a] hover:text-[#333]' : 'text-[#ccc]'}`}
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
