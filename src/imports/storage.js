// ============================================================
// storage.js
// 데이터 저장 및 관리
// ============================================================

const STORAGE_KEY = "daylog_memos";

// 1. 메모 전체 불러오기
function getMemos() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 2. 메모 전체 저장하기 (용량 초과 에러 방어 적용)
function saveMemos(memos) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
        return true;
    } catch (e) {
        // QuotaExceededError (용량 초과 에러) 발생 시 처리
        if (e.name === "QuotaExceededError" || e.code === 22) {
            alert("⚠️ 저장 공간이 부족합니다!\n이미지 크기를 줄이거나 기존 메모를 일부 삭제해 주세요.");
        } else {
            alert("저장 중 오류가 발생했습니다.");
        }
        console.error("Storage save failed:", e);
        return false;
    }
}

// 3. 단일 메모 불러오기
function getMemo(id) {
    const memos = getMemos();
    return memos.find(m => m.id === id) || null;
}

// 4. 메모 추가하기
function addMemo(memoData) {
    const memos = getMemos();
    const newMemo = {
        id: Date.now(),
        title: memoData.title || "",
        content: memoData.content || "",
        date: memoData.date || new Date().toISOString().split('T')[0],
        tags: memoData.tags || [],
        location: memoData.location || "",
        images: memoData.images || [],
        bookmark: false,
        deleted: false,
        createdAt: new Date().toISOString(),
        ...memoData
    };

    memos.unshift(newMemo);
    saveMemos(memos);
    return newMemo;
}

// 5. 메모 수정하기 (보내주신 코드)
function updateMemo(id, newData) {
    const memos = getMemos();
    const memo = memos.find(m => m.id === id);

    if (!memo) return false;

    Object.assign(memo, newData);
    memo.updatedAt = new Date().toISOString();

    saveMemos(memos);
    return true;
}

// 6. 메모 삭제하기 (소프트 삭제)
function deleteMemo(id) {
    const memos = getMemos();
    const memo = memos.find(m => m.id === id);

    if (memo) {
        memo.deleted = true;
        saveMemos(memos);
        return true;
    }
    return false;
}

// 7. 북마크 토글
function toggleBookmark(id) {
    const memos = getMemos();
    const memo = memos.find(m => m.id === id);

    if (memo) {
        memo.bookmark = !memo.bookmark;
        saveMemos(memos);
        return memo.bookmark;
    }
    return false;
}

// 8. 키워드 검색
function searchMemo(keyword) {
    if (!keyword) return [];
    const memos = getMemos();
    const lower = keyword.toLowerCase();

    return memos.filter(memo => {
        if (memo.deleted) return false;

        const titleMatch = memo.title && memo.title.toLowerCase().includes(lower);
        const contentMatch = memo.content && memo.content.toLowerCase().includes(lower);
        const tagMatch = memo.tags && memo.tags.some(tag => tag.toLowerCase().includes(lower));

        return titleMatch || contentMatch || tagMatch;
    });
}

// 9. 샘플 데이터 자동 생성 (피드 테스트용)
function initSampleData() {
    const existingMemos = getMemos();
    
    // 이미 등록된 메모가 있다면 생성 안 함
    if (existingMemos.length > 0) return;

    const sampleMemos = [
        {
            id: Date.now(),
            title: "성수동 분위기 좋은 카페 발견 ☕",
            content: "주말을 맞아 성수동에 있는 새로운 카페에 다녀왔다. 조용하고 커피 맛도 깔끔해서 자주 오게 될 것 같다. 다음에는 디저트도 먹어봐야지!",
            date: new Date().toISOString().split('T')[0],
            tags: ["카페", "성수동", "주말일상"],
            location: "성수동 카페거리",
            images: ["https://picsum.photos/seed/cafe/600/600"],
            bookmark: true,
            deleted: false,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 1,
            title: "저녁 한강 라이딩 🚲",
            content: "날씨가 좋아서 저녁 먹고 한강으로 자전거 타고 나왔다. 시원한 바람 맞으면서 달리는 기분이 최고였다. 스트레스가 싹 풀리는 기분!",
            date: new Date().toISOString().split('T')[0],
            tags: ["자전거", "한강", "운동"],
            location: "뚝섬한강공원",
            images: ["https://picsum.photos/seed/bike/600/600"],
            bookmark: false,
            deleted: false,
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    saveMemos(sampleMemos);
}
// 북마크 토글 (ON / OFF)
function toggleBookmark(id) {
    const memos = getMemos();
    const target = memos.find(m => m.id === id);

    if (target) {
        // bookmark 값이 true면 false로, false/undefined면 true로 전환
        target.bookmark = !target.bookmark;
        saveMemos(memos);
    }
}