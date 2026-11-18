const imageInput =
    document.getElementById("imageInput");

const imagePreview =
    document.getElementById("imagePreview");

const previewText =
    document.getElementById("previewText");

const fileName =
    document.getElementById("fileName");

const uploadStatus =
    document.getElementById("uploadStatus");

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

const candidateDetailStatus =
    document.getElementById("candidateDetailStatus");


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

const dictionaryAutocomplete =
    document.getElementById("dictionaryAutocomplete");

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

const equipmentSubmissionForm =
    document.getElementById("equipmentSubmissionForm");

const equipmentSubmissionButton =
    document.getElementById("equipmentSubmissionButton");

const equipmentSubmissionStatus =
    document.getElementById("equipmentSubmissionStatus");

const adminDialog =
    document.getElementById("adminDialog");

const adminEntryButton =
    document.getElementById("adminEntryButton");

const adminCloseButton =
    document.getElementById("adminCloseButton");

const adminLoginPanel =
    document.getElementById("adminLoginPanel");

const adminReviewPanel =
    document.getElementById("adminReviewPanel");

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminPassword =
    document.getElementById("adminPassword");

const adminLoginButton =
    document.getElementById("adminLoginButton");

const adminLoginStatus =
    document.getElementById("adminLoginStatus");

const adminReviewStatus =
    document.getElementById("adminReviewStatus");

const adminSubmissionList =
    document.getElementById("adminSubmissionList");

const adminLogoutButton =
    document.getElementById("adminLogoutButton");

const authButton =
    document.getElementById("authButton");

const userMenu =
    document.getElementById("userMenu");

const userMenuEmail =
    document.getElementById("userMenuEmail");

const userMenuItems =
    document.querySelectorAll("[data-user-action]");

const authDialog =
    document.getElementById("authDialog");

const authDialogTitle =
    document.getElementById("authDialogTitle");

const authCloseButton =
    document.getElementById("authCloseButton");

const loginModeButton =
    document.getElementById("loginModeButton");

const signupModeButton =
    document.getElementById("signupModeButton");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const signupEmail =
    document.getElementById("signupEmail");

const signupPassword =
    document.getElementById("signupPassword");

const signupPasswordConfirm =
    document.getElementById("signupPasswordConfirm");

const loginSubmitButton =
    document.getElementById("loginSubmitButton");

const signupSubmitButton =
    document.getElementById("signupSubmitButton");

const authStatus =
    document.getElementById("authStatus");


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

let equipmentCatalog = [];

let equipmentCatalogPromise = null;

let authClient = null;

let authInitializationPromise = null;

let currentSession = null;

let currentUser = null;

/*
중복 분석 방지
*/
let isAnalyzing = false;


/* =========================
   Supabase 사용자 인증
========================= */

function setAuthStatus(message, success = false) {
    authStatus.textContent = message || "";
    authStatus.classList.toggle("success", Boolean(success));
}


