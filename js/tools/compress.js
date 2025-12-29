const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadArea = document.getElementById("uploadArea");
const results = document.getElementById("results");

const qualityRange = document.getElementById("qualityRange");
const qualityInput = document.getElementById("qualityInput");
const applyBtn = document.getElementById("applyBtn");

let files = [];
let previews = [];
let quality = qualityRange.value;

/* OPEN FILE PICKER */
uploadBtn.onclick = () => fileInput.click();

/* UPLOAD */
fileInput.onchange = () => {
  files = [...fileInput.files];
  renderLivePreviews();
};

/* DRAG & DROP */
uploadArea.addEventListener("dragover", e => e.preventDefault());
uploadArea.addEventListener("drop", e => {
  e.preventDefault();
  files = [...e.dataTransfer.files].filter(f => f.type.startsWith("image/"));
  renderLivePreviews();
});

/* LIVE PREVIEW */
function renderLivePreviews() {
  results.innerHTML = "";
  previews = [];

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        previews.push({ file, img });
        updatePreview();
      };
    };
    reader.readAsDataURL(file);
  });
}

/* LIVE KB UPDATE ON SLIDER */
qualityRange.oninput = () => {
  qualityInput.value = qualityRange.value;
  quality = qualityRange.value;
  updatePreview();
};

qualityInput.oninput = () => {
  let v = Math.min(95, Math.max(10, qualityInput.value));
  qualityInput.value = v;
  qualityRange.value = v;
  quality = v;
  updatePreview();
};

/* UPDATE PREVIEW (NO DOWNLOAD YET) */
function updatePreview() {
  results.innerHTML = "";

  previews.forEach(({ file, img }) => {
    compressImage(img, file, false);
  });
}

/* APPLY = SHOW DOWNLOAD */
applyBtn.onclick = () => {
  results.innerHTML = "";
  previews.forEach(({ file, img }) => {
    compressImage(img, file, true);
  });
};

/* CORE COMPRESS */
function compressImage(img, file, downloadable) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);

    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <img src="${url}">
      <div class="info">
        <span>${(file.size / 1024).toFixed(1)} KB</span>
        <span>${(blob.size / 1024).toFixed(1)} KB</span>
      </div>
      ${
        downloadable
          ? `<a class="download-btn" href="${url}" download="compressed-${file.name}">Download</a>`
          : ``
      }
    `;

    results.appendChild(card);
  }, "image/jpeg", quality / 100);
}
