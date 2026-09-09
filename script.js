const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewText = document.getElementById("previewText");
const fileName = document.getElementById("fileName");

const removeButton = document.getElementById("removeButton");
const analyzeButton = document.getElementById("analyzeButton");
const retryButton = document.getElementById("retryButton");

const uploadSection = document.getElementById("uploadSection");
const loadingSection = document.getElementById("loadingSection");
const resultSection = document.getElementById("resultSection");

const dropArea = document.getElementById("dropArea");


function showImage(file) {

    if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
    }

    const imageURL = URL.createObjectURL(file);

    imagePreview.src = imageURL;
    imagePreview.style.display = "block";

    previewText.style.display = "none";

    fileName.textContent = file.name;

    removeButton.style.display = "inline-block";

    analyzeButton.disabled = false;
}


imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    showImage(file);
});


removeButton.addEventListener("click", function () {

    imageInput.value = "";

    imagePreview.src = "";
    imagePreview.style.display = "none";

    previewText.style.display = "block";

    fileName.textContent = "";

    removeButton.style.display = "none";

    analyzeButton.disabled = true;
});


dropArea.addEventListener("dragover", function (event) {

    event.preventDefault();
});


dropArea.addEventListener("drop", function (event) {

    event.preventDefault();

    const file = event.dataTransfer.files[0];

    if (!file) {
        return;
    }

    showImage(file);
});


analyzeButton.addEventListener("click", function () {

    uploadSection.style.display = "none";

    loadingSection.style.display = "block";

    setTimeout(function () {

        loadingSection.style.display = "none";

        resultSection.style.display = "block";

    }, 2000);
});


retryButton.addEventListener("click", function () {

    resultSection.style.display = "none";

    uploadSection.style.display = "block";
});