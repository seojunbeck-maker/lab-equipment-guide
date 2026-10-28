const imageInput =
    document.getElementById("imageInput");

const imagePreview =
    document.getElementById("imagePreview");

const previewText =
    document.getElementById("previewText");

const fileName =
    document.getElementById("fileName");

const dropArea =
    document.getElementById("dropArea");

const removeButton =
    document.getElementById("removeButton");

const analyzeButton =
    document.getElementById("analyzeButton");

const retryButton =
    document.getElementById("retryButton");

const confirmButton =
    document.getElementById("confirmButton");

const restartButton =
    document.getElementById("restartButton");

const errorRetryButton =
    document.getElementById("errorRetryButton");


const uploadSection =
    document.getElementById("uploadSection");

const loadingSection =
    document.getElementById("loadingSection");

const resultSection =
    document.getElementById("resultSection");

const confirmSection =
    document.getElementById("confirmSection");

const errorSection =
    document.getElementById("errorSection");


const loadingTitle =
    document.getElementById("loadingTitle");

const loadingMessage =
    document.getElementById("loadingMessage");


const candidateList =
    document.getElementById("candidateList");

const selectedResult =
    document.getElementById("selectedResult");

const lowConfidenceMessage =
    document.getElementById("lowConfidenceMessage");


const confirmedEquipment =
    document.getElementById("confirmedEquipment");

const equipmentImage =
    document.getElementById("equipmentImage");


const detailCategory =
    document.getElementById("detailCategory");

const detailPurpose =
    document.getElementById("detailPurpose");

const detailStructure =
    document.getElementById("detailStructure");

const detailUsage =
    document.getElementById("detailUsage");

const detailCaution =
    document.getElementById("detailCaution");


const errorMessage =
    document.getElementById("errorMessage");

const featureTabs =
    document.querySelectorAll(".feature-tab");

const featurePanels =
    document.querySelectorAll("[data-feature]");

const detailFavoriteButton =
    document.getElementById("detailFavoriteButton");

const dictionarySection =
    document.getElementById("dictionarySection");

const dictionarySearchForm =
    document.getElementById("dictionarySearchForm");

const dictionaryName =
    document.getElementById("dictionaryName");

const dictionaryCategory =
    document.getElementById("dictionaryCategory");

const dictionaryResetButton =
    document.getElementById("dictionaryResetButton");

const dictionaryStatus =
    document.getElementById("dictionaryStatus");

const dictionaryList =
    document.getElementById("dictionaryList");

const dictionaryInitialNav =
    document.getElementById("dictionaryInitialNav");

const historySection =
    document.getElementById("historySection");

const historyStatus =
    document.getElementById("historyStatus");

const historyList =
    document.getElementById("historyList");

const favoritesSection =
    document.getElementById("favoritesSection");

const favoritesStatus =
    document.getElementById("favoritesStatus");

const favoritesList =
    document.getElementById("favoritesList");

const favoritesInitialNav =
    document.getElementById("favoritesInitialNav");


const HANGUL_INITIALS = [
    "ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ",
    "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

const HANGUL_CHOSEONG = [
    "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ",
    "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ",
    "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

const HANGUL_INITIAL_BASE = {
    "ㄲ": "ㄱ",
    "ㄸ": "ㄷ",
    "ㅃ": "ㅂ",
    "ㅆ": "ㅅ",
    "ㅉ": "ㅈ"
};


let currentFile = null;

let currentImageURL = null;

let selectedEquipment = null;

let displayedEquipment = null;

let favoriteNames = new Set();

let dictionaryRequestId = 0;

/*
중복 분석 방지
*/
let isAnalyzing = false;


/* =========================
   이미지 표시
========================= */

function showImage(file) {

    if (!file) {
        return;
    }


    if (!file.type.startsWith("image/")) {

        alert(
            "이미지 파일만 업로드할 수 있습니다."
        );

        return;
    }


    currentFile = file;


    if (currentImageURL) {

        URL.revokeObjectURL(
            currentImageURL
        );
    }


    currentImageURL =
        URL.createObjectURL(file);


    imagePreview.src =
        currentImageURL;


    imagePreview.style.display =
        "block";


    previewText.style.display =
        "none";


    fileName.textContent =
        file.name;


    removeButton.style.display =
        "inline-block";


    analyzeButton.disabled =
        false;
}


/* =========================
   파일 선택
========================= */

imageInput.addEventListener(
    "change",
    function () {

        const file =
            imageInput.files[0];


        showImage(file);
    }
);


/* =========================
   드래그 앤 드롭
========================= */

dropArea.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();


        dropArea.classList.add(
            "drag-over"
        );
    }
);


