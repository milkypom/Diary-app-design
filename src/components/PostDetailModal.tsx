import React, { useEffect, useState, useRef } from 'react'
import type { Memo, Comment } from '../lib/types'
import { getComments, addComment, deleteComment, deleteMemo } from '../lib/storage'

interface Props {
  memo: Memo | null
  onClose: () => void
  onEdit?: (memo: Memo) => void
  onDelete?: (id: number) => void
  onRefresh?: () => void
}

export default function PostDetailModal({ memo, onClose, onEdit, onDelete, onRefresh }: Props) {
  const [idx, setIdx] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!memo) return
    setComments(getComments(memo.id))
    setIdx(0)
  }, [memo])

  if (!memo) return null

  const images = memo.images || []
  const prev = (e?: React.SyntheticEvent) => { e?.stopPropagation(); setIdx(i => Math.max(0, i - 1)) }
  const next = (e?: React.SyntheticEvent) => { e?.stopPropagation(); setIdx(i => Math.min(images.length - 1, i + 1)) }

  function handleAddComment() {
    if (!commentText.trim()) return
    const c = addComment(memo.id, commentText.trim())
    setComments(prev => [...prev, c])
    setCommentText('')
    inputRef.current?.focus()
    onRefresh?.()
  }

  async function handleDeleteComment(id: number) {
    if (!confirm('Delete this comment?')) return
    deleteComment(id)
    setComments(prev => prev.filter(c => c.id !== id))
    onRefresh?.()
  }

  function handleEdit() {
    onClose()
    onEdit?.(memo)
  }

  function handleDelete() {
    if (!confirm('Delete this entry?')) return
    if (onDelete) onDelete(memo.id)
    else {
      deleteMemo(memo.id)
      onRefresh?.()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <article className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-white rounded-t-[16px]">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#f0ede8] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-[13px] text-[#9a9a9a]">My Diary</div>
            <div className="px-2 py-1 rounded-full bg-[#f5f2ef] text-[12px] text-[#c87941]">{memo.tags?.[0] ? `#${memo.tags[0]}` : ''}</div>
            <div className="text-[12px] text-[#777]">{memo.date || memo.createdAt}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleEdit} className="px-3 py-2 rounded-xl bg-[#1a1a1a] text-white text-[13px]">Edit</button>
            <button onClick={handleDelete} className="px-3 py-2 rounded-xl bg-white border border-[#f0ede8] text-red-400 text-[13px]">Delete</button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#aaa] text-[22px] hover:text-[#555] transition-colors leading-none" aria-label="Close">×</button>
          </div>
        </header>

        {/* Image slider */}
        {images.length > 0 ? (
          <div className="relative w-full bg-[#f5f0eb]">
            <img src={images[idx]} alt={`Photo ${idx + 1}`} className="w-full h-[420px] object-cover" />
            {images.length > 1 && (
              <>
                <button className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center text-xl text-[#555] shadow-sm z-10 hover:bg-white" onClick={prev}>‹</button>
                <button className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center text-xl text-[#555] shadow-sm z-10 hover:bg-white" onClick={next}>›</button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
                  {images.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i) }} className={`w-2.5 h-2.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-[#fdf4f0] to-[#f0e8de] flex items-center justify-center">
            <span className="text-7xl opacity-20">📷</span>
          </div>
        )}

        <div className="px-4 pb-6 pt-4">
          {memo.title && (
            <h1 className="font-serif text-[20px] font-semibold italic text-[#1a1a1a] mb-2">{memo.title}</h1>
          )}

          <div className="text-[14px] text-[#333] leading-relaxed whitespace-pre-wrap mb-3">{memo.content}</div>

          {memo.tags && memo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {memo.tags.map(t => (
                <span key={t} className="text-[12px] text-[#c87941]">#{t}</span>
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
              <div className="text-[12px] text-[#777]">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</div>
            </div>

            {comments.length === 0 ? (
              <div className="text-[13px] text-[#bbb] py-6 text-center">No comments yet</div>
            ) : (
              <ul className="space-y-3">
                {comments.map(c => (
                  <li key={c.id} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[13px] text-[#1a1a1a] font-medium">Me <span className="text-[11px] text-[#bbb] ml-2">{new Date(c.createdAt).toLocaleString()}</span></div>
                      <div className="text-[13px] text-[#555] mt-1">{c.text}</div>
                    </div>
                    <button onClick={() => handleDeleteComment(c.id)} className="text-[12px] text-[#ccc] hover:text-red-400">×</button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center gap-3 mt-4">
              <input ref={inputRef} type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment…" className="flex-1 px-3 py-2 border rounded-full bg-[#faf9f7] text-[13px] outline-none" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment() } }} />
              <button onClick={handleAddComment} className={`text-[13px] font-semibold ${commentText.trim() ? 'text-[#c87941]' : 'text-[#ccc]'}`} disabled={!commentText.trim()}>Post</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
