const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const selectBtn = document.getElementById("selectBtn");
const resizeBtn = document.getElementById("resizeBtn");
const results = document.getElementById("results");
const clearAll = document.getElementById("clearAll");

let images = [];

selectBtn.onclick = () => fileInput.click();

uploadArea.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  images = [...e.target.files];
};

resizeBtn.onclick = () => {
  results.innerHTML = "";
  images.forEach(file => resizeImage(file));
};

clearAll.onclick = () => {
  images = [];
  results.innerHTML = "";
};

function resizeImage(file) {
  const img = new Image();
  const reader = new FileReader();

  reader.onload = e => {
    img.src = e.target.result;
  };

  img.onload = () => {
    const widthInput = document.getElementById("widthInput").value;
    const heightInput = document.getElementById("heightInput").value;
    const lock = document.getElementById("lockRatio").checked;

    let w = widthInput ? +widthInput : img.width;
    let h = heightInput ? +heightInput : img.height;

    if (lock && widthInput && !heightInput) {
      h = Math.round((w / img.width) * img.height);
    }

    if (lock && heightInput && !widthInput) {
      w = Math.round((h / img.height) * img.width);
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const div = document.createElement("div");
      div.className = "result";
      div.innerHTML = `
        <img src="${url}">
        <a href="${url}" download="resized-${file.name}">
          Download
        </a>
      `;
      results.appendChild(div);
    }, "image/jpeg", 0.95);
  };

  reader.readAsDataURL(file);
}
