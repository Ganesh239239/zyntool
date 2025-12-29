const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");
const results = document.getElementById("results");

const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const lockRatio = document.getElementById("lockRatio");

const downloadAllBtn = document.getElementById("downloadAll");
const clearAllBtn = document.getElementById("clearAll");

let images = [];
let aspectRatio = 1;

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
        aspectRatio = img.width / img.height;
        const item = { file, img, blob: null };
        images.push(item);
        render();
      };
    };
    reader.readAsDataURL(file);
  });
}

/* Sync aspect ratio */
widthInput.oninput = () => {
  if (lockRatio.checked) {
    heightInput.value = Math.round(widthInput.value / aspectRatio);
  }
  render();
};

heightInput.oninput = () => {
  if (lockRatio.checked) {
    widthInput.value = Math.round(heightInput.value * aspectRatio);
  }
  render();
};

/* Render */
function render() {
  results.innerHTML = "";
  images.forEach(item => resize(item));
}

function resize(item) {
  const w = parseInt(widthInput.value);
  const h = parseInt(heightInput.value);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(item.img, 0, 0, w, h);

  canvas.toBlob(blob => {
    item.blob = blob;
    const url = URL.createObjectURL(blob);

    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <img src="${url}">
      <div class="info">
        <span>${item.img.width}×${item.img.height}</span>
        <span>${w}×${h}</span>
      </div>
      <a class="download-btn" href="${url}" download="resized-${item.file.name}">
        Download
      </a>
    `;
    results.appendChild(card);
  }, "image/jpeg", 0.9);
}

/* Download all */
downloadAllBtn.onclick = async () => {
  const zip = new JSZip();
  images.forEach(i => zip.file(`resized-${i.file.name}`, i.blob));
  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "resized-images.zip";
  a.click();
};

/* Clear */
clearAllBtn.onclick = () => {
  images = [];
  results.innerHTML = "";
  fileInput.value = "";
};
