import React from "react"
import { useNavigate } from "react-router-dom" // 만약 react-router 사용 중이라면

type Props = {
  tag: string
}

export default function TagButton({ tag }: Props) {
  const navigate = useNavigate()
  function onClick() {
    // 1) 라우팅 방식: /stories/:tag 로 이동 (StoryRoute가 포스트를 불러와 StoryViewer를 렌더)
    navigate(`/stories/${encodeURIComponent(tag)}`)

    // 또는 2) 상태방식: 전역 상태(redux/Context)로 열기
    // openStoryViewerForTag(tag);
  }

  return (
    <button className="tag-btn" onClick={onClick}>
      #{tag}
    </button>
  )
}