function getKoreanAuthError(error) {
    const originalMessage = String(error?.message || "").trim();
    const message = originalMessage.toLowerCase();

    if (/[가-힣]/.test(originalMessage)) {
        return originalMessage;
    }

    if (message.includes("invalid login credentials")) {
        return "이메일 또는 비밀번호가 올바르지 않습니다.";
    }

    if (message.includes("email not confirmed")) {
        return "이메일 확인을 완료한 뒤 로그인해 주세요.";
    }

    if (message.includes("user already registered")) {
        return "이미 가입된 이메일입니다. 로그인해 주세요.";
    }

    if (
        message.includes("valid email") ||
        message.includes("email address is invalid")
    ) {
        return "올바른 이메일 주소를 입력해 주세요.";
    }

    if (
        message.includes("password") &&
        (message.includes("least") || message.includes("weak"))
    ) {
        return "비밀번호는 6자 이상으로 입력해 주세요.";
    }

    if (
        message.includes("rate limit") ||
        message.includes("security purposes")
    ) {
        return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
    }

    if (
        message.includes("fetch") ||
        message.includes("network")
    ) {
        return "서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }

    return "로그인 정보를 처리하지 못했습니다. 입력 내용을 확인해 주세요.";
}


function setAuthMode(mode, message = "") {
    const signupMode = mode === "signup";

    authDialogTitle.textContent = signupMode ? "회원가입" : "로그인";
    loginForm.hidden = signupMode;
    signupForm.hidden = !signupMode;
    loginModeButton.classList.toggle("active", !signupMode);
    signupModeButton.classList.toggle("active", signupMode);
    loginModeButton.setAttribute("aria-selected", String(!signupMode));
    signupModeButton.setAttribute("aria-selected", String(signupMode));
    setAuthStatus(message);
}


function openAuthDialog(mode = "login", message = "") {
    setAuthMode(mode, message);

    if (!authDialog.open) {
        authDialog.showModal();
    }

    window.setTimeout(() => {
        (mode === "signup" ? signupEmail : loginEmail).focus();
    }, 0);
}


function closeUserMenu() {
    userMenu.hidden = true;
    authButton.setAttribute("aria-expanded", "false");
}


function updateAuthUI() {
    if (currentUser) {
        authButton.textContent = currentUser.email || "내 계정";
        authButton.title = currentUser.email || "내 계정";
        userMenuEmail.textContent = currentUser.email || "로그인 사용자";
        return;
    }

    authButton.textContent = "로그인";
    authButton.title = "로그인 또는 회원가입";
    closeUserMenu();
}


function renderLoginRequired(container, statusElement, message) {
    container.replaceChildren();
    statusElement.textContent = message;

    const box = document.createElement("div");
    box.className = "login-required";

    const text = document.createElement("p");
    text.textContent = message;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-button compact-button";
    button.textContent = "로그인하기";
    button.addEventListener("click", () => openAuthDialog("login", message));

    box.append(text, button);
    container.appendChild(box);
}


function applySession(session) {
    currentSession = session || null;
    currentUser = session?.user || null;
    favoriteNames = new Set();
    updateAuthUI();
}


async function refreshVisiblePersonalFeature() {
    const activeFeature = document.querySelector(
        ".feature-tab.active"
    )?.dataset?.target;

    if (activeFeature === "history") {
        await loadHistory();
    } else if (activeFeature === "favorites") {
        await loadFavorites();
    } else if (activeFeature === "dictionary") {
        await refreshFavoriteNames();
        await renderDictionaryResults(false);
    } else if (displayedEquipment) {
        await refreshFavoriteNames();
        updateDetailFavoriteButton();
    }
}


async function getAccessToken() {
    if (!authClient) {
        return "";
    }

    const { data, error } = await authClient.auth.getSession();

    if (error || !data?.session?.access_token) {
        applySession(null);
        return "";
    }

    if (data.session.access_token !== currentSession?.access_token) {
        applySession(data.session);
    }

    return data.session.access_token;
}


function initializeAuth() {
    if (authClient) {
        return Promise.resolve(authClient);
    }

    if (authInitializationPromise) {
        return authInitializationPromise;
    }

    authInitializationPromise = (async function () {
        try {
            if (!window.supabase?.createClient) {
                throw new Error("Supabase client library unavailable");
            }

            const config = await requestJSON("/api/auth-config");

            const client = window.supabase.createClient(
                config.supabaseUrl,
                config.supabaseKey,
                {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: true
                    }
                }
            );

            const { data, error } = await client.auth.getSession();

            if (error) {
                throw error;
            }

            authClient = client;
            applySession(data?.session || null);

            authClient.auth.onAuthStateChange((event, session) => {
                applySession(session);

                if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
                    window.setTimeout(() => {
                        refreshVisiblePersonalFeature().catch(console.error);
                    }, 0);
                }
            });

            return authClient;
        } catch (error) {
            console.error("Auth initialization failed:", error);
            authClient = null;
            applySession(null);
            authButton.disabled = false;
            authButton.title = "로그인 기능 연결을 다시 시도합니다.";
            return null;
        } finally {
            authInitializationPromise = null;
        }
    })();

    return authInitializationPromise;
}


authButton.addEventListener("click", function () {
    if (!currentUser) {
        openAuthDialog("login");
        return;
    }

    const opening = userMenu.hidden;
    userMenu.hidden = !opening;
    authButton.setAttribute("aria-expanded", String(opening));
});


authCloseButton.addEventListener("click", () => authDialog.close());
loginModeButton.addEventListener("click", () => setAuthMode("login"));
signupModeButton.addEventListener("click", () => setAuthMode("signup"));


