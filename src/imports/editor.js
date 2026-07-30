// ============================================================
// editor.js
// 메모 작성 / 수정
// ============================================================


// ============================================================
// 상태
// ============================================================

let editingMemoId = null;

let editorData = {
    images: [],
    date: "",
    weather: "",
    mood: "",
    location: "",
    title: "",
    content: "",
    tags: []
};

let currentStep = 1;
let currentImageIndex = 0;


// ============================================================
// 편집창 열기
// ============================================================

function openEditor(memo = null) {

    if (memo) {

        editingMemoId = memo.id;

        editorData = {
            images: Array.isArray(memo.images)
                ? [...memo.images]
                : [],

            date: memo.date || getToday(),
            weather: memo.weather || "",
            mood: memo.mood || "",
            location: memo.location || "",
            title: memo.title || "",
            content: memo.content || "",

            tags: Array.isArray(memo.tags)
                ? [...memo.tags]
                : []
        };

    } else {

        editingMemoId = null;

        editorData = {
            images: [],
            date: getToday(),
            weather: "",
            mood: "",
            location: "",
            title: "",
            content: "",
            tags: []
        };
    }

    currentStep = 1;
    currentImageIndex = 0;

    createEditorModal();
}


// ============================================================
// 모달 생성
// ============================================================

function createEditorModal() {

    const oldModal =
        document.querySelector("#editorModal");

    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement("div");

    modal.id = "editorModal";
    modal.className = "modal";


    modal.innerHTML = `

        <div class="modal-overlay"></div>

        <section
            class="editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editorTitle">

            <header class="editor-header">

                <h2 id="editorTitle">
                    ${editingMemoId ? "일기 수정" : "새 기록"}
                </h2>

                <button
                    type="button"
                    class="close-editor"
                    aria-label="닫기">
                    ×
                </button>

            </header>


            <div
                class="editor-progress"
                aria-label="작성 단계">

                <span
                    class="step active"
                    data-step="1">
                    1
                </span>

                <span class="step-line"></span>

                <span
                    class="step"
                    data-step="2">
                    2
                </span>

                <span class="step-line"></span>

                <span
                    class="step"
                    data-step="3">
                    3
                </span>

            </div>


            <div id="editorStepContent"></div>

        </section>
    `;


    document.body.appendChild(modal);


    const closeButton =
        modal.querySelector(".close-editor");

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeEditor
        );
    }


    const overlay =
        modal.querySelector(".modal-overlay");

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeEditor
        );
    }


    renderCurrentStep();
}


// ============================================================
// 현재 단계 출력
// ============================================================

function renderCurrentStep() {

    const modal =
        document.querySelector("#editorModal");

    if (!modal) {
        return;
    }


    const container =
        modal.querySelector("#editorStepContent");

    if (!container) {
        return;
    }


    modal
        .querySelectorAll(".editor-progress .step")
        .forEach(step => {

            step.classList.toggle(
                "active",
                Number(step.dataset.step) === currentStep
            );

        });


    if (currentStep === 1) {

        renderImageStep(container);

    } else if (currentStep === 2) {

        renderInfoStep(container);

    } else if (currentStep === 3) {

        renderContentStep(container);

    }
}


// ============================================================
// STEP 1
// 사진
// ============================================================

