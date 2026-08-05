import { useState, useEffect, useRef } from 'react'
import type { Memo, Comment } from '../lib/types'
import { toggleBookmark, deleteMemo, getComments, addComment, deleteComment, getProfile } from '../lib/storage'
import { useTheme } from '../contexts/ThemeContext'
import { PHOTO_FILTERS } from '../lib/theme'

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
  const { theme } = useTheme()
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
  const [selectedFilter, setSelectedFilter] = useState('monoHigh')

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

  const filterObj = PHOTO_FILTERS.find(f => f.id === selectedFilter) || PHOTO_FILTERS[0]

  return (
    <article id={id} className={`border-2 ${theme.border} ${theme.cardBg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition mb-4`}>
      {/* Header */}
      <div className={`p-3.5 flex items-center justify-between border-b-2 border-black dark:border-white bg-zinc-100 dark:bg-zinc-900`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 border border-black dark:border-white bg-black text-white flex items-center justify-center shrink-0 text-sm">
            {memo.mood ? MOOD_ICON[memo.mood] : '📝'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xs tracking-wider">{new Date(displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</h3>
              <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase bg-zinc-800 text-zinc-100`}>
                {memo.mood || 'NORMAL'}
              </span>
            </div>
            <div className={`flex items-center gap-2 text-[10px] ${theme.textSecondary} mt-0.5 font-bold`}>
              <span className="flex items-center gap-0.5">
                📍 {memo.location || 'MONO_SPACE_00'}
              </span>
              <span>•</span>
              <span>{memo.weather ? WEATHER_ICON[memo.weather] : '☀️'} {memo.weather || 'CLEAR'}</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative ml-1">
          <button
            className={`w-8 h-8 border border-black dark:border-white ${theme.chipBg} hover:bg-black hover:text-white transition flex items-center justify-center`}
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Post options"
          >
            ⋮
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className={`absolute right-0 top-full z-20 ${theme.cardBg} border-2 ${theme.border} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-w-[130px]`}>
                <button
                  className={`w-full px-4 py-3 text-left text-xs font-bold ${theme.textPrimary} hover:bg-black hover:text-white transition-colors`}
                  onClick={() => { setMenuOpen(false); onEdit(memo) }}
                >
                  EDIT_LOG
                </button>
                <div className={`h-px ${theme.border}`} />
                <button
                  className="w-full px-4 py-3 text-left text-xs font-bold text-red-400 hover:bg-red-900 hover:text-white transition-colors"
                  onClick={() => { setMenuOpen(false); handleDelete() }}
                >
                  DELETE_LOG
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image slider */}
      {images.length > 0 ? (
        <div
          className="relative aspect-square bg-black overflow-hidden cursor-pointer group border-b-2 border-black dark:border-white"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Photo ${i + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105 ${
                i === imgIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{ filter: filterObj.filterCss }}
            />
          ))}
          <div className="absolute top-3 right-3 bg-black text-white border border-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest">
            [ {filterObj.name} ]
          </div>
          <div className="absolute bottom-3 left-3 bg-black/80 text-zinc-300 font-mono text-[10px] px-2 py-0.5 border border-zinc-700 tracking-widest">
            REC • {displayDate.replace(/-/g, '.')}
          </div>
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
        <div className="w-full aspect-square bg-black flex items-center justify-center border-b-2 border-black dark:border-white">
          <span className="text-5xl opacity-20">📷</span>
        </div>
      )}

      {/* Actions row */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-1.5 text-xs font-bold"
              onClick={() => setLiked(l => !l)}
              aria-label="Like"
            >
              <img
                src={liked ? '/img/heart_fill.png' : '/img/heart_line.png'}
                alt={liked ? 'Liked' : 'Not liked'}
                className="w-6 h-6 object-contain transition-transform active:scale-125 select-none"
              />
              <span>{likeCount}</span>
            </button>
            <button
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-black dark:hover:text-white"
              onClick={toggleComments}
              aria-label="Comments"
            >
              <span className="text-lg">💬</span>
              <span>{comments.length > 0 ? comments.length : getComments(memo.id).length}</span>
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
        <div>
          {memo.title && (
            <h2 className="font-extrabold text-sm md:text-base tracking-wide mb-1 uppercase">
              [ {memo.title} ]
            </h2>
          )}
          {memo.content && (
            <p className={`text-xs leading-relaxed ${theme.textSecondary} whitespace-pre-wrap`}>
              {displayContent}
              {isLong && (
                <button
                  className={`ml-1 font-bold hover:text-black dark:hover:text-white transition-colors`}
                  onClick={() => setExpanded(e => !e)}
                >
                  {expanded ? '[COLLAPSE]' : '[EXPAND]'}
                </button>
              )}
            </p>
          )}
          {memo.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {memo.tags.map(tag => (
                <button
                  key={tag}
                  className={`text-[10px] px-2 py-0.5 border ${theme.border} ${theme.chipBg} font-bold uppercase hover:bg-black hover:text-white transition`}
                  onClick={() => onTagClick?.(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comment modal */}
      {commentOpen && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setCommentOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" />
          <div
            className={`relative w-full border-2 border-white bg-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.4)] overflow-hidden my-8 font-mono`}
            style={{ maxHeight: '75vh', animation: 'slideUp 0.28s ease' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className={`flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-800 flex-shrink-0`}>
              <div className="w-10 h-1 bg-zinc-700 rounded-full absolute top-2.5 left-1/2 -translate-x-1/2" />
              <span className="text-[14px] font-black tracking-widest uppercase">[ MEMO_LOGS ]</span>
              <button
                className={`w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-zinc-700 bg-zinc-900`}
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
                  <p className="text-[13px] text-zinc-400 font-bold">[ NO_MEMOS_YET ]</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {comments.map(c => (
                    <li key={c.id} className={`p-2 border border-zinc-800 bg-zinc-950 text-[10px] space-y-1`}>
                      <div className="flex items-center justify-between font-bold text-zinc-400">
                        <span className="text-zinc-300">{profile.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-zinc-500">{commentRelativeTime(c.createdAt)}</span>
                          <button
                            className="text-[9px] text-zinc-400 hover:text-red-400 transition font-bold underline"
                            onClick={() => handleDeleteComment(c.id)}
                            aria-label="Delete comment"
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                      <p className="text-zinc-300">{c.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Comment input */}
            <div className="flex gap-1.5 pt-1 border-t border-zinc-800 bg-zinc-950 p-3">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                placeholder="ADD_MEMO..."
                className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-xs outline-none focus:border-white uppercase placeholder:text-zinc-600 font-mono"
              />
              <button
                className={`px-3 py-1.5 bg-white text-black text-xs font-black hover:bg-zinc-200 uppercase`}
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                ADD
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
