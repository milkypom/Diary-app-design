import { useState, useEffect } from "react"
import { getMemos } from "../lib/storage"
import type { Memo } from "../lib/types"
import PostCard from "./PostCard"

interface Props {
  refreshKey: number
  onEdit: (memo: Memo) => void
  onRefresh: () => void
  onSelectMemo?: (id: number) => void
}

export default function BookmarkPage({ refreshKey, onEdit, onRefresh, onSelectMemo }: Props) {
  const [memos, setMemos] = useState<Memo[]>([])

  useEffect(() => {
    const bookmarked = getMemos()
      .filter((m) => !m.deleted && m.bookmark)
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime(),
      )
    setMemos(bookmarked)
  }, [refreshKey])

  return (
    <div>
      {memos.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <span className="text-5xl opacity-20">🔖</span>
          <p className="text-[14px] text-[#9a9a9a]">No saved entries yet</p>
          <p className="text-[12px] text-[#bbb]">
            Tap 📑 on any entry to save it
          </p>
        </div>
      ) : (
        memos.map((memo) => (
          <PostCard
            key={memo.id}
            memo={memo}
            onEdit={onEdit}
            onRefresh={onRefresh}
            onSelectMemo={onSelectMemo}
          />
        ))
      )}
    </div>
  )
}