document.addEventListener("click", function (event) {
    if (!event.target.closest(".auth-header")) {
        closeUserMenu();
    }
});


loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    loginSubmitButton.disabled = true;
    setAuthStatus("로그인하고 있습니다.");

    try {
        const client = authClient || await initializeAuth();

        if (!client) {
            throw new Error("network");
        }

        const { data, error } = await client.auth.signInWithPassword({
            email: loginEmail.value.trim(),
            password: loginPassword.value
        });

        if (error) {
            throw error;
        }

        applySession(data.session);
        loginPassword.value = "";
        authDialog.close();
        await refreshVisiblePersonalFeature();
    } catch (error) {
        setAuthStatus(getKoreanAuthError(error));
    } finally {
        loginSubmitButton.disabled = false;
    }
});


signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (signupPassword.value !== signupPasswordConfirm.value) {
        setAuthStatus("비밀번호 확인이 일치하지 않습니다.");
        return;
    }

    signupSubmitButton.disabled = true;
    setAuthStatus("회원가입을 처리하고 있습니다.");

    try {
        const client = authClient || await initializeAuth();

        if (!client) {
            throw new Error("network");
        }

        const email = signupEmail.value.trim();
        const password = signupPassword.value;

        await requestJSON("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        signupPassword.value = "";
        signupPasswordConfirm.value = "";

        applySession(data.session);
        authDialog.close();
        await refreshVisiblePersonalFeature();
    } catch (error) {
        setAuthStatus(getKoreanAuthError(error));
    } finally {
        signupSubmitButton.disabled = false;
    }
});


userMenuItems.forEach(function (item) {
    item.addEventListener("click", async function () {
        const action = item.dataset.userAction;
        closeUserMenu();

        if (action === "history" || action === "favorites") {
            await openFeature(action);
            return;
        }

        if (action === "logout" && authClient) {
            try {
                const { error } = await authClient.auth.signOut();

                if (error) {
                    throw error;
                }

                applySession(null);
                await openFeature("analysis");
            } catch (error) {
                console.error("Logout failed:", error);
                window.alert(
                    "로그아웃 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
                );
            }
        }
    });
});


function normalizeSearchValue(value) {
    return String(value || "")
        .normalize("NFKC")
        .toLocaleLowerCase("ko-KR")
        .replace(/[\s·_\-()/]+/g, "")
        .trim();
}


function getEquipmentAliases(equipment) {
    if (Array.isArray(equipment?.aliases)) {
        return equipment.aliases;
    }

    if (typeof equipment?.aliases === "string") {
        return equipment.aliases
            .split(",")
            .map(alias => alias.trim())
            .filter(Boolean);
    }

    return [];
}


function getEquipmentSearchTerms(equipment) {
    return [
        equipment?.name,
        equipment?.english_name,
        ...getEquipmentAliases(equipment)
    ]
        .map(normalizeSearchValue)
        .filter(Boolean);
}


function equipmentMatchesQuery(equipment, query) {
    const normalizedQuery = normalizeSearchValue(query);

    if (!normalizedQuery) {
        return true;
    }

    return getEquipmentSearchTerms(equipment).some(
        term => term.includes(normalizedQuery)
    );
}


function getEquipmentFeatureText(equipment) {
    if (equipment?.key_features) {
        return equipment.key_features;
    }

    const structure = String(equipment?.structure || "").trim();
    const firstSentence = structure.match(/^[^.!?]+[.!?]?/u)?.[0]?.trim();

    return firstSentence || "등록된 외형 특징이 없습니다.";
}


function findCatalogEquipment(query, catalog = equipmentCatalog) {
    const normalizedQuery = normalizeSearchValue(query);

    if (!normalizedQuery) {
        return null;
    }

    return catalog.find(item =>
        getEquipmentSearchTerms(item).includes(normalizedQuery)
    ) || catalog.find(item =>
        getEquipmentSearchTerms(item).some(
            term => term.includes(normalizedQuery) || normalizedQuery.includes(term)
        )
    ) || null;
}


