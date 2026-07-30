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
      <div className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-white rounded-t-[16px] p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-[#777]">{memo.date || memo.createdAt}</div>
            <h2 className="font-serif text-lg font-semibold text-[#111]">{memo.title}</h2>
          </div>
          <button onClick={onClose} className="text-xl text-[#999]">×</button>
        </div>

        {memo.images && memo.images.length > 0 && (
          <div className="w-full aspect-square mb-3 overflow-hidden rounded-lg">
            <img src={memo.images[0]} alt="photo" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="text-[14px] text-[#333] leading-relaxed mb-3">{memo.content}</div>

        {memo.tags && memo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {memo.tags.map(t => (
              <span key={t} className="text-[12px] text-[#c87941]">#{t}</span>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