dropArea.addEventListener(
    "dragleave",
    function () {

        dropArea.classList.remove(
            "drag-over"
        );
    }
);


dropArea.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();


        dropArea.classList.remove(
            "drag-over"
        );


        const file =
            event.dataTransfer.files[0];


        showImage(file);
    }
);


/* =========================
   이미지 초기화
========================= */

removeButton.addEventListener(
    "click",
    resetImage
);


function resetImage() {

    currentFile = null;


    imageInput.value = "";


    if (currentImageURL) {

        URL.revokeObjectURL(
            currentImageURL
        );


        currentImageURL = null;
    }


    imagePreview.src = "";


    imagePreview.style.display =
        "none";


    previewText.style.display =
        "block";


    fileName.textContent = "";


    removeButton.style.display =
        "none";


    analyzeButton.disabled =
        true;
}


/* =========================
   파일 → Base64
========================= */

function fileToBase64(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    const result =
                        reader.result;


                    const base64 =
                        result.split(",")[1];


                    resolve(base64);
                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "이미지를 읽을 수 없습니다."
                        )
                    );
                };


            reader.readAsDataURL(file);
        }
    );
}


/* =========================
   로딩 화면
========================= */

function showAnalysisLoading() {

    loadingTitle.textContent =
        "이미지를 분석하고 있습니다.";

    loadingMessage.textContent =
        "실험기구를 확인하고 있습니다.";


    loadingSection.style.display =
        "block";
}


function showDatabaseLoading() {

    loadingTitle.textContent =
        "기구 정보를 불러오고 있습니다.";

    loadingMessage.textContent =
        "저장된 실험기구 정보를 확인하고 있습니다.";


    loadingSection.style.display =
        "block";
}


/* =========================
   이미지 분석
   AI 호출은 여기서 딱 1회
========================= */

analyzeButton.addEventListener(
    "click",
    async function () {

        /*
        중복 요청 차단
        */
        if (isAnalyzing) {
            return;
        }


        if (!currentFile) {

            alert(
                "분석할 이미지를 선택하세요."
            );

            return;
        }


        isAnalyzing = true;

        analyzeButton.disabled =
            true;


        uploadSection.style.display =
            "none";

        resultSection.style.display =
            "none";

        confirmSection.style.display =
            "none";

        errorSection.style.display =
            "none";


        showAnalysisLoading();


        try {

            const base64Image =
                await fileToBase64(
                    currentFile
                );


            /*
            AI 호출은 오직 여기
            */
            const response =
                await fetch(
                    "/api/analyze",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                {

                                    image:
                                        base64Image,

                                    mimeType:
                                        currentFile.type
                                }
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "이미지 분석에 실패했습니다."
                );
            }


            loadingSection.style.display =
                "none";


            resultSection.style.display =
                "block";


            showCandidates(
                data.candidates,
                data.lowConfidence
            );

        }

        catch (error) {

            console.error(error);


            loadingSection.style.display =
                "none";


            showError(
                error.message
            );

        }

        finally {

            isAnalyzing = false;


            /*
            현재 업로드 이미지가 있다면
            다시 분석 가능
            */
            if (currentFile) {

                analyzeButton.disabled =
                    false;
            }
        }
    }
);


/* =========================
   분석 후보 표시
========================= */