async function getEquipmentCatalog(forceRefresh = false) {
    if (forceRefresh) {
        equipmentCatalogPromise = null;
    }

    if (!equipmentCatalogPromise) {
        equipmentCatalogPromise = requestJSON("/api/equipment-list")
            .then(data => {
                equipmentCatalog = Array.isArray(data.equipment)
                    ? data.equipment
                    : [];
                return equipmentCatalog;
            })
            .catch(error => {
                equipmentCatalogPromise = null;
                throw error;
            });
    }

    return equipmentCatalogPromise;
}


async function enrichAnalysisCandidates(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
        return [];
    }

    const catalog = await getEquipmentCatalog();

    return candidates.map(candidate => {
        const equipment = findCatalogEquipment(candidate.name, catalog);

        return {
            ...candidate,
            name: equipment?.name || candidate.name,
            key_features: getEquipmentFeatureText(equipment),
            english_name: equipment?.english_name || null
        };
    });
}


/* =========================
   이미지 표시
========================= */

function showImage(file) {

    if (!file) {
        return;
    }

    const allowedTypes = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ]);

    if (!allowedTypes.has(file.type)) {
        resetImage();
        uploadStatus.textContent =
            "이미지 파일만 업로드할 수 있습니다.";
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        resetImage();
        uploadStatus.textContent =
            "이미지 크기는 10MB 이하여야 합니다.";
        return;
    }

    uploadStatus.textContent = "";


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

    uploadStatus.textContent = "";


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
            const data = await requestJSON(
                "/api/analyze",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        image: base64Image,
                        mimeType: currentFile.type
                    })
                }
            );


            loadingSection.style.display =
                "none";


            resultSection.style.display =
                "block";


            let enrichedCandidates = data.candidates;

            try {
                enrichedCandidates = await enrichAnalysisCandidates(
                    data.candidates
                );
            } catch (metadataError) {
                console.error(
                    "Candidate metadata lookup failed:",
                    metadataError
                );
            }

            showCandidates(
                enrichedCandidates,
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

    candidateDetailStatus.textContent = "";


    lowConfidenceMessage.replaceChildren();
    lowConfidenceMessage.hidden = true;


    if (
        !Array.isArray(candidates) ||
        candidates.length === 0
    ) {

        showError(
            "실험기구를 식별하지 못했습니다. 다른 사진으로 다시 시도해 주세요."
        );

        return;
    }


    const topConfidence = Number(candidates[0]?.confidence) || 0;
    const secondConfidence = Number(candidates[1]?.confidence) || 0;
    const confidenceGap = candidates.length > 1
        ? Math.abs(topConfidence - secondConfidence)
        : Number.POSITIVE_INFINITY;
    const needsComparison = Boolean(
        lowConfidence ||
        topConfidence < 70 ||
        confidenceGap <= 15
    );

    if (needsComparison) {
        const message = document.createElement("strong");
        message.textContent =
            "인식 결과가 확실하지 않습니다. 아래 특징을 비교해 직접 확인하세요.";

        const comparison = document.createElement("ul");
        comparison.className = "comparison-list";

        candidates.slice(0, 3).forEach(candidate => {
            const item = document.createElement("li");
            const name = document.createElement("strong");
            name.textContent = `${candidate.name}: `;
            item.append(
                name,
                document.createTextNode(
                    candidate.key_features ||
                    "등록된 외형 특징이 없습니다."
                )
            );
            comparison.appendChild(item);
        });

        lowConfidenceMessage.append(message, comparison);
        lowConfidenceMessage.hidden = false;
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


            const featureText = candidate.key_features ||
                "등록된 외형 특징이 없습니다.";

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

                <div class="candidate-features">
                    <strong>특징:</strong>
                    ${escapeHTML(featureText)}
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

            const data = await requestJSON(
                `/api/equipment?name=${encodeURIComponent(
                    selectedEquipment.name
                )}`
            );


            const equipment =
                data.equipment;


            try {
                await saveAnalysisHistory({
                    name: equipment.name,
                    confidence: selectedEquipment.confidence
                });
            } catch (historyError) {
                console.error("Analysis history save failed:", historyError);
            }


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

            if (
                error.code === "EQUIPMENT_NOT_FOUND" ||
                error.status === 404
            ) {
                resultSection.style.display = "block";
                candidateDetailStatus.textContent =
                    "해당 기구의 상세 정보가 아직 등록되어 있지 않습니다.";
            } else {
                showError(error.message);
            }
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

    candidateDetailStatus.textContent = "";


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

async function requestJSON(url, options = {}, requiresAuth = false) {
    const requestOptions = {
        ...options,
        headers: {
            ...(options.headers || {})
        }
    };

    if (requiresAuth) {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            const authError = new Error("로그인이 필요합니다.");
            authError.code = "AUTH_REQUIRED";
            authError.status = 401;
            throw authError;
        }

        requestOptions.headers.Authorization = `Bearer ${accessToken}`;
    }

    let response;

    try {
        response = await fetch(url, requestOptions);
    } catch (error) {
        console.error("Network request failed:", error);
        throw new Error(
            "서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
        );
    }

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        const requestError = new Error(
            data.error ||
            "서버 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
        );
        requestError.status = response.status;
        requestError.code = data.code || "REQUEST_FAILED";
        throw requestError;
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

    if (!currentUser) {
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
                record_type: "analysis",
                equipment_name: candidate.name,
                confidence: candidate.confidence
            })
        },
        true
    );
}


