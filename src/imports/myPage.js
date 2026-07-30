let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getMonth();

// 마이페이지 초기화
function initMyPage() {
    // 1. 프로필/통계 영역 먼저 채우기
    renderMyStats();

    // 2. 기본 뷰: 그리드 뷰 렌더링
    renderGridView();

    // 3. 버튼 클릭 이벤트 연결
    document.getElementById('gridBtn')?.addEventListener('click', renderGridView);
    document.getElementById('calBtn')?.addEventListener('click', renderCalendarView);
}

// 프로필 및 통계 (첫 번째 줄)
function renderMyStats() {
    const memos = (typeof getMemos === "function" ? getMemos() : []).filter(m => !m.deleted);
    const wordCount = memos.reduce((acc, m) => acc + (m.content?.length || 0), 0);
    const tags = new Set();
    memos.forEach(m => m.tags?.forEach(t => tags.add(t)));
    
    document.getElementById('myStats').innerHTML = `
        <div class="stat-item">기록 <strong>${memos.length}</strong></div>
        <div class="stat-item">글자 <strong>${wordCount}</strong></div>
        <div class="stat-item">태그 <strong>${tags.size}</strong></div>
    `;
}

// 그리드 뷰 렌더링 (세 번째 줄)
function renderGridView() {
    const container = document.getElementById('myContentArea');
    const memos = (typeof getMemos === "function" ? getMemos() : [])
                    .filter(m => !m.deleted)
                    .sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    // 1. 먼저 HTML을 그려줍니다. (onclick 삭제)
    container.innerHTML = `
        <div class="grid-container">
            ${memos.map(m => `
                <div class="grid-item" data-id="${m.id}">
                    ${m.images && m.images.length > 0 ? `<img src="${m.images[0]}" alt="preview">` : `<div class="grid-text">${m.title || '기록'}</div>`}
                </div>
            `).join('')}
        </div>
    `;

    // 2. 그려진 후에 각각 클릭 이벤트를 달아줍니다.
    container.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = Number(item.dataset.id);
            // getMemo(id) 함수로 해당 메모 객체를 가져와서 넘겨줍니다.
            if (typeof getMemo === "function" && typeof openEditor === "function") {
                const memo = getMemo(id);
                openEditor(memo); // 편집 모달 오픈!
            }
        });
    });
}
// 달력 뷰 (간단 형태)
function renderCalendarView() {
    const container = document.getElementById('myContentArea');
    const firstDay = new Date(currentCalYear, currentCalMonth, 1).getDay();
    const lastDate = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
    const memos = (typeof getMemos === "function" ? getMemos() : []).filter(m => !m.deleted);

    let html = `
        <div style="position:relative;"> 
            <div class="calendar-header">
                <button type="button" id="prevMonth">‹</button>
                <div id="dateTrigger" class="date-trigger">
                    ${currentCalYear}년 ${currentCalMonth + 1}월 ▾
                </div>
                <button type="button" id="nextMonth">›</button>
            </div>

            <!-- 커스텀 선택 UI -->
            <div id="customDatePicker" class="custom-date-picker hidden">
                <div class="picker-row">
                    <input type="number" id="yearInput" value="${currentCalYear}" min="2000" max="2100">년
                    <select id="monthInput">
                        ${Array.from({length:12}, (_,i)=>`<option value="${i}" ${currentCalMonth === i ? 'selected':''}>${i+1}월</option>`).join('')}
                    </select>
                </div>
                <button id="applyDateBtn" class="apply-btn">확인</button>
            </div>

            <div class="calendar-grid">
                ${['일', '월', '화', '수', '목', '금', '토'].map(d => `<div class="cal-day-name">${d}</div>`).join('')}
                ${Array(firstDay).fill('<div></div>').join('')}
                ${Array.from({length: lastDate}, (_, i) => i + 1).map(day => {
                    const dateStr = `${currentCalYear}-${String(currentCalMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dailyMemos = memos.filter(m => (m.date || m.createdAt)?.startsWith(dateStr));
                    return `<div class="cal-day" data-date="${dateStr}">${day} ${dailyMemos.length > 0 ? `<span class="memo-count">${dailyMemos.length}</span>` : ''}</div>`;
                }).join('')}
            </div>
            <div id="selectedDatePosts" class="feed"></div>
        </div>
    `;
    
    container.innerHTML = html;

    // 모달 토글
    document.getElementById('dateTrigger').addEventListener('click', () => {
        document.getElementById('customDatePicker').classList.toggle('hidden');
    });

    // 날짜 적용
    document.getElementById('applyDateBtn').addEventListener('click', () => {
        currentCalYear = parseInt(document.getElementById('yearInput').value);
        currentCalMonth = parseInt(document.getElementById('monthInput').value);
        renderCalendarView();
    });

    // 이동 버튼 이벤트
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentCalMonth--; if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; }
        renderCalendarView();
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentCalMonth++; if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
        renderCalendarView();
    });

    // 날짜 클릭
    container.querySelectorAll('.cal-day').forEach(dayEl => {
        dayEl.addEventListener('click', () => renderSelectedDatePosts(dayEl.dataset.date, memos));
    });
}

// 클릭한 날짜의 글 리스트 렌더링
function renderSelectedDatePosts(date, allMemos) {
    const listArea = document.getElementById('selectedDatePosts');
    const filtered = allMemos.filter(m => (m.date || m.createdAt)?.startsWith(date));
    
    if (filtered.length === 0) {
        listArea.innerHTML = `<p style="text-align:center; padding:20px;">이 날 작성된 기록이 없습니다.</p>`;
        return;
    }

    listArea.innerHTML = filtered.map(m => `
        <div class="feed-post-simple" data-id="${m.id}" style="padding:10px; border-bottom:1px solid #eee;">
            <strong>${m.title || '제목 없음'}</strong>
            <p style="font-size:12px; color:#666;">${m.content?.substring(0, 30)}...</p>
        </div>
    `).join('');

    // 리스트 클릭 시 오픈 (기존 그리드 방식 재활용)
    listArea.querySelectorAll('.feed-post-simple').forEach(item => {
        item.addEventListener('click', () => {
            if (typeof openEditor === "function") openEditor(getMemo(Number(item.dataset.id)));
        });
    });
}