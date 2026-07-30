import React, { useEffect, useRef, useState } from "react";

export type Post = {
  id: string | number;
  imageUrl?: string;
  content?: string;
  durationMs?: number;
};

type Props = {
  posts: Post[];
  initialIndex?: number;
  onClose?: () => void;
};

export default function StoryViewer({ posts, initialIndex = 0, onClose }: Props) {
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

  function goNext() {
    if (index < posts.length - 1) setIndex(i => i + 1);
    else onClose?.();
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
        {posts.map((p, i) => (
          <div key={String(p.id)} className={`progress ${i < index ? "done" : i === index ? "active" : ""}`}>
            <div
              className="bar"
              style={{ width: i < index ? "100%" : i === index ? (paused ? "50%" : "0%") : "0%" }}
            />
          </div>
        ))}
        <button className="close-btn" onClick={onClose} aria-label="Close story">✕</button>
      </div>

      <div className="story-content">
        {current.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(current.imageUrl)} alt="story" className="story-media" />
        ) : (
          <div className="story-text">{current.content}</div>
        )}
        <div className="tap-zone left" onClick={goPrev} />
        <div className="tap-zone right" onClick={goNext} />
      </div>
    </div>
  );
}
