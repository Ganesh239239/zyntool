const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("file-input");
const loading = document.getElementById("loading");
const controls = document.getElementById("controls");
const previewSection = document.getElementById("preview-section");
const previewImage = document.getElementById("preview-image");
const stats = document.getElementById("stats");
const downloadBtn = document.getElementById("download-btn");
const compressBtn = document.getElementById("compress-btn");

const presetButtons = document.querySelectorAll(".preset-btn");

let selectedQuality = 0.9;
let originalFile = null;
let processedBlob = null;

/* ---------- PRESET SELECTION ---------- */
presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        presetButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedQuality = parseFloat(btn.dataset.quality);
    });
});

/* ---------- DRAG & DROP ---------- */
uploadArea.addEventListener("dragover", e => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", e => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", e => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

/* ---------- FILE HANDLER ---------- */
function handleFile(file) {
    if (!file.type.startsWith("image/")) return;

    originalFile = file;
    uploadArea.style.display = "none";
    controls.style.display = "block";
}

/* ---------- COMPRESSION ---------- */
compressBtn.addEventListener("click", async () => {
    if (!originalFile) return;

    controls.style.display = "none";
    loading.classList.add("active");

    const img = await loadImage(originalFile);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(blob => {
        processedBlob = blob;
        previewImage.src = URL.createObjectURL(blob);

        const originalKB = (originalFile.size / 1024).toFixed(1);
        const compressedKB = (blob.size / 1024).toFixed(1);
        const saved = ((1 - blob.size / originalFile.size) * 100).toFixed(0);

        stats.innerHTML = `
            <p><strong>Original:</strong> ${originalKB} KB</p>
            <p><strong>Compressed:</strong> ${compressedKB} KB</p>
            <p><strong>Saved:</strong> ${saved}%</p>
        `;

        loading.classList.remove("active");
        previewSection.classList.add("active");
    }, "image/jpeg", selectedQuality);
});

/* ---------- DOWNLOAD ---------- */
downloadBtn.addEventListener("click", () => {
    if (!processedBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(processedBlob);
    a.download = "compressed-image.jpg";
    a.click();
});

/* ---------- UTIL ---------- */
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
                       }
