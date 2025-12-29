const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const dropArea = document.getElementById("dropArea");
const results = document.getElementById("results");

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => handleFiles(fileInput.files);

/* Drag & Drop */
["dragenter","dragover"].forEach(e =>
  dropArea.addEventListener(e, ev => {
    ev.preventDefault();
    dropArea.classList.add("drag");
  })
);

["dragleave","drop"].forEach(e =>
  dropArea.addEventListener(e, ev => {
    ev.preventDefault();
    dropArea.classList.remove("drag");
  })
);

dropArea.addEventListener("drop", e => {
  handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
  [...files].forEach(file => compress(file));
}

function compress(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scale = 0.7;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => {
        const compressedURL = URL.createObjectURL(blob);

        const card = document.createElement("div");
        card.className = "result-card";
        card.innerHTML = `
          <div class="compare">
            <img src="${e.target.result}">
            <img src="${compressedURL}">
          </div>

          <div class="info">
            <span>Original: ${(file.size/1024).toFixed(1)} KB</span>
            <span>Compressed: ${(blob.size/1024).toFixed(1)} KB</span>
          </div>

          <a class="download-btn" href="${compressedURL}" download="compressed-${file.name}">
            Download
          </a>
        `;

        results.appendChild(card);
      }, "image/jpeg", 0.7);
    };
  };
  reader.readAsDataURL(file);
}
