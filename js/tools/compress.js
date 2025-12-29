const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadArea = document.getElementById("uploadArea");
const results = document.getElementById("results");

const qualityRange = document.getElementById("qualityRange");
const qualityInput = document.getElementById("qualityInput");
const applyBtn = document.getElementById("applyBtn");

/* STATE */
let images = []; // { file, img, card }
let quality = qualityRange.value;
let applied = false;

/* -------------------------
   UPLOAD
------------------------- */

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  loadFiles([...fileInput.files]);
};

uploadArea.addEventListener("dragover", e => e.preventDefault());

uploadArea.addEventListener("drop", e => {
  e.preventDefault();
  loadFiles([...e.dataTransfer.files].filter(f => f.type.startsWith("image/")));
});

function loadFiles(files) {
  results.innerHTML = "";
  images = [];
  applied = false;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const card = createCard(file);
        images.push({ file, img, card });
        updateCard({ file, img, card });
      };
    };
    reader.readAsDataURL(file);
  });
}

/* -------------------------
   CARD CREATION (ONCE)
------------------------- */

function createCard(file) {
  const card = document.createElement("div");
  card.className = "result-card";
  card.innerHTML = `
    <img>
    <div class="info">
      <span class="orig">${(file.size / 1024).toFixed(1)} KB</span>
      <span class="comp">—</span>
    </div>
    <a class="download-btn" style="display:none"></a>
  `;
  results.appendChild(card);
  return card;
}

/* -------------------------
   QUALITY CONTROLS
------------------------- */

qualityRange.oninput = () => {
  qualityInput.value = qualityRange.value;
  quality = qualityRange.value;
  applied = false;
  updateAllCards();
};

qualityInput.oninput = () => {
  let v = Math.min(95, Math.max(10, qualityInput.value));
  qualityInput.value = v;
  qualityRange.value = v;
  quality = v;
  applied = false;
  updateAllCards();
};

/* -------------------------
   APPLY
------------------------- */

applyBtn.onclick = () => {
  applied = true;
  updateAllCards();
};

/* -------------------------
   UPDATE LOGIC (NO DUPLICATES)
------------------------- */

function updateAllCards() {
  images.forEach(updateCard);
}

function updateCard({ file, img, card }) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);

    const imgEl = card.querySelector("img");
    const compEl = card.querySelector(".comp");
    const dl = card.querySelector(".download-btn");

    imgEl.src = url;
    compEl.textContent = `${(blob.size / 1024).toFixed(1)} KB`;

    if (applied) {
      dl.style.display = "block";
      dl.textContent = "Download";
      dl.href = url;
      dl.download = `compressed-${file.name}`;
    } else {
      dl.style.display = "none";
    }
  }, "image/jpeg", quality / 100);
}
