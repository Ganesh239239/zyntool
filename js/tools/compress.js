const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const dropArea = document.getElementById("dropArea");
const results = document.getElementById("results");

const qualityRange = document.getElementById("qualityRange");
const qualityInput = document.getElementById("qualityInput");
const applyBtn = document.getElementById("applyBtn");

let files = [];
let quality = qualityRange.value;

/* --------------------
   FILE UPLOAD
-------------------- */

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  files = [...fileInput.files];
  renderPlaceholders();
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
  files = [...e.dataTransfer.files].filter(f => f.type.startsWith("image/"));
  renderPlaceholders();
});

/* --------------------
   QUALITY CONTROL
-------------------- */

function updateSlider(val) {
  qualityRange.style.background = `
    linear-gradient(
      to right,
      #cfe3ff 0%,
      #cfe3ff ${val}%,
      #eef2f7 ${val}%,
      #eef2f7 100%
    )
  `;
}

qualityRange.oninput = () => {
  qualityInput.value = qualityRange.value;
  quality = qualityRange.value;
  updateSlider(quality);
};

qualityInput.oninput = () => {
  let v = Math.min(95, Math.max(10, qualityInput.value || 10));
  qualityInput.value = v;
  qualityRange.value = v;
  quality = v;
  updateSlider(v);
};

/* --------------------
   PLACEHOLDER PREVIEW
-------------------- */

function renderPlaceholders() {
  results.innerHTML = "";

  if (!files.length) return;

  files.forEach(file => {
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <div style="height:140px;background:#f3f4f6;border-radius:10px;
                  display:flex;align-items:center;justify-content:center;
                  font-size:14px;color:#6b7280">
        Ready to compress
      </div>
      <div class="info">
        <span>${(file.size / 1024).toFixed(1)} KB</span>
        <span>—</span>
      </div>
    `;
    results.appendChild(card);
  });
}

/* --------------------
   APPLY COMPRESSION
-------------------- */

applyBtn.onclick = () => {
  if (!files.length) {
    alert("Please select images first.");
    return;
  }

  results.innerHTML = "";
  files.forEach(file => compress(file));
};

/* --------------------
   COMPRESS FUNCTION
-------------------- */

function compress(file) {
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
          <a class="download-btn"
             href="${url}"
             download="compressed-${file.name}">
            Download
          </a>
        `;

        results.appendChild(card);
      }, "image/jpeg", quality / 100);
    };
  };

  reader.readAsDataURL(file);
}

/* Init */
updateSlider(quality);
