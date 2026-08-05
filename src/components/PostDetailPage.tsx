import React, { useEffect, useState, useRef } from "react"
import type { Memo, Comment, Page } from "../lib/types"
import {
  getComments,
  addComment,
  deleteComment,
  deleteMemo,
  getProfile,
  toggleBookmark,
} from "../lib/storage"
import { useTheme } from '../contexts/ThemeContext'
import { PHOTO_FILTERS } from '../lib/theme'

const WEATHER_ICON: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
}
const MOOD_ICON: Record<string, string> = {
  happy: '😊', normal: '😐', sad: '😢', angry: '😡',
  excited: '🤩', tired: '😴', anxious: '😰', grateful: '🙏',
}

interface Props {
  memo: Memo | null
  onBack: () => void
  onEdit?: (memo: Memo) => void
  onDelete?: (id: number) => void
  onRefresh?: () => void
  currentPage?: Page
  onTagClick?: (tag: string) => void
}

export default function PostDetailPage({
  memo,
  onBack,
  onEdit,
  onDelete,
  onRefresh,
  currentPage,
  onTagClick,
}: Props) {
  const { theme } = useTheme()
  const [idx, setIdx] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [showActions, setShowActions] = useState(false)
  const [bookmarked, setBookmarked] = useState(memo?.bookmark || false)
  const [profile, setProfile] = useState(getProfile())
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('monoHigh')
  const filterObj = PHOTO_FILTERS.find(f => f.id === selectedFilter) || PHOTO_FILTERS[0]

  useEffect(() => {
    if (!memo) return
    setComments(getComments(memo.id))
    setIdx(0)
    setBookmarked(memo.bookmark)
  }, [memo])

  if (!memo) return null

  const images = memo.images || []
  const prev = (e?: React.SyntheticEvent) => {
    e?.stopPropagation()
    setIdx((i) => Math.max(0, i - 1))
  }
  const next = (e?: React.SyntheticEvent) => {
    e?.stopPropagation()
    setIdx((i) => Math.min(images.length - 1, i + 1))
  }

  function handleAddComment() {
    if (!commentText.trim()) return
    const c = addComment(memo.id, commentText.trim())
    setComments((prev) => [...prev, c])
    setCommentText("")
    inputRef.current?.focus()
    onRefresh?.()
  }

  function handleDeleteComment(id: number) {
    if (!confirm("Delete this comment?")) return
    deleteComment(id)
    setComments((prev) => prev.filter((c) => c.id !== id))
    onRefresh?.()
  }

  function handleEdit() {
    onEdit?.(memo)
  }

  function handleBookmark() {
    if (!memo) return
    setBookmarked(b => !b)
    toggleBookmark(memo.id)
    onRefresh?.()
  }

  function handleDelete() {
    if (!confirm("Delete this entry?")) return
    if (onDelete) onDelete(memo.id)
    else {
      deleteMemo(memo.id)
      onRefresh?.()
    }
    onBack()
  }

  return (
    <article className={`w-full ${theme.cardBg} flex flex-col min-h-screen`}>
      <header className={`sticky top-0 z-20 ${theme.cardBg} border-b-2 ${theme.border} px-4 py-3 flex items-center justify-between gap-3 shadow-[0_3px_0_0_rgba(0,0,0,1)]`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <button onClick={onBack} className={`w-8 h-8 flex items-center justify-center transition-colors text-lg border-2 ${theme.border} ${theme.chipBg} hover:bg-black hover:text-white`}>
            ‹
          </button>
          <div className="w-8 h-8 border border-black dark:border-white bg-black text-white flex items-center justify-center shrink-0 text-sm">
            {memo.mood ? MOOD_ICON[memo.mood] : '📝'}
          </div>
          <div className="min-w-0">
            <div className={`text-[11px] font-black tracking-wider ${theme.textPrimary}`}>
              {new Date(memo.date || memo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </div>
            <div className={`text-[9px] font-bold uppercase ${theme.textSecondary}`}>
              {memo.mood || 'NORMAL'} · {memo.weather || 'CLEAR'}
            </div>
          </div>
        </div>

        <div className="relative ml-1">
          <button
            onClick={() => setShowActions((s) => !s)}
            className={`w-8 h-8 border border-black dark:border-white ${theme.chipBg} hover:bg-black hover:text-white transition flex items-center justify-center`}
            aria-label="Post options"
          >
            ⋮
          </button>
          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
              <div className={`absolute right-0 top-full z-20 ${theme.cardBg} border-2 ${theme.border} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-w-[130px]`}>
                <button
                  className={`w-full px-4 py-3 text-left text-xs font-bold ${theme.textPrimary} hover:bg-black hover:text-white transition-colors`}
                  onClick={() => { setShowActions(false); handleEdit() }}
                >
                  EDIT_LOG
                </button>
                <div className={`h-px ${theme.border}`} />
                <button
                  className="w-full px-4 py-3 text-left text-xs font-bold text-red-400 hover:bg-red-900 hover:text-white transition-colors"
                  onClick={() => { setShowActions(false); handleDelete() }}
                >
                  DELETE_LOG
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Image slider */}
      {images.length > 0 ? (
        <div className="relative w-full aspect-square bg-black flex-shrink-0 border-b-2 border-black dark:border-white">
          <img
            src={images[idx]}
            alt={`Photo ${idx + 1}`}
            className="w-full h-full object-cover"
            style={{ filter: filterObj.filterCss }}
          />
          <div className="absolute top-3 right-3 bg-black text-white border border-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest">
            [ {filterObj.name} ]
          </div>
          <div className="absolute bottom-3 left-3 bg-black/80 text-zinc-300 font-mono text-[10px] px-2 py-0.5 border border-zinc-700 tracking-widest">
            REC • {(memo.date || memo.createdAt).replace(/-/g, '.')}
          </div>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/80 border border-white text-white flex items-center justify-center text-xl shadow-sm z-10 hover:bg-white hover:text-black"
                onClick={prev}
              >
                ‹
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/80 border border-white text-white flex items-center justify-center text-xl shadow-sm z-10 hover:bg-white hover:text-black"
                onClick={next}
              >
                ›
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIdx(i)
                    }}
                    className={`h-1.5 rounded-full bg-white transition-all duration-200 ${
                      i === idx ? "w-4 opacity-100" : "w-1.5 opacity-50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="w-full aspect-square bg-black flex items-center justify-center flex-shrink-0 border-b-2 border-black dark:border-white">
          <span className="text-7xl opacity-20">📷</span>
        </div>
      )}

      <div className="px-4 pb-24 pt-4 flex-1 overflow-y-auto space-y-4">
        <section className={`border-2 ${theme.border} ${theme.cardBg} p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {memo.title && (
              <h1 className="font-extrabold text-sm md:text-base tracking-wide mb-1 uppercase">
                [ {memo.title} ]
              </h1>
            )}
            {memo.weather && (
              <span className="text-[18px]">{WEATHER_ICON[memo.weather]}</span>
            )}
          </div>
          <button
            className="w-6 h-6 transition-transform active:scale-125 select-none"
            onClick={handleBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <img
              src={bookmarked ? '/img/saved_on.png' : '/img/saved_off.png'}
              alt={bookmarked ? 'Saved' : 'Not bookmarked'}
              className="w-full h-full object-contain"
            />
          </button>
        </div>

        <div className={`text-xs leading-relaxed whitespace-pre-wrap mb-3 ${theme.textSecondary}`}>
          {memo.content}
        </div>

        {memo.tags && memo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {memo.tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTagClick?.(t)}
                className={`text-[10px] px-2 py-0.5 border ${theme.border} ${theme.chipBg} font-bold uppercase hover:bg-black hover:text-white transition`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {memo.location && (
          <p className={`text-[11px] ${theme.textSecondary} mt-3 flex items-center gap-1 font-bold`}>
            📍 {memo.location}
          </p>
        )}

        </section>

        {/* Comments */}
        <section className={`border-2 ${theme.border} ${theme.cardBg} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${theme.border} bg-zinc-100 dark:bg-zinc-900`}>
            <h3 className="text-[14px] font-black tracking-widest uppercase">[ MEMO_LOGS ]</h3>
            <div className={`text-[12px] font-bold ${theme.textSecondary}`}>
              {comments.length} {comments.length === 1 ? "MEMO" : "MEMOS"}
            </div>
          </div>

          <div className="p-3">
          {comments.length === 0 ? (
            <div className={`text-[12px] font-bold py-6 text-center border border-dashed ${theme.border} ${theme.textSecondary}`}>
              [ NO_MEMOS_YET ]
            </div>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className={`p-3 border ${theme.border} ${theme.chipBg} text-[10px] space-y-1.5`}
                >
                  <div className={`flex items-center justify-between font-bold ${theme.textSecondary}`}>
                    <span className={theme.textPrimary}>{profile.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px]">{new Date(c.createdAt).toLocaleString()}</span>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-[9px] text-zinc-500 hover:text-red-500 transition font-bold underline"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                  <div className={`${theme.textPrimary} leading-relaxed`}>{c.text}</div>
                </li>
              ))}
            </ul>
          )}

          <div className={`flex gap-1.5 pt-3 mt-3 border-t ${theme.border}`}>
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
              placeholder="ADD_MEMO..."
              className={`flex-1 px-3 py-2 ${theme.chipBg} border ${theme.border} ${theme.textPrimary} text-xs outline-none focus:border-black dark:focus:border-white uppercase placeholder:text-zinc-500 font-mono`}
            />
            <button
              className="px-3 py-2 bg-black text-white border border-black text-xs font-black hover:bg-zinc-700 uppercase"
              onClick={handleAddComment}
            >
              ADD
            </button>
          </div>
          </div>
        </section>
      </div>
    </article>
  )
}
