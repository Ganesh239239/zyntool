const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const resizeBtn = document.getElementById("resizeBtn");
const results = document.getElementById("results");

let files = [];
let ratio = 1;

uploadArea.onclick = () => fileInput.click();
selectBtn.onclick = e => {
  e.stopPropagation();
  fileInput.click();
};

fileInput.onchange = e => {
  files = [...e.target.files];
};

resizeBtn.onclick = () => {
  results.innerHTML = "";
  files.forEach(file => resizeImage(file));
};

function resizeImage(file) {
  const img = new Image();
  const reader = new FileReader();

  reader.onload = e => img.src = e.target.result;

  img.onload = () => {
    const wInput = document.getElementById("widthInput").value;
    const hInput = document.getElementById("heightInput").value;
    const lock = document.getElementById("lockRatio").checked;

    let w = wInput || img.width;
    let h = hInput || img.height;

    if (lock && wInput && !hInput) h = Math.round(w * img.height / img.width);
    if (lock && hInput && !wInput) w = Math.round(h * img.width / img.height);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0, w, h);

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const div = document.createElement("div");
      div.className = "result";
      div.innerHTML = `
        <img src="${url}">
        <a href="${url}" download="resized-${file.name}">Download</a>
      `;
      results.appendChild(div);
    });
  };

  reader.readAsDataURL(file);
}
