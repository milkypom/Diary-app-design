import React, { useEffect, useRef, useState } from "react";
import "./StoryViewer.css";

export type Post = {
  id: string | number;
  // imageUrl may sometimes be an array or a string; runtime code will pick the first entry
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
  onOpenPost?: (postId: string | number) => void; // open detail view
};

export default function StoryViewer({ posts, initialIndex = 0, tag, onClose, onFinish, onOpenPost }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const current = posts[index];
  const defaultDuration = 3500;

  // Determine main image safely: if imageUrl is an array, use its first element.
  const imageSrc = current?.imageUrl
    ? Array.isArray(current.imageUrl)
      ? current.imageUrl[0]
      : current.imageUrl
    : undefined;

  useEffect(() => {
    if (paused) return;
    const duration = current?.durationMs ?? defaultDuration;
    timerRef.current = window.setTimeout(() => {
      goNext();
    }, duration);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current as number);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, current?.durationMs]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, posts]);

  function goNext() {
    if (index < posts.length - 1) setIndex(i => i + 1);
    else onFinish?.();
  }
  function goPrev() {
    if (index > 0) setIndex(i => i - 1);
  }

  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) { setPaused(false); return; }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 50) goPrev();
    else if (dx < -50) goNext();
    touchStartX.current = null;
    setPaused(false);
  }

  if (!posts || posts.length === 0) return null;

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
            <div key={String(p.id)} className={`dot ${i === index ? 'active' : i < index ? 'done' : ''}`}></div>
          ))}
        </div>

        <button className="close-btn" onClick={onClose} aria-label="Close story">✕</button>
      </div>

      <div
        className="story-content"
        onClick={() => { goNext(); }} // single tap anywhere advances
      >
        {imageSrc ? (
          <img src={String(imageSrc)} alt="story" className="story-media" />
        ) : (
          <div className="story-text">{current.content}</div>
        )}

        <div
          className="story-caption"
          onClick={(e) => { e.stopPropagation(); onClose?.(); onOpenPost?.(current.id); }} // open detail
        >
          {current.title && <div className="story-title">{current.title}</div>}
          {current.content && <div className="story-body">{current.content}</div>}
        </div>

        <button className="nav-btn left" onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous">‹</button>
        <button className="nav-btn right" onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next">›</button>
      </div>
    </div>
  );
}