function showCandidates(
    candidates,
    lowConfidence
) {

    candidateList.innerHTML = "";


    selectedEquipment = null;


    confirmButton.disabled =
        true;


    selectedResult.textContent =
        "선택된 기구가 없습니다.";


    lowConfidenceMessage.textContent =
        "";


    if (
        !Array.isArray(candidates) ||
        candidates.length === 0
    ) {

        showError(
            "실험기구를 식별하지 못했습니다. 다른 사진으로 다시 시도해 주세요."
        );

        return;
    }


    /*
    50% 미만 후보만 남은 경우
    */
    if (lowConfidence) {

        lowConfidenceMessage.textContent =
            "정확도가 낮은 결과입니다. 사진을 확인한 뒤 후보를 선택해 주세요.";
    }


    candidates.forEach(
        function (candidate) {

            const item =
                document.createElement(
                    "div"
                );


            item.classList.add(
                "candidate"
            );


            let confidence =
                Number(
                    candidate.confidence
                ) || 0;


            confidence =
                Math.round(
                    Math.max(
                        0,
                        Math.min(
                            100,
                            confidence
                        )
                    )
                );


            /*
            판단 근거 삭제
            이름 + 정확도만 표시
            */
            item.innerHTML = `

                <div class="candidate-name">
                    ${escapeHTML(
                        candidate.name
                    )}
                </div>

                <div class="confidence">
                    예상 신뢰도:
                    ${confidence}%
                </div>

                <div class="confidence-bar">

                    <div
                        class="confidence-value"
                        style="width:${confidence}%"
                    ></div>

                </div>

            `;


            item.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".candidate"
                        )
                        .forEach(
                            function (
                                element
                            ) {

                                element
                                    .classList
                                    .remove(
                                        "selected"
                                    );
                            }
                        );


                    item.classList.add(
                        "selected"
                    );


                    selectedEquipment =
                        candidate;


                    selectedResult.textContent =
                        "선택한 기구: " +
                        candidate.name;


                    confirmButton.disabled =
                        false;
                }
            );


            candidateList.appendChild(
                item
            );
        }
    );
}


/* =========================
   후보 확정
   AI 호출 없음
   Supabase 조회만 실행
========================= */

confirmButton.addEventListener(
    "click",
    async function () {

        if (!selectedEquipment) {
            return;
        }


        resultSection.style.display =
            "none";


        errorSection.style.display =
            "none";


        /*
        여기서는 이미지 분석이 아니라
        DB 데이터만 읽음
        */
        showDatabaseLoading();


        try {

            const response =
                await fetch(

                    `/api/equipment?name=${encodeURIComponent(
                        selectedEquipment.name
                    )}`

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "기구 정보를 불러오지 못했습니다."
                );
            }


            const equipment =
                data.equipment;


            await saveAnalysisHistory(
                {
                    name: equipment.name,
                    confidence:
                        selectedEquipment.confidence
                }
            );


            displayedEquipment =
                equipment;


            loadingSection.style.display =
                "none";


            confirmedEquipment.textContent =
                equipment.name;


            detailCategory.textContent =
                equipment.category || "-";


            detailPurpose.textContent =
                equipment.purpose || "-";


            detailStructure.textContent =
                equipment.structure || "-";


            renderUsageList(
                detailUsage,
                equipment.usage
            );


            renderCautionList(
                detailCaution,
                equipment.caution
            );


            /*
            대표 이미지
            image_url이 있을 때만 표시
            */
            if (equipment.image_url) {

                equipmentImage.src =
                    equipment.image_url;


                equipmentImage.style.display =
                    "block";

            }

            else {

                equipmentImage.src = "";


                equipmentImage.style.display =
                    "none";
            }


            await refreshFavoriteNames();

            updateDetailFavoriteButton();


            confirmSection.style.display =
                "block";

        }

        catch (error) {

            console.error(error);


            loadingSection.style.display =
                "none";


            showError(
                error.message
            );
        }
    }
);


/* =========================
   다시 분석
========================= */

retryButton.addEventListener(
    "click",
    function () {

        goToUpload();
    }
);


errorRetryButton.addEventListener(
    "click",
    function () {

        goToUpload();
    }
);


restartButton.addEventListener(
    "click",
    function () {

        resetImage();

        goToUpload();
    }
);


/* =========================
   업로드 화면으로 이동
========================= */