function renderImageStep(container) {

    if (
        editorData.images.length > 0 &&
        currentImageIndex >= editorData.images.length
    ) {
        currentImageIndex =
            editorData.images.length - 1;
    }


    if (currentImageIndex < 0) {
        currentImageIndex = 0;
    }


    container.innerHTML = `

        <div class="editor-step step-image">

            <div class="step-heading">

                <p class="step-number">
                    STEP 1
                </p>

                <h3>
                    오늘의 사진
                </h3>

                <p>
                    사진을 먼저 골라주세요.
                </p>

            </div>


            <div
                class="image-slider"
                id="imageSlider">

                ${
                    editorData.images.length > 0

                    ? `

                        <button
                            type="button"
                            class="image-nav prev-image"
                            aria-label="이전 사진">
                            ‹
                        </button>


                        <div class="image-slide">

                            <img
                                id="editorImage"
                                src="${editorData.images[currentImageIndex]}"
                                alt="선택한 사진">

                        </div>


                        <button
                            type="button"
                            class="image-nav next-image"
                            aria-label="다음 사진">
                            ›
                        </button>

                    `

                    : `

                        <div class="empty-image">

                            <span>
                                📷
                            </span>

                            <p>
                                아직 사진이 없어요.
                            </p>

                        </div>

                    `
                }

            </div>


            ${
                editorData.images.length > 0

                ? `

                    <div class="image-counter">
                        ${currentImageIndex + 1}
                        /
                        ${editorData.images.length}
                    </div>

                    <button
                        type="button"
                        class="remove-current-image">
                        현재 사진 삭제
                    </button>

                `

                : ""
            }


            <label
                for="imageInput"
                class="image-add-button">

                + 사진 추가

            </label>


            <input
                type="file"
                id="imageInput"
                accept="image/*"
                multiple
                hidden>


            <div class="editor-actions">

                <button
                    type="button"
                    class="next-step">
                    다음 →
                </button>

            </div>

        </div>
    `;


    // --------------------------------------------------------
    // 사진 선택
    // --------------------------------------------------------

    const imageInput =
        container.querySelector("#imageInput");

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            handleImageSelect
        );

    }


    // --------------------------------------------------------
    // 이전 사진
    // --------------------------------------------------------

    const prevButton =
        container.querySelector(".prev-image");

    if (prevButton) {

        prevButton.addEventListener(
            "click",
            showPreviousImage
        );

    }


    // --------------------------------------------------------
    // 다음 사진
    // --------------------------------------------------------

    const nextButton =
        container.querySelector(".next-image");

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            showNextImage
        );

    }


    // --------------------------------------------------------
    // 현재 사진 삭제
    // --------------------------------------------------------

    const removeButton =
        container.querySelector(
            ".remove-current-image"
        );

    if (removeButton) {

        removeButton.addEventListener(
            "click",
            removeCurrentImage
        );

    }


    // --------------------------------------------------------
    // 다음 단계
    // --------------------------------------------------------

    const nextStepButton =
        container.querySelector(".next-step");

    if (nextStepButton) {

        nextStepButton.addEventListener(
            "click",
            goNextStep
        );

    }


    setupImageSwipe();
}


// ============================================================
// 사진 파일 하나 읽기
// ============================================================

function readImageFile(file) {

    return new Promise((resolve, reject) => {

        if (!file.type.startsWith("image/")) {

            reject(
                new Error(
                    "이미지 파일이 아닙니다."
                )
            );

            return;
        }


        const reader =
            new FileReader();


        reader.onload = function(event) {

            resolve(event.target.result);

        };


        reader.onerror = function() {

            reject(
                reader.error ||
                new Error("파일을 읽을 수 없습니다.")
            );

        };


        reader.readAsDataURL(file);

    });
}


// ============================================================
// 사진 추가
// ============================================================

async function handleImageSelect(event) {

    console.log("사진 선택 이벤트 발생");


    const input =
        event.target;


    const files =
        Array.from(input.files || []);


    console.log(
        "선택된 사진:",
        files.length,
        "장"
    );


    if (files.length === 0) {

        return;

    }


    const imageFiles =
        files.filter(file =>
            file.type.startsWith("image/")
        );


    if (imageFiles.length === 0) {

        alert("이미지 파일을 선택해주세요.");

        input.value = "";

        return;

    }


    try {

        // 모든 사진을 먼저 읽는다.
        const results =
            await Promise.all(
                imageFiles.map(
                    readImageFile
                )
            );


        console.log(
            "사진 읽기 완료:",
            results.length,
            "장"
        );


        // 읽은 사진을 한 번에 추가
        editorData.images.push(
            ...results
        );


        // 마지막으로 추가된 사진을 보여준다.
        currentImageIndex =
            editorData.images.length - 1;


        console.log(
            "현재 사진 개수:",
            editorData.images.length
        );


        // 모든 파일을 읽은 뒤 딱 한 번만 화면 갱신
        renderCurrentStep();


    } catch (error) {

        console.error(
            "사진 추가 실패:",
            error
        );


        alert(
            "사진을 불러오는 중 오류가 발생했습니다."
        );

    } finally {

        // 같은 파일을 다시 선택할 수 있도록 초기화
        input.value = "";

    }

}


// ============================================================
// 이전 사진
// ============================================================

function showPreviousImage() {

    if (editorData.images.length <= 1) {
        return;
    }


    currentImageIndex--;


    if (currentImageIndex < 0) {

        currentImageIndex =
            editorData.images.length - 1;

    }


    renderCurrentStep();
}