async function loadHistory() {

    if (!currentUser) {
        renderLoginRequired(
            historyList,
            historyStatus,
            "최근 기록을 보려면 로그인해 주세요."
        );
        return;
    }

    historyStatus.textContent =
        "기록을 불러오고 있습니다.";

    historyList.replaceChildren();

    try {

        const data = await requestJSON(
            "/api/history?limit=50",
            {},
            true
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

                const actions =
                    document.createElement("div");

                actions.className = "record-actions";

                const remove =
                    document.createElement("button");

                remove.type = "button";
                remove.className =
                    "secondary-button compact-button";
                remove.textContent = "삭제";

                remove.addEventListener(
                    "click",
                    async function () {

                        if (!window.confirm("이 기록을 삭제할까요?")) {
                            return;
                        }

                        remove.disabled = true;

                        try {
                            await requestJSON(
                                `/api/history?id=${encodeURIComponent(item.id)}`,
                                { method: "DELETE" },
                                true
                            );
                            await loadHistory();

                        } catch (error) {
                            historyStatus.textContent = error.message;
                            remove.disabled = false;
                        }
                    }
                );

                actions.append(date, remove);
                card.append(info, actions);
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

    if (!currentUser) {
        favoriteNames = new Set();
        return [];
    }

    const data = await requestJSON(
        "/api/favorites",
        {},
        true
    );

    favoriteNames = new Set(
        (data.favorites || []).map(
            item => item.equipment_name
        )
    );

    return data.favorites || [];
}


async function toggleFavorite(name) {

    if (!currentUser) {
        const message = "즐겨찾기를 사용하려면 로그인해 주세요.";
        openAuthDialog("login", message);
        const error = new Error(message);
        error.code = "AUTH_REQUIRED";
        throw error;
    }

    if (favoriteNames.has(name)) {

        await requestJSON(
            `/api/favorites?equipment_name=${encodeURIComponent(name)}`,
            { method: "DELETE" },
            true
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
            },
            true
        );

        favoriteNames.add(name);
    }
}


function updateDetailFavoriteButton() {

    if (!displayedEquipment) {
        return;
    }

    detailFavoriteButton.textContent =
        !currentUser
            ? "로그인 후 즐겨찾기"
            : favoriteNames.has(displayedEquipment.name)
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

    if (!currentUser) {
        favoritesInitialNav.replaceChildren();
        favoritesInitialNav.hidden = true;
        renderLoginRequired(
            favoritesList,
            favoritesStatus,
            "즐겨찾기를 사용하려면 로그인해 주세요."
        );
        return;
    }

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
   사전 등록 제안
========================= */

equipmentSubmissionForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        equipmentSubmissionButton.disabled = true;
        equipmentSubmissionStatus.textContent =
            "제안을 전송하고 있습니다.";

        const formData = new FormData(
            equipmentSubmissionForm
        );
        const payload = Object.fromEntries(
            formData.entries()
        );

        try {
            await requestJSON(
                "/api/equipment-submissions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            equipmentSubmissionForm.reset();
            equipmentSubmissionStatus.textContent =
                "제안이 접수되었습니다. 관리자 검토 후 사전에 반영됩니다.";

        } catch (error) {
            equipmentSubmissionStatus.textContent = error.message;

        } finally {
            equipmentSubmissionButton.disabled = false;
        }
    }
);


/* =========================
   관리자 검토실
========================= */

function setAdminView(authenticated) {
    adminLoginPanel.hidden = authenticated;
    adminReviewPanel.hidden = !authenticated;

    if (!authenticated) {
        adminSubmissionList.replaceChildren();
        adminReviewStatus.textContent = "";
    }
}


async function checkAdminSession() {
    adminLoginStatus.textContent = "";

    try {
        const data = await requestJSON(
            "/api/admin-session"
        );
        const authenticated = Boolean(
            data.authenticated
        );

        setAdminView(authenticated);

        if (authenticated) {
            await loadAdminSubmissions();
        } else {
            adminPassword.focus();
        }

    } catch (error) {
        setAdminView(false);
        adminLoginStatus.textContent = error.message;
    }
}


async function openAdminDialog() {
    if (!adminDialog.open) {
        adminDialog.showModal();
    }

    if (window.location.hash !== "#admin") {
        window.history.replaceState(null, "", "#admin");
    }

    await checkAdminSession();
}


function closeAdminDialog() {
    if (adminDialog.open) {
        adminDialog.close();
    }
}


adminEntryButton.addEventListener(
    "click",
    openAdminDialog
);


adminCloseButton.addEventListener(
    "click",
    closeAdminDialog
);


adminDialog.addEventListener(
    "close",
    function () {
        adminPassword.value = "";

        if (window.location.hash === "#admin") {
            window.history.replaceState(
                null,
                "",
                `${window.location.pathname}${window.location.search}`
            );
        }
    }
);


adminLoginForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        adminLoginButton.disabled = true;
        adminLoginStatus.textContent = "확인하고 있습니다.";

        try {
            await requestJSON(
                "/api/admin-session",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        password: adminPassword.value
                    })
                }
            );

            adminPassword.value = "";
            adminLoginStatus.textContent = "";
            setAdminView(true);
            await loadAdminSubmissions();

        } catch (error) {
            adminLoginStatus.textContent = error.message;

        } finally {
            adminLoginButton.disabled = false;
        }
    }
);