function goToUpload() {

    uploadSection.style.display =
        "block";


    loadingSection.style.display =
        "none";


    resultSection.style.display =
        "none";


    confirmSection.style.display =
        "none";


    errorSection.style.display =
        "none";


    selectedEquipment = null;


    candidateList.innerHTML = "";


    lowConfidenceMessage.textContent =
        "";


    selectedResult.textContent =
        "선택된 기구가 없습니다.";


    confirmButton.disabled =
        true;


    if (currentFile) {

        analyzeButton.disabled =
            false;

    }

    else {

        analyzeButton.disabled =
            true;
    }
}


/* =========================
   기능 메뉴
========================= */

featureTabs.forEach(
    function (tab) {

        tab.addEventListener(
            "click",
            function () {

                openFeature(
                    tab.dataset.target
                );
            }
        );
    }
);


async function openFeature(feature) {

    featurePanels.forEach(
        function (panel) {
            panel.style.display = "none";
        }
    );

    featureTabs.forEach(
        function (tab) {
            tab.classList.toggle(
                "active",
                tab.dataset.target === feature
            );
        }
    );

    if (feature === "analysis") {
        goToUpload();
        return;
    }

    if (feature === "dictionary") {
        dictionarySection.style.display = "block";
        await loadDictionary();
        return;
    }

    if (feature === "history") {
        historySection.style.display = "block";
        await loadHistory();
        return;
    }

    favoritesSection.style.display = "block";
    await loadFavorites();
}


/* =========================
   공통 API 처리
========================= */

async function requestJSON(url, options) {

    const response = await fetch(
        url,
        options
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "요청을 처리하지 못했습니다."
        );
    }

    return data;
}


function formatDate(value) {

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("ko-KR");
}


/* =========================
   최근 분석 기록
========================= */

async function saveAnalysisHistory(candidate) {

    await requestJSON(
        "/api/history",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                record_type: "analysis",
                equipment_name: candidate.name,
                confidence: candidate.confidence
            })
        }
    );
}


async function loadHistory() {

    historyStatus.textContent =
        "기록을 불러오고 있습니다.";

    historyList.replaceChildren();

    try {

        const data = await requestJSON(
            "/api/history?limit=50"
        );

        const history = data.history || [];

        historyStatus.textContent = history.length
            ? `최근 기록 ${history.length}개`
            : "아직 저장된 기록이 없습니다.";

        history.forEach(
            function (item) {

                const card =
                    document.createElement("article");

                card.className = "record-card";

                const info =
                    document.createElement("div");

                const title =
                    document.createElement("h3");

                const isSearch =
                    item.record_type === "search";

                title.textContent = isSearch
                    ? item.search_query
                    : item.equipment_name;

                const confidence =
                    document.createElement("p");

                confidence.textContent = isSearch
                    ? "사전 검색"
                    : `이미지 분석 · 신뢰도 ${Math.round(Number(item.confidence) || 0)}%`;

                info.append(title, confidence);

                const date =
                    document.createElement("div");

                date.className = "record-meta";
                date.textContent =
                    formatDate(item.created_at);

                card.append(info, date);
                historyList.appendChild(card);
            }
        );

    } catch (error) {

        historyStatus.textContent = error.message;
    }
}


/* =========================
   즐겨찾기
========================= */

async function refreshFavoriteNames() {

    const data = await requestJSON(
        "/api/favorites"
    );

    favoriteNames = new Set(
        (data.favorites || []).map(
            item => item.equipment_name
        )
    );

    return data.favorites || [];
}


async function toggleFavorite(name) {

    if (favoriteNames.has(name)) {

        await requestJSON(
            `/api/favorites?equipment_name=${encodeURIComponent(name)}`,
            { method: "DELETE" }
        );

        favoriteNames.delete(name);

    } else {

        await requestJSON(
            "/api/favorites",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    equipment_name: name
                })
            }
        );

        favoriteNames.add(name);
    }
}


function updateDetailFavoriteButton() {

    if (!displayedEquipment) {
        return;
    }

    detailFavoriteButton.textContent =
        favoriteNames.has(displayedEquipment.name)
            ? "즐겨찾기 삭제"
            : "즐겨찾기 추가";
}