// ============================================================
// 다음 사진
// ============================================================

function showNextImage() {

    if (editorData.images.length <= 1) {
        return;
    }


    currentImageIndex++;


    if (
        currentImageIndex >=
        editorData.images.length
    ) {

        currentImageIndex = 0;

    }


    renderCurrentStep();
}


// ============================================================
// 현재 사진 삭제
// ============================================================

function removeCurrentImage() {

    if (editorData.images.length === 0) {
        return;
    }


    editorData.images.splice(
        currentImageIndex,
        1
    );


    if (editorData.images.length === 0) {

        currentImageIndex = 0;

    } else if (
        currentImageIndex >=
        editorData.images.length
    ) {

        currentImageIndex =
            editorData.images.length - 1;

    }


    renderCurrentStep();
}


// ============================================================
// 사진 스와이프
// ============================================================

function setupImageSwipe() {

    const slider =
        document.querySelector("#imageSlider");

    if (!slider) {
        return;
    }


    let startX = 0;


    slider.addEventListener(
        "touchstart",
        function(event) {

            if (!event.touches.length) {
                return;
            }

            startX =
                event.touches[0].clientX;

        },
        { passive: true }
    );


    slider.addEventListener(
        "touchend",
        function(event) {

            if (!event.changedTouches.length) {
                return;
            }


            const endX =
                event.changedTouches[0].clientX;


            const difference =
                startX - endX;


            if (Math.abs(difference) < 50) {
                return;
            }


            if (difference > 0) {

                showNextImage();

            } else {

                showPreviousImage();

            }

        },
        { passive: true }
    );

}


// ============================================================
// STEP 2
// 날짜 / 날씨 / 기분
// ============================================================

function renderInfoStep(container) {

    container.innerHTML = `

        <div class="editor-step step-info">

            ${renderImageSummary()}


            <div class="step-heading">

                <p class="step-number">
                    STEP 2
                </p>

                <h3>
                    오늘의 상태
                </h3>

                <p>
                    오늘 하루를 기록해보세요.
                </p>

            </div>


            <div class="editor-field">

                <label for="memoDate">
                    날짜
                </label>

                <input
                    type="date"
                    id="memoDate"
                    value="${escapeHTML(
                        editorData.date
                    )}">

            </div>


            <div class="editor-field">

                <label>
                    날씨
                </label>

                <div class="choice-buttons">

                    ${createWeatherButton(
                        "sunny",
                        "☀️",
                        "맑음"
                    )}

                    ${createWeatherButton(
                        "cloudy",
                        "☁️",
                        "흐림"
                    )}

                    ${createWeatherButton(
                        "rainy",
                        "🌧️",
                        "비"
                    )}

                    ${createWeatherButton(
                        "snowy",
                        "❄️",
                        "눈"
                    )}

                </div>

            </div>


            <div class="editor-field">

                <label>
                    기분
                </label>

                <div class="choice-buttons">

                    ${createMoodButton(
                        "happy",
                        "😊",
                        "좋음"
                    )}

                    ${createMoodButton(
                        "normal",
                        "😐",
                        "보통"
                    )}

                    ${createMoodButton(
                        "sad",
                        "😢",
                        "우울"
                    )}

                    ${createMoodButton(
                        "angry",
                        "😡",
                        "화남"
                    )}

                </div>

            </div>


            <div class="editor-actions">

                <button
                    type="button"
                    class="prev-step">
                    ← 이전
                </button>

                <button
                    type="button"
                    class="next-step">
                    다음 →
                </button>

            </div>

        </div>
    `;


    const dateInput =
        container.querySelector("#memoDate");


    if (dateInput) {

        dateInput.addEventListener(
            "change",
            function(event) {

                editorData.date =
                    event.target.value;

            }
        );

    }


    container
        .querySelectorAll("[data-weather]")
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    editorData.weather =
                        button.dataset.weather;

                    renderCurrentStep();

                }
            );

        });


    container
        .querySelectorAll("[data-mood]")
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    editorData.mood =
                        button.dataset.mood;

                    renderCurrentStep();

                }
            );

        });


    const prevButton =
        container.querySelector(".prev-step");


    if (prevButton) {

        prevButton.addEventListener(
            "click",
            goPreviousStep
        );

    }


    const nextButton =
        container.querySelector(".next-step");


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            goNextStep
        );

    }


    setupImageSwipe();
}


