const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");
const results = document.getElementById("results");
const qualityRange = document.getElementById("qualityRange");
const qualityInput = document.getElementById("qualityInput");
const downloadAllBtn = document.getElementById("downloadAll");
const clearAllBtn = document.getElementById("clearAll");

let images = [];

/* Upload */
uploadArea.onclick = () => fileInput.click();
fileInput.onchange = () => handleFiles([...fileInput.files]);

uploadArea.addEventListener("dragover", e => e.preventDefault());
uploadArea.addEventListener("drop", e => {
  e.preventDefault();
  handleFiles([...e.dataTransfer.files]);
});

/* Handle files */
function handleFiles(files) {
  files.filter(f => f.type.startsWith("image/")).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const item = { file, img, blob: null };
        images.push(item);
        render();
      };
    };
    reader.readAsDataURL(file);
  });
}

/* Quality sync */
qualityRange.oninput = () => {
  qualityInput.value = qualityRange.value;
  render();
};

qualityInput.oninput = () => {
  const v = Math.min(95, Math.max(10, qualityInput.value));
  qualityInput.value = v;
  qualityRange.value = v;
  render();
};

/* Render all */
function render() {
  results.innerHTML = "";
  images.forEach(item => compress(item));
}

function compress(item) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = item.img.width;
  canvas.height = item.img.height;
  ctx.drawImage(item.img, 0, 0);

  canvas.toBlob(blob => {
    item.blob = blob;
    const url = URL.createObjectURL(blob);
    const saved = 100 - (blob.size / item.file.size * 100);

    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <img src="${url}">
      <div class="info">
        <span>${(item.file.size/1024).toFixed(1)} KB</span>
        <span>${(blob.size/1024).toFixed(1)} KB (-${saved.toFixed(0)}%)</span>
      </div>
      <a class="download-btn" href="${url}" download="compressed-${item.file.name}">
        Download
      </a>
    `;
    results.appendChild(card);
  }, "image/jpeg", qualityRange.value / 100);
}

/* Download all */
downloadAllBtn.onclick = async () => {
  const zip = new JSZip();
  images.forEach(i => zip.file(`compressed-${i.file.name}`, i.blob));
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "compressed-images.zip";
  a.click();
};

/* Clear */
clearAllBtn.onclick = () => {
  images = [];
  results.innerHTML = "";
  fileInput.value = "";
};
