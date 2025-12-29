const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const dropArea = document.getElementById("dropArea");
const results = document.getElementById("results");

const qualityRange = document.getElementById("qualityRange");
const qualityValue = document.getElementById("qualityValue");

let quality = 0.7;

/* Quality control */
qualityRange.oninput = () => {
  quality = qualityRange.value / 100;
  qualityValue.textContent = qualityRange.value;
};

/* Upload */
uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  results.innerHTML = ""; // FIX duplicate preview
  handleFiles(fileInput.files);
};

/* Drag & Drop */
["dragenter", "dragover"].forEach(e =>
  dropArea.addEventListener(e, ev => {
    ev.preventDefault();
    dropArea.classList.add("drag");
  })
);

["dragleave", "drop"].forEach(e =>
  dropArea.addEventListener(e, ev => {
    ev.preventDefault();
    dropArea.classList.remove("drag");
  })
);

dropArea.addEventListener("drop", e => {
  results.innerHTML = ""; // FIX duplicate preview
  handleFiles(e.dataTransfer.files);
});

/* Handle Files */
function handleFiles(files) {
  [...files].forEach(file => compressImage(file));
}

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
        const compressedURL = URL.createObjectURL(blob);

        const card = document.createElement("div");
        card.className = "result-card";

        card.innerHTML = `
          <div class="preview-pair">
            <img src="${e.target.result}">
            <img src="${compressedURL}">
          </div>

          <div class="info">
            <span>${(file.size / 1024).toFixed(1)} KB</span>
            <span>${(blob.size / 1024).toFixed(1)} KB</span>
          </div>

          <div class="actions">
            <a class="download-btn" href="${compressedURL}" download="compressed-${file.name}">
              Download
            </a>
            <button class="remove-btn">✕</button>
          </div>
        `;

        card.querySelector(".remove-btn").onclick = () => card.remove();

        results.appendChild(card);
      }, "image/jpeg", quality);
    };
  };

  reader.readAsDataURL(file);
}