detailFavoriteButton.addEventListener(
    "click",
    async function () {

        if (!displayedEquipment) {
            return;
        }

        detailFavoriteButton.disabled = true;

        try {
            await toggleFavorite(
                displayedEquipment.name
            );

            updateDetailFavoriteButton();

        } catch (error) {
            alert(error.message);

        } finally {
            detailFavoriteButton.disabled = false;
        }
    }
);


async function loadFavorites() {

    favoritesStatus.textContent =
        "즐겨찾기를 불러오고 있습니다.";

    favoritesList.replaceChildren();
    favoritesInitialNav.replaceChildren();
    favoritesInitialNav.hidden = true;

    try {

        const favorites =
            await refreshFavoriteNames();

        favoritesStatus.textContent = favorites.length
            ? `즐겨찾기 ${favorites.length}개`
            : "아직 등록된 즐겨찾기가 없습니다.";

        const sortedFavorites = favorites.slice().sort(
            (a, b) => a.equipment_name.localeCompare(
                b.equipment_name,
                "ko"
            )
        );

        renderInitialNavigation(
            favoritesInitialNav,
            sortedFavorites.map(item => item.equipment_name),
            "favorites"
        );

        let previousInitial = "";

        sortedFavorites.forEach(
            function (item) {

                const initial = getHangulInitial(
                    item.equipment_name
                );

                if (initial !== previousInitial) {
                    appendInitialHeading(
                        favoritesList,
                        initial,
                        "favorites"
                    );
                    previousInitial = initial;
                }

                const card =
                    document.createElement("article");

                card.className = "record-card";

                const info =
                    document.createElement("div");

                const title =
                    document.createElement("h3");

                title.textContent =
                    item.equipment_name;

                const date =
                    document.createElement("p");

                date.textContent =
                    `추가일 ${formatDate(item.created_at)}`;

                info.append(title, date);

                const remove =
                    document.createElement("button");

                remove.type = "button";
                remove.className =
                    "secondary-button compact-button";
                remove.textContent = "삭제";

                remove.addEventListener(
                    "click",
                    async function () {

                        remove.disabled = true;

                        try {
                            await toggleFavorite(
                                item.equipment_name
                            );
                            await loadFavorites();
                        } catch (error) {
                            favoritesStatus.textContent =
                                error.message;
                            remove.disabled = false;
                        }
                    }
                );

                card.append(info, remove);
                favoritesList.appendChild(card);
            }
        );

    } catch (error) {

        favoritesStatus.textContent = error.message;
    }
}


/* =========================
   실험기구 사전
========================= */

dictionarySearchForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();
        loadDictionary(true);
    }
);


dictionaryResetButton.addEventListener(
    "click",
    function () {
        dictionaryName.value = "";
        dictionaryCategory.value = "";
        loadDictionary();
    }
);


async function loadDictionary(recordSearch = false) {

    const requestId =
        ++dictionaryRequestId;

    dictionaryStatus.textContent =
        "기구 목록을 불러오고 있습니다.";

    dictionaryList.replaceChildren();
    dictionaryInitialNav.replaceChildren();
    dictionaryInitialNav.hidden = true;

    try {

        const params = new URLSearchParams();

        const nameValue =
            dictionaryName.value.trim();

        const categoryValue =
            dictionaryCategory.value;

        if (nameValue) {
            params.set(
                "name",
                nameValue
            );
        }

        if (categoryValue) {
            params.set(
                "category",
                categoryValue
            );
        }

        const query = params.toString();

        const [data] = await Promise.all([
            requestJSON(
                `/api/equipment-list${query ? `?${query}` : ""}`
            ),
            refreshFavoriteNames()
        ]);

        if (requestId !== dictionaryRequestId) {
            return;
        }

        const equipment = data.equipment || [];

        populateCategoryOptions(equipment);

        dictionaryStatus.textContent = equipment.length
            ? `실험기구 ${equipment.length}개`
            : "검색 결과가 없습니다.";

        const sortedEquipment = equipment.slice().sort(
            (a, b) => a.name.localeCompare(
                b.name,
                "ko"
            )
        );

        renderInitialNavigation(
            dictionaryInitialNav,
            sortedEquipment.map(item => item.name),
            "dictionary"
        );

        let previousInitial = "";

        sortedEquipment.forEach(
            function (item) {
                const initial = getHangulInitial(item.name);

                if (initial !== previousInitial) {
                    appendInitialHeading(
                        dictionaryList,
                        initial,
                        "dictionary"
                    );
                    previousInitial = initial;
                }

                renderEquipmentCard(item);
            }
        );

        if (recordSearch && (nameValue || categoryValue)) {
            try {
                await saveDictionarySearch(
                    nameValue,
                    categoryValue
                );
            } catch (error) {
                console.error(
                    "Dictionary history save failed:",
                    error
                );
            }
        }

    } catch (error) {

        if (requestId === dictionaryRequestId) {
            dictionaryStatus.textContent = error.message;
        }
    }
}


