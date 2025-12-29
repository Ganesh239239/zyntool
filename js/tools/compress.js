const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadArea = document.getElementById("uploadArea");
const results = document.getElementById("results");

const qualityRange = document.getElementById("qualityRange");
const qualityInput = document.getElementById("qualityInput");
const applyBtn = document.getElementById("applyBtn");

let files = [];
let quality = qualityRange.value;

/* OPEN FILE PICKER */
uploadBtn.onclick = () => fileInput.click();

/* FILE UPLOAD */
fileInput.onchange = () => {
  files = [...fileInput.files];
  showLivePreview();
};

/* DRAG & DROP */
uploadArea.addEventListener("dragover", e => {
  e.preventDefault();
});

uploadArea.addEventListener("drop", e => {
  e.preventDefault();
  files = [...e.dataTransfer.files].filter(f => f.type.startsWith("image/"));
  showLivePreview();
});

/* LIVE PREVIEW (UPLOAD WORKS HERE) */
function showLivePreview() {
  results.innerHTML = "";

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <img src="${e.target.result}">
        <div class="info">
          <span>${(file.size / 1024).toFixed(1)} KB</span>
          <span>Original</span>
        </div>
      `;
      results.appendChild(card);
    };
    reader.readAsDataURL(file);
  });
}

/* SYNC QUALITY */
qualityRange.oninput = () => {
  qualityInput.value = qualityRange.value;
  quality = qualityRange.value;
};

qualityInput.oninput = () => {
  let v = Math.min(95, Math.max(10, qualityInput.value));
  qualityInput.value = v;
  qualityRange.value = v;
  quality = v;
};

/* APPLY COMPRESSION */
applyBtn.onclick = () => {
  if (!files.length) {
    alert("Please upload images first");
    return;
  }

  results.innerHTML = "";
  files.forEach(file => compressImage(file));
};

/* COMPRESS */
function compressImage(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
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
          <a class="download-btn" href="${url}" download="compressed-${file.name}">
            Download
          </a>
        `;
        results.appendChild(card);
      }, "image/jpeg", quality / 100);
    };
  };
  reader.readAsDataURL(file);
}
