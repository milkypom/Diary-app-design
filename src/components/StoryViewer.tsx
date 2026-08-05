import React, { useEffect, useRef, useState } from "react";
import "./StoryViewer.css";
import { toggleBookmark, getComments, addComment, deleteComment, getProfile } from '../lib/storage';
import type { Comment } from '../lib/types';
import type { Profile } from '../lib/storage';

const MOOD_ICON: Record<string, string> = {
  happy: '😊',
  normal: '😐',
  sad: '😢',
  angry: '😡',
  excited: '🤩',
  tired: '😴',
  anxious: '😰',
  grateful: '🙏',
};

export type Post = {
  id: string | number;
  imageUrl?: any;
  content?: string;
  title?: string;
  authorName?: string;
  avatarUrl?: string;
  date?: string;
  durationMs?: number;
  mood?: string;
  bookmark?: boolean;
};

type Props = {
  posts: Post[];
  initialIndex?: number;
  tag?: string;
  onClose?: () => void;
  onFinish?: () => void;
  onOpenPost?: (postId: string | number) => void;
  onPrevBoundary?: () => void; // notify parent when requesting previous at first post
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
  const [imageIndex, setImageIndex] = useState(0);
  const [showCaption, setShowCaption] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [profile, setProfile] = useState<Profile>(getProfile());
  const [captionExpanded, setCaptionExpanded] = useState(false);
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

  // Update bookmark state when current post changes
  useEffect(() => {
    if (current) {
      setBookmarked(current.bookmark || false);
    }
  }, [current]);

  // Reset caption expansion when post changes
  useEffect(() => {
    setCaptionExpanded(false);
  }, [index]);

  // Load comments when comment modal opens
  useEffect(() => {
    if (commentOpen && current) {
      setComments(getComments(Number(current.id)));
    }
  }, [commentOpen, current]);

  // Reset image index when post changes
  useEffect(() => {
    setImageIndex(0);
  }, [index]);

  const images = current?.imageUrl
    ? Array.isArray(current.imageUrl)
      ? current.imageUrl
      : [current.imageUrl]
    : [];

  const currentImage = images[imageIndex];
  const hasMultipleImages = images.length > 1;

  const handleImageNext = () => {
    if (imageIndex < images.length - 1) {
      setImageIndex(i => i + 1);
    }
  };

  const handleImagePrev = () => {
    if (imageIndex > 0) {
      setImageIndex(i => i - 1);
    }
  };

  const handleBookmark = () => {
    if (!current) return;
    setBookmarked(b => !b);
    toggleBookmark(Number(current.id));
  };

  const handleAddComment = () => {
    if (!current || !commentText.trim()) return;
    const c = addComment(Number(current.id), commentText);
    setComments(prev => [...prev, c]);
    setCommentText('');
  };

  const handleDeleteComment = (cid: number) => {
    deleteComment(cid);
    setComments(prev => prev.filter(c => c.id !== cid));
  };

  const commentRelativeTime = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

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
  }, [index, paused, current?.durationMs, current?.id, safeIndex]);

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
      // at first post => notify parent so it can switch to previous tag
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
        <div className="progress-bar">
          {posts.map((p, i) => (
            <div
              key={`${String(p.id)}-${i}`}
              className={`progress-segment ${i < safeIndex ? 'completed' : ''}`}
              style={{ width: `${100 / posts.length}%` }}
            />
          ))}
        </div>

        <div className="story-profile">
          <div className="profile-avatar placeholder">
            {current?.mood && MOOD_ICON[current.mood] ? MOOD_ICON[current.mood] : '📝'}
          </div>
          <div className="profile-meta">
            {tag && <div className="profile-tag">#{tag}</div>}
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close story">
            ✕
          </button>
        </div>
      </div>

      <div className="story-content" onClick={() => goNext()}>
        {currentImage ? (
          <img src={String(currentImage)} alt="story" className="story-media" />
        ) : (
          <div className="story-text">{current?.content}</div>
        )}

        {/* Image indicators */}
        {hasMultipleImages && (
          <div className="image-indicators">
            {images.map((_, i) => (
              <div
                key={i}
                className={`image-dot ${i === imageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* Caption toggle button */}
        {!showCaption && (
          <button
            className="caption-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowCaption(!showCaption);
            }}
            aria-label="Toggle caption"
          >
            <img src="/img/arrow-down-w-line-1.png" alt="Toggle caption" className="caption-toggle-icon" />
          </button>
        )}

        <div
          className={`story-caption ${showCaption ? 'visible' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowCaption(false);
          }}
        >
          <div className="story-caption-header">
            {current?.title && <div className="story-title">{current.title}</div>}
            <div className="story-actions">

              <button
                className="story-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setCommentOpen(true);
                }}
                aria-label="Comments"
              >
                💬
              </button>
              <button
                className={`story-action-btn bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark();
                }}
                aria-label="Bookmark"
              >
                {bookmarked ? <img src="/img/bookmark_on-w.png" alt="Saved" className="bookmark-icon" /> : <img src="/img/bookmark_off-w.png" alt="Bookmark" className="bookmark-icon" />}
              </button>
            </div>
          </div>
          {current?.content && (
            <div 
              className="story-body"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPost?.(current.id);
              }}
            >
              {captionExpanded || current.content.length <= 100 ? (
                <>{current.content}</>
              ) : (
                <>
                  {current.content.slice(0, 100)}…
                  <button 
                    className="caption-more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCaptionExpanded(true);
                    }}
                  >
                    more
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Image navigation buttons */}
        {hasMultipleImages && (
          <>
            {imageIndex > 0 && (
              <button
                className="image-nav-btn left"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImagePrev();
                }}
                aria-label="Previous image"
              >
                ‹
              </button>
            )}
            {imageIndex < images.length - 1 && (
              <button
                className="image-nav-btn right"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageNext();
                }}
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </>
        )}

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

        {/* Comment modal */}
        {commentOpen && (
          <div className="story-comment-modal" onClick={() => setCommentOpen(false)}>
            <div className="story-comment-backdrop" />
            <div
              className="story-comment-content"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="story-comment-header">
                <div className="story-comment-handle" />
                <span className="story-comment-title">Comments</span>
                <button
                  className="story-comment-close"
                  onClick={() => setCommentOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {/* Comment list */}
              <div className="story-comment-list">
                {comments.length === 0 ? (
                  <div className="story-comment-empty">
                    <span className="story-comment-empty-icon">💬</span>
                    <p className="story-comment-empty-text">No comments yet. Be the first!</p>
                  </div>
                ) : (
                  <ul className="story-comment-items">
                    {comments.map(c => (
                      <li key={c.id} className="story-comment-item">
                        <div className={`story-comment-avatar ${profile.avatarColor}`}>
                          {profile.avatar ? (
                            <img src={profile.avatar} alt="" className="story-comment-avatar-img" />
                          ) : (
                            <span className="story-comment-avatar-emoji">{profile.avatarEmoji}</span>
                          )}
                        </div>
                        <div className="story-comment-body">
                          <div className="story-comment-meta">
                            <span className="story-comment-author">{profile.name}</span>
                            <span className="story-comment-time">{commentRelativeTime(c.createdAt)}</span>
                          </div>
                          <p className="story-comment-text">{c.text}</p>
                        </div>
                        <button
                          className="story-comment-delete"
                          onClick={() => handleDeleteComment(c.id)}
                          aria-label="Delete comment"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Comment input */}
              <div className="story-comment-input-area">
                <div className={`story-comment-input-avatar ${profile.avatarColor}`}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="" className="story-comment-avatar-img" />
                  ) : (
                    <span className="story-comment-avatar-emoji">{profile.avatarEmoji}</span>
                  )}
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                  placeholder="Write a comment…"
                  className="story-comment-input"
                />
                <button
                  className={`story-comment-send ${commentText.trim() ? 'active' : ''}`}
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}