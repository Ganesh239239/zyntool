const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const lockRatio = document.getElementById("lockRatio");
const results = document.getElementById("results");

let images = [];
let ratio = 1;

/* Upload */
uploadArea.onclick = () => fileInput.click();
fileInput.onchange = () => loadFiles([...fileInput.files]);

function loadFiles(files) {
  images = [];
  results.innerHTML = "";

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        ratio = img.width / img.height;
        widthInput.value = img.width;
        heightInput.value = img.height;
        images.push({ file, img });
      };
    };
    reader.readAsDataURL(file);
  });
}

/* Aspect ratio */
widthInput.oninput = () => {
  if (lockRatio.checked)
    heightInput.value = Math.round(widthInput.value / ratio);
};

heightInput.oninput = () => {
  if (lockRatio.checked)
    widthInput.value = Math.round(heightInput.value * ratio);
};

/* Resize */
document.getElementById("resizeBtn").onclick = () => {
  results.innerHTML = "";
  images.forEach(imgObj => resize(imgObj));
};

function resize(obj) {
  const canvas = document.createElement("canvas");
  canvas.width = widthInput.value;
  canvas.height = heightInput.value;

  canvas.getContext("2d").drawImage(
    obj.img,
    0,
    0,
    canvas.width,
    canvas.height
  );

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    results.innerHTML += `
      <div class="result">
        <img src="${url}">
        <a href="${url}" download="resized-${obj.file.name}">Download</a>
      </div>
    `;
  });
}
