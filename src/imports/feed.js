// =============================
// feed.js (전체 기능 포함 완료본)
// =============================

let feedMemos = [];
const engagementData = new Map();

// 1. 초기화
function initFeed() {
    if (typeof initSampleData === "function") initSampleData();
    loadFeed();
    renderTagShortcuts();
    setupNavigation();
}

// 2. 피드 로드
function loadFeed() {
    if (typeof getMemos !== "function") return;
    const rawMemos = getMemos() || [];
    feedMemos = rawMemos.filter(memo => memo && !memo.deleted);
    feedMemos.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
    
    renderTagShortcuts();
    renderFeed("#feed");
}

// 3. 피드 렌더링
function renderFeed(targetSelector = "#feed") {
    const feed = document.querySelector(targetSelector);
    if (!feed) return;
    feed.innerHTML = "";

    if (feedMemos.length === 0) {
        targetSelector === "#bookmarkList" ? renderEmptyBookmark(feed) : renderEmptyFeed(feed);
        return;
    }

    feedMemos.forEach(memo => feed.appendChild(createPost(memo)));
    setupPostEvents();
}

// 4. 게시글 카드 생성
function createPost(memo) {
    const article = document.createElement("article");
    article.className = "feed-post";
    article.dataset.memoId = memo.id;
    const engagement = getEngagementData(memo.id);

    article.innerHTML = `
        <header class="post-header">
            <div class="post-user">
                <div class="profile-image"><span>👤</span></div>
                <div class="post-user-info">
                    <strong>나의 기록</strong>
                    <span>${formatDate(memo.date || memo.createdAt)}</span>
                </div>
            </div>
            <div class="post-menu">
                <button type="button" class="post-menu-button">⋯</button>
                <div class="post-menu-dropdown">
                    <button type="button" class="edit-post">수정</button>
                    <button type="button" class="delete-post">삭제</button>
                </div>
            </div>
        </header>
        ${renderPostImages(memo)}
        <div class="post-actions">
            <div class="post-action-left">
                <button type="button" class="like-button">♡</button>
                <span class="like-count">${engagement.likes}</span>
                <button type="button" class="comment-button">💬</button>
                <span class="comment-count">${engagement.comments}</span>
            </div>
            <button type="button" class="bookmark-button ${memo.bookmark ? "active" : ""}">
                ${memo.bookmark ? "★" : "☆"}
            </button>
        </div>
        ${memo.title ? `<h2 class="post-title">${escapeHTML(memo.title)}</h2>` : ""}
        ${memo.content ? `<p class="post-content">${formatContent(memo.content)}</p>` : ""}
        ${memo.tags && memo.tags.length ? `
            <div class="post-tags">
                ${memo.tags.map(tag => `<button type="button" class="post-tag" data-tag="${escapeHTML(tag)}">#${escapeHTML(tag)}</button>`).join("")}
            </div>
        ` : ""}
        ${memo.location ? `<div class="post-location">📍 ${escapeHTML(memo.location)}</div>` : ""}
    `;
    return article;
}

// 5. 이미지 슬라이더 처리
function renderPostImages(memo) {
    const images = memo.images || [];
    if (images.length === 0) return `<div class="post-image-empty"><span>📷</span></div>`;
    if (images.length === 1) return `<div class="post-image-slider"><div class="post-image-track"><img src="${images[0]}" class="post-image active"></div></div>`;
    
    return `
        <div class="post-image-slider">
            <button type="button" class="post-image-prev">‹</button>
            <div class="post-image-track">
                ${images.map((img, idx) => `<img src="${img}" class="post-image ${idx === 0 ? "active" : ""}">`).join("")}
            </div>
            <button type="button" class="post-image-next">›</button>
            <div class="post-image-counter">1 / ${images.length}</div>
        </div>
    `;
}

// 6. 이벤트 설정 (이미지, 수정, 삭제, 북마크, 태그)
function setupPostEvents() {
    document.querySelectorAll(".feed-post").forEach(post => {
        const slider = post.querySelector(".post-image-slider");
        if (slider) {
            const images = slider.querySelectorAll(".post-image");
            const prev = slider.querySelector(".post-image-prev");
            const next = slider.querySelector(".post-image-next");
            const counter = slider.querySelector(".post-image-counter");
            let idx = 0;
            if (images.length > 1) {
                const update = (newIdx) => {
                    idx = (newIdx + images.length) % images.length;
                    images.forEach((img, i) => img.classList.toggle("active", i === idx));
                    if (counter) counter.textContent = `${idx + 1} / ${images.length}`;
                };
                if (prev) prev.addEventListener("click", () => update(idx - 1));
                if (next) next.addEventListener("click", () => update(idx + 1));
            }
        }
        
        post.querySelector(".post-menu-button")?.addEventListener("click", (e) => { e.stopPropagation(); post.querySelector(".post-menu-dropdown").classList.toggle("active"); });
        post.querySelector(".edit-post")?.addEventListener("click", () => { if (typeof openEditor === "function") openEditor(typeof getMemo === "function" ? getMemo(Number(post.dataset.memoId)) : null); });
        post.querySelector(".delete-post")?.addEventListener("click", () => { if (confirm("삭제하시겠습니까?") && typeof deleteMemo === "function") { deleteMemo(Number(post.dataset.memoId)); refreshCurrentPage(); } });
        post.querySelector(".bookmark-button")?.addEventListener("click", () => { if (typeof toggleBookmark === "function") { toggleBookmark(Number(post.dataset.memoId)); refreshCurrentPage(); } });
        post.querySelectorAll(".post-tag").forEach(tagBtn => tagBtn.addEventListener("click", () => filterByTag(tagBtn.dataset.tag)));
    });
}