async function saveDictionarySearch(
    nameValue,
    categoryValue
) {

    const parts = [];

    if (nameValue) {
        parts.push(`이름: ${nameValue}`);
    }

    if (categoryValue) {
        parts.push(`분류: ${categoryValue}`);
    }

    if (parts.length === 0) {
        return;
    }

    await requestJSON(
        "/api/history",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                record_type: "search",
                search_query: parts.join(" · ")
            })
        }
    );
}


function populateCategoryOptions(equipment) {

    if (dictionaryCategory.options.length > 1) {
        return;
    }

    const categories = Array.from(
        new Set(
            equipment
                .map(item => item.category)
                .filter(Boolean)
        )
    ).sort();

    categories.forEach(
        function (category) {

            const option =
                document.createElement("option");

            option.value = category;
            option.textContent = category;
            dictionaryCategory.appendChild(option);
        }
    );
}


function getHangulInitial(value) {

    const firstCharacter =
        String(value || "").trim().charAt(0);

    if (!firstCharacter) {
        return "#";
    }

    const code = firstCharacter.charCodeAt(0);

    if (code < 0xAC00 || code > 0xD7A3) {
        return "#";
    }

    const initial = HANGUL_CHOSEONG[
        Math.floor((code - 0xAC00) / 588)
    ];

    return HANGUL_INITIAL_BASE[initial] || initial;
}


function getInitialAnchorId(prefix, initial) {

    const index = HANGUL_INITIALS.indexOf(initial);

    return `${prefix}-initial-${index >= 0 ? index : "other"}`;
}


function renderInitialNavigation(
    container,
    names,
    prefix
) {

    container.replaceChildren();

    if (names.length === 0) {
        container.hidden = true;
        return;
    }

    container.hidden = false;

    const label = document.createElement("span");
    label.className = "initial-nav-label";
    label.textContent = "초성 바로가기";
    container.appendChild(label);

    const availableInitials = new Set(
        names.map(getHangulInitial)
    );

    HANGUL_INITIALS.forEach(
        function (initial) {

            const button = document.createElement("button");
            button.type = "button";
            button.className = "initial-nav-button";
            button.textContent = initial;
            button.disabled = !availableInitials.has(initial);
            button.setAttribute(
                "aria-label",
                `${initial}으로 시작하는 기구로 이동`
            );

            button.addEventListener(
                "click",
                function () {
                    const target = document.getElementById(
                        getInitialAnchorId(prefix, initial)
                    );

                    if (target) {
                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                }
            );

            container.appendChild(button);
        }
    );
}


function appendInitialHeading(
    container,
    initial,
    prefix
) {

    const heading = document.createElement("h3");
    heading.className = "initial-group-heading";
    heading.id = getInitialAnchorId(prefix, initial);
    heading.textContent = initial;
    container.appendChild(heading);
}


function splitNumberedSteps(value) {

    const text = String(value || "")
        .replace(/\s+/g, " ")
        .trim();

    if (!text) {
        return [];
    }

    const markers = Array.from(
        text.matchAll(/(?:^|\s)(\d+)[.)]\s*/g)
    );

    if (markers.length === 0) {
        return [text];
    }

    return markers.map(
        function (marker, index) {
            const start = marker.index + marker[0].length;
            const end = index + 1 < markers.length
                ? markers[index + 1].index
                : text.length;

            return text.slice(start, end).trim();
        }
    ).filter(Boolean);
}


