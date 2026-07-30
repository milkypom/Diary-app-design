import React from 'react'
import type { Memo } from '../lib/types'

interface Props {
  memo: Memo | null
  onClose: () => void
}

export default function PostDetailModal({ memo, onClose }: Props) {
  if (!memo) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <article className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-white rounded-t-[16px]">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#f0ede8] px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-[#9a9a9a]">My Diary</p>
            <p className="text-[12px] text-[#777] mt-0.5">{memo.date || memo.createdAt}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#aaa] text-[22px] hover:text-[#555] transition-colors leading-none" aria-label="Close">×</button>
        </header>

        {/* Images */}
        {memo.images && memo.images.length > 0 ? (
          <div className="w-full bg-[#f5f0eb]">
            {memo.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`Photo ${i + 1}`} className="w-full object-cover" style={{ maxHeight: 560 }} />
            ))}
          </div>
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-[#fdf4f0] to-[#f0e8de] flex items-center justify-center">
            <span className="text-7xl opacity-20">📷</span>
          </div>
        )}

        <div className="px-4 pb-6 pt-4">
          {/* Title & meta */}
          {memo.title && (
            <h1 className="font-serif text-[20px] font-semibold italic text-[#1a1a1a] mb-2">{memo.title}</h1>
          )}

          <div className="text-[14px] text-[#333] leading-relaxed whitespace-pre-wrap">{memo.content}</div>

          {memo.tags && memo.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {memo.tags.map(t => (
                <span key={t} className="text-[12px] text-[#c87941]">#{t}</span>
              ))}
            </div>
          )}

          {memo.location && (
            <p className="text-[12px] text-[#9a9a9a] mt-3">📍 {memo.location}</p>
          )}
        </div>
      </article>
    </div>
  )
}