// 7. 기타 필수 유틸리티
function refreshCurrentPage() {
    const page = document.querySelector(".nav-item.active")?.dataset.page;
    page === "bookmark" ? filterByBookmark() : loadFeed();
}

function getEngagementData(id) {
    if (engagementData.has(id)) return engagementData.get(id);
    const data = { likes: Math.floor(Math.random() * 150 + 10), comments: Math.floor(Math.random() * 15) };
    engagementData.set(id, data);
    return data;
}

function renderEmptyFeed(feed) { feed.innerHTML = `<div style="text-align:center; padding: 50px 20px; color: #8e8e8e;">📖<br>아직 기록이 없습니다.</div>`; }
function renderEmptyBookmark(feed) { feed.innerHTML = `<div style="text-align:center; padding: 50px 20px; color: #8e8e8e;">☆<br>북마크한 기록이 없습니다.</div>`; }
function formatDate(d) { const date = new Date(d); return isNaN(date.getTime()) ? d : `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`; }
function formatContent(s) { return escapeHTML(s).replace(/\n/g, "<br>"); }
function escapeHTML(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// 8. 태그/내비게이션
function renderTagShortcuts() {
    const container = document.querySelector("#tagShortcuts");
    if (!container || typeof getMemos !== "function") return;
    const tags = new Set();
    (getMemos() || []).filter(m => !m.deleted).forEach(m => m.tags?.forEach(t => tags.add(t)));
    container.innerHTML = Array.from(tags).map(t => `<button type="button" class="tag-shortcut" data-tag="${escapeHTML(t)}">#${escapeHTML(t)}</button>`).join("");
    container.querySelectorAll(".tag-shortcut").forEach(btn => btn.addEventListener("click", () => filterByTag(btn.dataset.tag)));
}

function renderBookmarkTagShortcuts() {
    const container = document.querySelector("#bookmarkTagShortcuts");
    if (!container || typeof getMemos !== "function") return;
    const tags = new Set();
    (getMemos() || []).filter(m => !m.deleted && m.bookmark).forEach(m => m.tags?.forEach(t => tags.add(t)));
    container.innerHTML = Array.from(tags).map(t => `<button type="button" class="tag-shortcut" data-tag="${escapeHTML(t)}">#${escapeHTML(t)}</button>`).join("");
    container.querySelectorAll(".tag-shortcut").forEach(btn => btn.addEventListener("click", () => filterByBookmarkTag(btn.dataset.tag)));
}

function filterByTag(tag) {
    if (typeof getMemos !== "function") return;
    const activeNav = document.querySelector(".nav-item.active")?.dataset.page;
    if (activeNav === "bookmark") filterByBookmarkTag(tag);
    else { feedMemos = (getMemos() || []).filter(m => !m.deleted && m.tags?.includes(tag)); renderFeed("#feed"); }
}

function filterByBookmarkTag(tag) {
    if (typeof getMemos !== "function") return;
    feedMemos = (getMemos() || []).filter(m => !m.deleted && m.bookmark && m.tags?.includes(tag));
    renderFeed("#bookmarkList");
}

function filterByBookmark() {
    if (typeof getMemos !== "function") return;
    feedMemos = (getMemos() || []).filter(m => !m.deleted && m.bookmark).sort((a,b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    renderBookmarkTagShortcuts();
    renderFeed("#bookmarkList");
}

function setupNavigation() {
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", function() {
            const page = this.dataset.page;
            if (!page) return;
            
            document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
            this.classList.add("active");
            
            document.querySelectorAll(".page").forEach(p => { p.hidden = true; p.classList.remove("active"); });
            
            const target = document.querySelector(`#${page}Page`) || document.querySelector(`#${page}`);
            if (target) { 
                target.hidden = false; 
                target.classList.add("active"); 
            }
            
            // 여기서 페이지별로 기능을 실행합니다
            if (page === "home") {
                loadFeed();
            } else if (page === "bookmark") {
                filterByBookmark();
            } else if (page === "my") { // ★ 추가된 부분
                if (typeof initMyPage === "function") initMyPage();
            }
        });
    });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initFeed);
else setTimeout(initFeed, 50);