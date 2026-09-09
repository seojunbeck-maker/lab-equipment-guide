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


const candidateList =
    document.getElementById("candidateList");

const selectedResult =
    document.getElementById("selectedResult");

const confirmedEquipment =
    document.getElementById("confirmedEquipment");

const errorMessage =
    document.getElementById("errorMessage");


let currentFile = null;

let selectedEquipment = null;



/* =========================
   이미지 표시
========================= */

function showImage(file) {

    if (!file) {
        return;
    }


    if (!file.type.startsWith("image/")) {

        alert("이미지 파일만 업로드할 수 있습니다.");

        return;
    }


    currentFile = file;


    const imageURL =
        URL.createObjectURL(file);


    imagePreview.src =
        imageURL;


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
   이미지 제거
========================= */

removeButton.addEventListener(
    "click",
    resetImage
);



function resetImage() {

    currentFile = null;

    imageInput.value = "";

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
   분석 시작
========================= */

analyzeButton.addEventListener(
    "click",
    async function () {

        if (!currentFile) {

            alert(
                "분석할 이미지를 선택하세요."
            );

            return;
        }


        uploadSection.style.display =
            "none";

        resultSection.style.display =
            "none";

        errorSection.style.display =
            "none";

        loadingSection.style.display =
            "block";


        try {

            const base64Image =
                await fileToBase64(
                    currentFile
                );


            const response =
                await fetch(
                    "/api/analyze",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            image: base64Image,

                            mimeType:
                                currentFile.type
                        })
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
                data.candidates
            );

        }

        catch (error) {

            console.error(error);


            loadingSection.style.display =
                "none";


            errorSection.style.display =
                "block";


            errorMessage.textContent =
                error.message;
        }
    }
);



/* =========================
   파일 → Base64
========================= */

function fileToBase64(file) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

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
   후보 출력
========================= */

function showCandidates(candidates) {

    candidateList.innerHTML = "";

    selectedEquipment = null;

    confirmButton.disabled = true;

    selectedResult.textContent =
        "선택된 기구가 없습니다.";


    if (
        !Array.isArray(candidates) ||
        candidates.length === 0
    ) {

        throw new Error(
            "분석 결과를 찾을 수 없습니다."
        );
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


            const confidence =
                Math.round(
                    candidate.confidence
                );


            item.innerHTML = `

                <div class="candidate-name">
                    ${candidate.name}
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

                <div class="reason">
                    ${candidate.reason || ""}
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
========================= */

confirmButton.addEventListener(
    "click",
    function () {

        if (!selectedEquipment) {
            return;
        }


        resultSection.style.display =
            "none";


        confirmSection.style.display =
            "block";


        confirmedEquipment.textContent =
            "선택한 실험기구: " +
            selectedEquipment.name;
    }
);



/* =========================
   다시 분석
========================= */

retryButton.addEventListener(
    "click",
    goToUpload
);



errorRetryButton.addEventListener(
    "click",
    goToUpload
);



restartButton.addEventListener(
    "click",
    function () {

        resetImage();

        goToUpload();
    }
);



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
}