adminLogoutButton.addEventListener(
    "click",
    async function () {
        adminLogoutButton.disabled = true;

        try {
            await requestJSON(
                "/api/admin-session",
                { method: "DELETE" }
            );
            setAdminView(false);
            adminLoginStatus.textContent =
                "관리자 세션에서 나왔습니다.";
            adminPassword.focus();

        } catch (error) {
            adminReviewStatus.textContent = error.message;

        } finally {
            adminLogoutButton.disabled = false;
        }
    }
);


async function reviewSubmission(
    submission,
    action,
    imageUrl,
    reviewerNote
) {
    const verb = action === "approve" ? "승인" : "반려";

    if (
        action === "approve" &&
        !String(imageUrl || "").trim()
    ) {
        throw new Error(
            "승인하려면 사전에 표시할 사진 주소가 필요합니다."
        );
    }

    if (!window.confirm(`${submission.name} 제안을 ${verb}할까요?`)) {
        return false;
    }

    await requestJSON(
        "/api/admin-submissions",
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: submission.id,
                action,
                image_url: String(imageUrl || "").trim(),
                reviewer_note: String(reviewerNote || "").trim()
            })
        }
    );

    return true;
}


function renderAdminSubmission(submission) {
    const card = document.createElement("article");
    card.className = "admin-submission-card";

    const title = document.createElement("h3");
    title.textContent = submission.name;

    const meta = document.createElement("p");
    meta.className = "admin-submission-meta";
    meta.textContent =
        `${submission.category} · 제안일 ${formatDate(submission.created_at)}`;

    card.append(title, meta);

    if (submission.image_url) {
        const image = document.createElement("img");
        image.src = submission.image_url;
        image.alt = `${submission.name} 제안 이미지`;
        image.loading = "lazy";
        card.appendChild(image);
    }

    const details = document.createElement("dl");

    [
        ["용도", submission.purpose],
        ["구조", submission.structure],
        ["사용법", submission.usage],
        ["주의", submission.caution]
    ].forEach(
        function ([label, value]) {
            const term = document.createElement("dt");
            term.textContent = label;

            const description = document.createElement("dd");
            description.textContent = value;

            details.append(term, description);
        }
    );

    card.appendChild(details);

    const imageLabel = document.createElement("label");
    imageLabel.className = "admin-review-field";
    imageLabel.textContent = "승인용 사진 주소";

    const imageInput = document.createElement("input");
    imageInput.type = "url";
    imageInput.maxLength = 1000;
    imageInput.placeholder = "https://...";
    imageInput.value = submission.image_url || "";
    imageLabel.appendChild(imageInput);

    const noteLabel = document.createElement("label");
    noteLabel.className = "admin-review-field";
    noteLabel.textContent = "검토 메모";

    const noteInput = document.createElement("textarea");
    noteInput.maxLength = 1000;
    noteInput.placeholder = "반려 이유나 검토 메모를 남길 수 있습니다.";
    noteLabel.appendChild(noteInput);

    const actions = document.createElement("div");
    actions.className = "admin-review-actions";

    const reject = document.createElement("button");
    reject.type = "button";
    reject.className =
        "secondary-button compact-button admin-reject-button";
    reject.textContent = "반려";

    const approve = document.createElement("button");
    approve.type = "button";
    approve.className =
        "primary-button compact-button admin-approve-button";
    approve.textContent = "사전에 승인";

    [
        [reject, "reject"],
        [approve, "approve"]
    ].forEach(
        function ([button, action]) {
            button.addEventListener(
                "click",
                async function () {
                    reject.disabled = true;
                    approve.disabled = true;

                    try {
                        const changed = await reviewSubmission(
                            submission,
                            action,
                            imageInput.value,
                            noteInput.value
                        );

                        if (!changed) {
                            reject.disabled = false;
                            approve.disabled = false;
                            return;
                        }

                        adminReviewStatus.textContent =
                            `${submission.name} 제안을 ${action === "approve" ? "승인" : "반려"}했습니다.`;
                        await loadAdminSubmissions();

                        if (action === "approve") {
                            await loadDictionary(false, true);
                        }

                    } catch (error) {
                        adminReviewStatus.textContent = error.message;
                        reject.disabled = false;
                        approve.disabled = false;
                    }
                }
            );
        }
    );

    actions.append(reject, approve);
    card.append(imageLabel, noteLabel, actions);
    adminSubmissionList.appendChild(card);
}


