import React, { useEffect, useRef, useState } from "react";
import "./StoryViewer.css";

export type Post = {
  id: string | number;
  imageUrl?: any;
  content?: string;
  title?: string;
  authorName?: string;
  avatarUrl?: string;
  date?: string;
  durationMs?: number;
};

type Props = {
  posts: Post[];
  initialIndex?: number;
  tag?: string;
  onClose?: () => void;
  onFinish?: () => void;
  onOpenPost?: (postId: string | number) => void;
  onPrevBoundary?: () => void; // <-- 추가: 첫 게시물에서 이전 요청시 부모로 알림
};

export default function StoryViewer({
  posts,
  initialIndex = 0,
  tag,
  onClose,
  onFinish,
  onOpenPost,
  onPrevBoundary,
}: Props) {
  const [index, setIndex] = useState(() => Math.max(0, initialIndex));
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!posts || posts.length === 0) {
      setIndex(0);
      return;
    }
    const clamped = Math.max(0, Math.min(index, posts.length - 1));
    if (clamped !== index) setIndex(clamped);
    const initClamped = Math.max(0, Math.min(initialIndex, posts.length - 1));
    if (initialIndex !== undefined && initClamped !== index) {
      setIndex(initClamped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, initialIndex]);

  const safeIndex = posts && posts.length > 0 ? Math.max(0, Math.min(index, posts.length - 1)) : 0;
  const current = posts && posts.length > 0 ? posts[safeIndex] : undefined;
  const defaultDuration = 3500;

  const imageSrc = current?.imageUrl
    ? Array.isArray(current.imageUrl)
      ? current.imageUrl[0]
      : current.imageUrl
    : undefined;

  useEffect(() => {
    if (paused) return;
    if (!current) return;
    const duration = current.durationMs ?? defaultDuration;
    timerRef.current = window.setTimeout(() => {
      goNext();
    }, duration);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current as number);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, current?.durationMs, current?.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, posts]);

  function goNext() {
    if (!posts || posts.length === 0) return;
    if (index < posts.length - 1) setIndex((i) => i + 1);
    else onFinish?.();
  }
  function goPrev() {
    if (!posts || posts.length === 0) return;
    if (index > 0) setIndex((i) => i - 1);
    else {
      // 첫 게시물에서 이전 요청 → 부모에게 알림 (이전 태그로 이동 등)
      onPrevBoundary?.();
    }
  }

  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) {
      setPaused(false);
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) goPrev();
    else if (dx < -50) goNext();
    touchStartX.current = null;
    setPaused(false);
  }

  if (!posts || posts.length === 0) return null;
  if (!current) return null;

  return (
    <div
      className="story-overlay"
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="story-top">
        <div className="story-profile">
          <div className="profile-avatar placeholder">📝</div>
          <div className="profile-meta">
            {tag && <div className="profile-tag">#{tag}</div>}
          </div>
        </div>

        <div className="progress-group">
          {posts.map((p, i) => (
            <div
              key={String(p.id)}
              className={`dot ${i === safeIndex ? "active" : i < safeIndex ? "done" : ""}`}
            ></div>
          ))}
        </div>

        <button className="close-btn" onClick={onClose} aria-label="Close story">
          ✕
        </button>
      </div>

      <div className="story-content" onClick={() => goNext()}>
        {imageSrc ? (
          <img src={String(imageSrc)} alt="story" className="story-media" />
        ) : (
          <div className="story-text">{current?.content}</div>
        )}

        <div
          className="story-caption"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
            onOpenPost?.(current.id);
          }}
        >
          {current?.title && <div className="story-title">{current.title}</div>}
          {current?.content && <div className="story-body">{current.content}</div>}
        </div>

        <button
          className="nav-btn left"
          onClick={(e) => {
            e.stopPropagation();
            setPaused(true);
            goPrev();
            setTimeout(() => setPaused(false), 50);
          }}
          aria-label="Previous"
          style={{ zIndex: 40, pointerEvents: "auto" }}
        >
          ‹
        </button>

        <button
          className="nav-btn right"
          onClick={(e) => {
            e.stopPropagation();
            setPaused(true);
            goNext();
            setTimeout(() => setPaused(false), 50);
          }}
          aria-label="Next"
          style={{ zIndex: 40, pointerEvents: "auto" }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