// ============================================================
// 날씨 버튼
// ============================================================

function createWeatherButton(
    value,
    icon,
    label
) {

    return `

        <button
            type="button"
            class="choice-button ${
                editorData.weather === value
                    ? "selected"
                    : ""
            }"
            data-weather="${value}">

            <span>
                ${icon}
            </span>

            <small>
                ${label}
            </small>

        </button>

    `;
}


// ============================================================
// 기분 버튼
// ============================================================

function createMoodButton(
    value,
    icon,
    label
) {

    return `

        <button
            type="button"
            class="choice-button ${
                editorData.mood === value
                    ? "selected"
                    : ""
            }"
            data-mood="${value}">

            <span>
                ${icon}
            </span>

            <small>
                ${label}
            </small>

        </button>

    `;
}


// ============================================================
// STEP 3
// 제목 / 본문 / 태그 / 장소
// ============================================================

function renderContentStep(container) {

    container.innerHTML = `

        <div class="editor-step step-content">

            ${renderImageSummary()}

            ${renderInfoSummary()}


            <div class="step-heading">

                <p class="step-number">
                    STEP 3
                </p>

                <h3>
                    오늘의 기록
                </h3>

                <p>
                    오늘의 하루를 글로 남겨보세요.
                </p>

            </div>


            <div class="editor-field">

                <label for="memoTitle">
                    타이틀
                </label>

                <input
                    type="text"
                    id="memoTitle"
                    maxlength="100"
                    value="${escapeHTML(
                        editorData.title
                    )}"
                    placeholder="오늘을 한 문장으로 남겨보세요.">

            </div>


            <div class="editor-field">

                <label for="memoContent">
                    본문
                </label>

                <textarea
                    id="memoContent"
                    rows="8"
                    placeholder="오늘은 어떤 하루였나요?">${escapeHTML(
                        editorData.content
                    )}</textarea>

            </div>


            <div class="editor-field">

                <label for="memoTags">
                    태그
                </label>

                <input
                    type="text"
                    id="memoTags"
                    value="${editorData.tags
                        .map(tag => "#" + tag)
                        .join(" ")}"
                    placeholder="#일상 #카페 #여행">

            </div>


            <div class="editor-field">

                <label for="memoLocation">
                    장소
                </label>

                <input
                    type="text"
                    id="memoLocation"
                    maxlength="100"
                    value="${escapeHTML(
                        editorData.location
                    )}"
                    placeholder="어디에서 보냈나요?">

            </div>


            <div class="editor-actions">

                <button
                    type="button"
                    class="prev-step">
                    ← 이전
                </button>

                <button
                    type="button"
                    class="save-editor">
                    ${editingMemoId
                        ? "수정 완료"
                        : "저장"}
                </button>

            </div>

        </div>
    `;


    const titleInput =
        container.querySelector("#memoTitle");


    if (titleInput) {

        titleInput.addEventListener(
            "input",
            function(event) {

                editorData.title =
                    event.target.value;

            }
        );

    }


    const contentInput =
        container.querySelector("#memoContent");


    if (contentInput) {

        contentInput.addEventListener(
            "input",
            function(event) {

                editorData.content =
                    event.target.value;

            }
        );

    }


    const tagsInput =
        container.querySelector("#memoTags");


    if (tagsInput) {

        tagsInput.addEventListener(
            "input",
            function(event) {

                editorData.tags =
                    parseTags(
                        event.target.value
                    );

            }
        );

    }


    const locationInput =
        container.querySelector("#memoLocation");


    if (locationInput) {

        locationInput.addEventListener(
            "input",
            function(event) {

                editorData.location =
                    event.target.value;

            }
        );

    }


    const prevButton =
        container.querySelector(".prev-step");


    if (prevButton) {

        prevButton.addEventListener(
            "click",
            goPreviousStep
        );

    }


    const saveButton =
        container.querySelector(".save-editor");


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveEditor
        );

    }


    setupImageSwipe();
}


// ============================================================
// 사진 결과 요약
// ============================================================

