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

const WEATHER_ICON: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
}

interface Props {
  memo: Memo | null
  onBack: () => void
  onEdit?: (memo: Memo) => void
  onDelete?: (id: number) => void
  onRefresh?: () => void
  currentPage?: Page
}

export default function PostDetailPage({
  memo,
  onBack,
  onEdit,
  onDelete,
  onRefresh,
  currentPage,
}: Props) {
  const [idx, setIdx] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [showActions, setShowActions] = useState(false)
  const [bookmarked, setBookmarked] = useState(memo?.bookmark || false)
  const [profile, setProfile] = useState(getProfile())
  const inputRef = useRef<HTMLInputElement | null>(null)

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
    <article className="w-full bg-white flex flex-col min-h-screen">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#f0ede8] px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[16px] px-2 py-1">
            ←
          </button>
          <div>
            <div className="text-[13px] text-[#9a9a9a]">{profile.name}</div>
            <div className="text-[12px] text-[#777]">
              {memo.date || memo.createdAt}
            </div>
          </div>
        </div>

        <div className="relative ml-1">
          <button
            onClick={() => setShowActions((s) => !s)}
            className="w-8 h-8 flex items-center justify-center transition-transform active:scale-110"
            aria-label="Post options"
          >
            <img
              src="/img/post options.png"
              alt="Post options"
              className="w-5 h-5 object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </button>
          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
              <div className="absolute right-0 top-full z-20 bg-white rounded-2xl shadow-xl border border-[#f0ede8] overflow-hidden min-w-[130px]">
                <button
                  className="w-full px-4 py-3 text-left text-[13px] text-[#1a1a1a] hover:bg-[#faf9f7] transition-colors"
                  onClick={() => { setShowActions(false); handleEdit() }}
                >
                  Edit entry
                </button>
                <div className="h-px bg-[#f0ede8]" />
                <button
                  className="w-full px-4 py-3 text-left text-[13px] text-red-400 hover:bg-red-50 transition-colors"
                  onClick={() => { setShowActions(false); handleDelete() }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Image slider */}
      {images.length > 0 ? (
        <div className="relative w-full h-[50vh] bg-[#f5f0eb] flex-shrink-0">
          <img
            src={images[idx]}
            alt={`Photo ${idx + 1}`}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center text-xl text-[#555] shadow-sm z-10 hover:bg-white"
                onClick={prev}
              >
                ‹
              </button>
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center text-xl text-[#555] shadow-sm z-10 hover:bg-white"
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
                    className={`w-2.5 h-2.5 rounded-full ${
                      i === idx ? "bg-white" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="w-full h-[50vh] bg-gradient-to-br from-[#fdf4f0] to-[#f0e8de] flex items-center justify-center flex-shrink-0">
          <span className="text-7xl opacity-20">📷</span>
        </div>
      )}

      <div className="px-4 pb-20 pt-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {memo.title && (
              <h1 className="text-[20px] font-semibold text-[#1a1a1a]">
                {memo.title}
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
              src={bookmarked ? '/img/heart_fill.png' : '/img/heart_line.png'}
              alt={bookmarked ? 'Bookmarked' : 'Not bookmarked'}
              className="w-full h-full object-contain"
            />
          </button>
        </div>

        <div className="text-[14px] text-[#333] leading-relaxed whitespace-pre-wrap mb-3">
          {memo.content}
        </div>

        {memo.tags && memo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {memo.tags.map((t) => (
              <span key={t} className="text-[12px] text-[#c87941]">
                #{t}
              </span>
            ))}
          </div>
        )}

        {memo.location && (
          <p className="text-[12px] text-[#9a9a9a] mt-3">📍 {memo.location}</p>
        )}

        {/* Comments */}
        <div className="mt-4 border-t border-[#f0ede8] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold">Comments</h3>
            <div className="text-[12px] text-[#777]">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="text-[13px] text-[#bbb] py-6 text-center">
              No comments yet
            </div>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${profile.avatarColor} flex items-center justify-center text-[14px] flex-shrink-0`}
                    >
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        profile.avatarEmoji
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-[#1a1a1a] font-medium">
                        {profile.name}{" "}
                        <span className="text-[11px] text-[#bbb] ml-2">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[13px] text-[#555] mt-1">{c.text}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-[12px] text-[#ccc] hover:text-red-400 flex-shrink-0"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-3 mt-4">
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${profile.avatarColor} flex items-center justify-center text-[14px] flex-shrink-0`}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.avatarEmoji
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 px-3 py-2 border rounded-full bg-[#faf9f7] text-[13px] outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            <button
              onClick={handleAddComment}
              className={`text-[13px] font-semibold ${
                commentText.trim() ? "text-[#c87941]" : "text-[#ccc]"
              }`}
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