function splitCautionItems(value) {

    const text = String(value || "").trim();

    if (!text) {
        return [];
    }

    const lineItems = text
        .split(/\r?\n+/)
        .map(item => item.replace(/^[•·\-]\s*/, "").trim())
        .filter(Boolean);

    if (lineItems.length > 1) {
        return lineItems;
    }

    return (
        text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text]
    ).map(
        item => item.replace(/^[•·\-]\s*/, "").trim()
    ).filter(Boolean);
}


function renderUsageList(element, value) {

    const steps = splitNumberedSteps(value);
    element.replaceChildren();

    (steps.length ? steps : ["등록된 정보가 없습니다."])
        .forEach(
            function (step) {
                const item = document.createElement("li");
                item.textContent = step;
                element.appendChild(item);
            }
        );
}


function renderCautionList(element, value) {

    const cautions = splitCautionItems(value);
    element.replaceChildren();

    (cautions.length ? cautions : ["등록된 정보가 없습니다."])
        .forEach(
            function (caution) {
                const item = document.createElement("li");
                item.textContent = caution;
                element.appendChild(item);
            }
        );
}


function renderEquipmentCard(equipment) {

    const card =
        document.createElement("article");

    card.className = "equipment-card";

    const header =
        document.createElement("div");

    header.className = "equipment-card-header";

    const info =
        document.createElement("div");

    const title =
        document.createElement("h3");

    title.textContent = equipment.name;

    const category =
        document.createElement("p");

    category.textContent =
        equipment.category || "분류 없음";

    info.append(title, category);

    const favorite =
        document.createElement("button");

    favorite.type = "button";
    favorite.className =
        "secondary-button compact-button";
    favorite.textContent = favoriteNames.has(equipment.name)
        ? "즐겨찾기 삭제"
        : "즐겨찾기 추가";

    favorite.addEventListener(
        "click",
        async function () {

            favorite.disabled = true;

            try {
                await toggleFavorite(equipment.name);
                favorite.textContent = favoriteNames.has(equipment.name)
                    ? "즐겨찾기 삭제"
                    : "즐겨찾기 추가";
            } catch (error) {
                dictionaryStatus.textContent = error.message;
            } finally {
                favorite.disabled = false;
            }
        }
    );

    header.append(info, favorite);
    card.appendChild(header);

    if (equipment.image_url) {

        const image =
            document.createElement("img");

        image.src = equipment.image_url;
        image.alt = `${equipment.name} 대표 이미지`;
        image.loading = "lazy";
        card.appendChild(image);
    }

    const purpose =
        document.createElement("p");

    purpose.textContent =
        equipment.purpose || "용도 정보가 없습니다.";

    card.appendChild(purpose);

    const details =
        document.createElement("details");

    details.className = "equipment-extra";

    const summary =
        document.createElement("summary");

    summary.textContent =
        "자세한 설명과 사용 방법";

    details.appendChild(summary);

    [
        ["구조", equipment.structure, "text"],
        ["사용 방법", equipment.usage, "steps"],
        ["주의사항", equipment.caution, "cautions"]
    ].forEach(
        function ([label, value, type]) {

            const heading =
                document.createElement("h4");

            heading.textContent = label;

            let content;

            if (type === "steps") {
                content = document.createElement("ol");
                content.className = "equipment-steps";
                renderUsageList(content, value);
            } else if (type === "cautions") {
                content = document.createElement("ul");
                content.className = "equipment-cautions";
                renderCautionList(content, value);
            } else {
                content = document.createElement("p");
                content.textContent = value || "등록된 정보가 없습니다.";
            }

            details.append(heading, content);
        }
    );

    card.appendChild(details);
    dictionaryList.appendChild(card);
}


/* =========================
   오류 표시
========================= */

function showError(message) {

    loadingSection.style.display =
        "none";


    resultSection.style.display =
        "none";


    confirmSection.style.display =
        "none";


    errorSection.style.display =
        "block";


    errorMessage.textContent =
        message;
}


/* =========================
   HTML 문자 보호
========================= */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}
