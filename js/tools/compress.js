const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadArea = document.getElementById("uploadArea");
const results = document.getElementById("results");

const qualityRange = document.getElementById("qualityRange");
const qualityInput = document.getElementById("qualityInput");
const applyBtn = document.getElementById("applyBtn");

let originalFile = null;
let originalImg = null;

/* Upload */
uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => handleFile(fileInput.files[0]);

uploadArea.addEventListener("dragover", e => e.preventDefault());
uploadArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFile(e.dataTransfer.files[0]);
});

/* Handle file */
function handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;

  originalFile = file;
  const reader = new FileReader();

  reader.onload = e => {
    originalImg = new Image();
    originalImg.src = e.target.result;
    originalImg.onload = () => compressAndRender();
  };

  reader.readAsDataURL(file);
}

/* Sync slider & input (UI only) */
qualityRange.oninput = () => {
  qualityInput.value = qualityRange.value;
  updateSliderFill();
};

qualityInput.oninput = () => {
  let v = Math.min(95, Math.max(10, qualityInput.value));
  qualityInput.value = v;
  qualityRange.value = v;
  updateSliderFill();
};

/* Apply compression */
applyBtn.onclick = () => {
  if (originalImg) compressAndRender();
};

/* Slider fill */
function updateSliderFill() {
  const v = qualityRange.value;
  qualityRange.style.background = `
    linear-gradient(
      to right,
      #cfe3ff 0%,
      #cfe3ff ${v}%,
      #e9edf2 ${v}%,
      #e9edf2 100%
    )
  `;
}

/* Compress & render */
function compressAndRender() {
  const quality = qualityRange.value / 100;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = originalImg.width;
  canvas.height = originalImg.height;
  ctx.drawImage(originalImg, 0, 0);

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);

    results.innerHTML = `
      <div class="result-card">
        <img src="${url}">
        <div class="info">
          <span>${(originalFile.size / 1024).toFixed(1)} KB</span>
          <span>${(blob.size / 1024).toFixed(1)} KB</span>
        </div>
        <a class="download-btn"
           href="${url}"
           download="compressed-${originalFile.name}">
          Download
        </a>
      </div>
    `;
  }, "image/jpeg", quality);
}

/* Init */
updateSliderFill();