async function loadAdminSubmissions() {
    adminReviewStatus.textContent =
        "검토 대기 제안을 불러오고 있습니다.";
    adminSubmissionList.replaceChildren();

    try {
        const data = await requestJSON(
            "/api/admin-submissions"
        );
        const submissions = data.submissions || [];

        adminReviewStatus.textContent = submissions.length
            ? `검토 대기 ${submissions.length}건`
            : "현재 검토를 기다리는 제안이 없습니다.";

        submissions.forEach(renderAdminSubmission);

    } catch (error) {
        if (error.message.includes("로그인")) {
            setAdminView(false);
        }

        adminReviewStatus.textContent = error.message;
    }
}


if (window.location.hash === "#admin") {
    openAdminDialog();
}


/* =========================
   실험기구 사전
========================= */

dictionarySearchForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        closeDictionaryAutocomplete();

        if (equipmentCatalog.length === 0) {
            await loadDictionary(true);
            return;
        }

        await renderDictionaryResults(true);
    }
);


dictionaryName.addEventListener(
    "input",
    function () {
        renderDictionaryAutocomplete();

        if (equipmentCatalog.length > 0) {
            renderDictionaryResults();
        }
    }
);


dictionaryName.addEventListener(
    "keydown",
    function (event) {
        if (event.key === "Escape") {
            closeDictionaryAutocomplete();
        }
    }
);


dictionaryCategory.addEventListener(
    "change",
    function () {
        closeDictionaryAutocomplete();

        if (equipmentCatalog.length > 0) {
            renderDictionaryResults();
        }
    }
);


document.addEventListener(
    "click",
    function (event) {
        if (!event.target.closest(".dictionary-search-field")) {
            closeDictionaryAutocomplete();
        }
    }
);


dictionaryResetButton.addEventListener(
    "click",
    function () {
        dictionaryName.value = "";
        dictionaryCategory.value = "";
        closeDictionaryAutocomplete();

        if (equipmentCatalog.length > 0) {
            renderDictionaryResults();
        } else {
            loadDictionary();
        }
    }
);


