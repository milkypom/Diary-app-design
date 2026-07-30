import React, { useEffect, useRef, useState } from "react";
import "./StoryViewer.css";

export type Post = {
  id: string | number;
  imageUrl?: string;
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
  onFinish?: () => void; // called when finishing all posts in this tag
};

export default function StoryViewer({ posts, initialIndex = 0, tag, onClose, onFinish }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const current = posts[index];
  const defaultDuration = 3500;

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
    else {
      // finished this tag
      onFinish?.();
    }
  }
  function goPrev() {
    if (index > 0) setIndex(i => i - 1);
  }

  // Simple swipe detection
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  }
  function onTouchMove(e: React.TouchEvent) {
    // optional: visual feedback
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

  return (
    <div
      className="story-overlay"
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="story-top">
        <div className="story-profile">
          {current?.avatarUrl ? (
            <img src={String(current.avatarUrl)} alt={current.authorName || 'Author'} className="profile-avatar" />
          ) : (
            <div className="profile-avatar placeholder">📝</div>
          )}
          <div className="profile-meta">
            <div className="profile-name">{current?.authorName ?? 'My Diary'}</div>
            {current?.date && <div className="profile-date">{current.date}</div>}
          </div>
        </div>

        <div className="tag-pill">{tag ? `#${tag}` : null}</div>

        <div className="progress-group">
          {posts.map((p, i) => (
            <div key={String(p.id)} className={`progress ${i < index ? "done" : i === index ? "active" : ""}`}>
              <div
                className="bar"
                style={{ width: i < index ? "100%" : i === index ? (paused ? "50%" : "0%") : "0%" }}
              />
            </div>
          ))}
        </div>

        <button className="close-btn" onClick={onClose} aria-label="Close story">✕</button>
      </div>

      <div className="story-content">
        {current.imageUrl ? (
          <img src={String(current.imageUrl)} alt="story" className="story-media" />
        ) : (
          <div className="story-text">{current.content}</div>
        )}

        <div className="story-caption">
          {current.title && <div className="story-title">{current.title}</div>}
          {current.content && <div className="story-body">{current.content}</div>}
        </div>

        <button className="nav-btn left" onClick={goPrev} aria-label="Previous">‹</button>
        <button className="nav-btn right" onClick={goNext} aria-label="Next">›</button>
      </div>
    </div>
  );
}