function renderImageSummary() {

    if (!editorData.images.length) {

        return `

            <div class="image-summary empty">

                아직 사진이 없습니다.

            </div>

        `;

    }


    if (
        currentImageIndex >=
        editorData.images.length
    ) {

        currentImageIndex =
            editorData.images.length - 1;

    }


    return `

        <div class="image-summary">

            <div
                class="summary-image-slider"
                id="imageSlider">

                <button
                    type="button"
                    class="image-nav prev-image"
                    aria-label="이전 사진">
                    ‹
                </button>


                <div class="image-slide">

                    <img
                        src="${editorData.images[
                            currentImageIndex
                        ]}"
                        alt="선택한 사진">

                </div>


                <button
                    type="button"
                    class="image-nav next-image"
                    aria-label="다음 사진">
                    ›
                </button>

            </div>


            <div class="image-counter">

                ${currentImageIndex + 1}
                /
                ${editorData.images.length}

            </div>

        </div>

    `;
}


// ============================================================
// 날짜 / 날씨 / 기분 요약
// ============================================================

function renderInfoSummary() {

    const weatherIcons = {

        sunny: "☀️",
        cloudy: "☁️",
        rainy: "🌧️",
        snowy: "❄️"

    };


    const moodIcons = {

        happy: "😊",
        normal: "😐",
        sad: "😢",
        angry: "😡"

    };


    return `

        <div class="info-summary">

            <span>
                ${escapeHTML(
                    editorData.date || ""
                )}
            </span>

            ${
                editorData.weather
                    ? weatherIcons[
                        editorData.weather
                    ] || ""
                    : ""
            }

            ${
                editorData.mood
                    ? moodIcons[
                        editorData.mood
                    ] || ""
                    : ""
            }

        </div>

    `;
}


// ============================================================
// 다음 단계
// ============================================================

function goNextStep() {

    if (currentStep === 1) {

        currentStep = 2;

    } else if (currentStep === 2) {

        const dateInput =
            document.querySelector("#memoDate");


        if (dateInput) {

            editorData.date =
                dateInput.value;

        }


        currentStep = 3;

    }


    renderCurrentStep();
}


// ============================================================
// 이전 단계
// ============================================================

function goPreviousStep() {

    if (currentStep <= 1) {
        return;
    }


    currentStep--;


    renderCurrentStep();
}


// ============================================================
// 저장
// ============================================================

function saveEditor() {

    const titleInput =
        document.querySelector("#memoTitle");

    const contentInput =
        document.querySelector("#memoContent");

    const tagsInput =
        document.querySelector("#memoTags");

    const locationInput =
        document.querySelector("#memoLocation");


    if (titleInput) {

        editorData.title =
            titleInput.value.trim();

    }


    if (contentInput) {

        editorData.content =
            contentInput.value.trim();

    }


    if (tagsInput) {

        editorData.tags =
            parseTags(
                tagsInput.value
            );

    }


    if (locationInput) {

        editorData.location =
            locationInput.value.trim();

    }


    if (editingMemoId === null) {

        addMemo(editorData);

    } else {

        updateMemo(
            editingMemoId,
            editorData
        );

    }


    closeEditor();


    if (
        typeof renderFeed === "function"
    ) {

        renderFeed();

    }


    if (
        typeof renderTagShortcuts === "function"
    ) {

        renderTagShortcuts();

    }

}


// ============================================================
// 편집창 닫기
// ============================================================

function closeEditor() {

    const modal =
        document.querySelector("#editorModal");


    if (modal) {
        modal.remove();
    }


    editingMemoId = null;


    editorData = {

        images: [],
        date: "",
        weather: "",
        mood: "",
        location: "",
        title: "",
        content: "",
        tags: []

    };


    currentStep = 1;
    currentImageIndex = 0;

}


// ============================================================
// 태그 처리
// ============================================================

function parseTags(value) {

    return String(value || "")

        .split(/\s+/)

        .map(tag =>
            tag
                .replace(/^#/, "")
                .trim()
        )

        .filter(Boolean);

}


// ============================================================
// 오늘 날짜
// ============================================================

function getToday() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// ============================================================
// HTML 특수문자 처리
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// 새 메모 작성 버튼
// ============================================================

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest("#newMemoBtn");


        if (!button) {
            return;
        }


        openEditor();

    }
);


// ============================================================
// 외부에서 사용
// viewer.js 등에서 호출 가능
// ============================================================

window.openEditor = openEditor;
window.closeEditor = closeEditor;


console.log("EDITOR JS LOADED");