function closeDictionaryAutocomplete() {
    dictionaryAutocomplete.replaceChildren();
    dictionaryAutocomplete.hidden = true;
    dictionaryName.setAttribute("aria-expanded", "false");
}


function renderDictionaryAutocomplete() {
    const query = dictionaryName.value.trim();

    if (!query || equipmentCatalog.length === 0) {
        closeDictionaryAutocomplete();
        return;
    }

    const suggestions = equipmentCatalog
        .filter(item => equipmentMatchesQuery(item, query))
        .slice(0, 5);

    dictionaryAutocomplete.replaceChildren();

    if (suggestions.length === 0) {
        closeDictionaryAutocomplete();
        return;
    }

    suggestions.forEach(equipment => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "autocomplete-option";
        option.setAttribute("role", "option");

        const name = document.createElement("strong");
        name.textContent = equipment.name;
        option.appendChild(name);

        if (equipment.english_name) {
            const englishName = document.createElement("span");
            englishName.textContent = equipment.english_name;
            option.appendChild(englishName);
        }

        option.addEventListener("click", async function () {
            dictionaryName.value = equipment.name;
            closeDictionaryAutocomplete();
            await renderDictionaryResults(true);
        });

        dictionaryAutocomplete.appendChild(option);
    });

    dictionaryAutocomplete.hidden = false;
    dictionaryName.setAttribute("aria-expanded", "true");
}


function getFilteredDictionaryEquipment() {
    const nameValue = dictionaryName.value.trim();
    const categoryValue = dictionaryCategory.value;

    return equipmentCatalog.filter(item =>
        equipmentMatchesQuery(item, nameValue) &&
        (!categoryValue || item.group_category === categoryValue)
    );
}


async function loadDictionary(
    recordSearch = false,
    forceRefresh = false
) {
    const requestId = ++dictionaryRequestId;

    dictionaryStatus.textContent =
        "기구 목록을 불러오고 있습니다.";
    dictionaryList.replaceChildren();
    dictionaryInitialNav.replaceChildren();
    dictionaryInitialNav.hidden = true;

    try {
        await Promise.all([
            getEquipmentCatalog(forceRefresh),
            refreshFavoriteNames()
        ]);

        if (requestId !== dictionaryRequestId) {
            return;
        }

        await renderDictionaryResults(recordSearch);
    } catch (error) {
        if (requestId === dictionaryRequestId) {
            dictionaryStatus.textContent = error.message;
        }
    }
}


async function renderDictionaryResults(recordSearch = false) {
    const nameValue = dictionaryName.value.trim();
    const categoryValue = dictionaryCategory.value;
    const equipment = getFilteredDictionaryEquipment();
    const sortedEquipment = equipment.slice().sort(
        (a, b) => a.name.localeCompare(b.name, "ko")
    );

    dictionaryList.replaceChildren();
    dictionaryStatus.textContent = sortedEquipment.length
        ? `실험기구 ${sortedEquipment.length}개`
        : "검색 결과가 없습니다.";

    renderInitialNavigation(
        dictionaryInitialNav,
        sortedEquipment.map(item => item.name),
        "dictionary"
    );

    let previousInitial = "";

    sortedEquipment.forEach(item => {
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
    });

    if (recordSearch && (nameValue || categoryValue)) {
        try {
            await saveDictionarySearch(nameValue, categoryValue);
        } catch (error) {
            console.error("Dictionary history save failed:", error);
        }
    }
}


async function saveDictionarySearch(
    nameValue,
    categoryValue
) {

    if (!currentUser) {
        return;
    }

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
        },
        true
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
        equipment.group_category
            ? `${equipment.group_category} · ${equipment.category || "분류 없음"}`
            : equipment.category || "분류 없음";

    info.appendChild(title);

    if (equipment.english_name) {
        const englishName = document.createElement("p");
        englishName.className = "equipment-english-name";
        englishName.textContent = equipment.english_name;
        info.appendChild(englishName);
    }

    info.appendChild(category);

    const favorite =
        document.createElement("button");

    favorite.type = "button";
    favorite.className =
        "secondary-button compact-button";
    favorite.textContent = !currentUser
        ? "로그인 후 즐겨찾기"
        : favoriteNames.has(equipment.name)
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


initializeAuth();
