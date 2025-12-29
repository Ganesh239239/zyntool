const fileInput = document.getElementById("fileInput");
const uploadArea = document.getElementById("uploadArea");
const results = document.getElementById("results");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const lockRatio = document.getElementById("lockRatio");

let images = [];
let ratio = 1;

uploadArea.onclick = () => fileInput.click();
fileInput.onchange = () => loadFiles([...fileInput.files]);

function loadFiles(files) {
  images = [];
  results.innerHTML = "";
  files.forEach(f => {
    const r = new FileReader();
    r.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        ratio = img.width / img.height;
        widthInput.value = img.width;
        heightInput.value = img.height;
        images.push({ file: f, img });
      };
    };
    r.readAsDataURL(f);
  });
}

widthInput.oninput = () => {
  if (lockRatio.checked)
    heightInput.value = Math.round(widthInput.value / ratio);
};

heightInput.oninput = () => {
  if (lockRatio.checked)
    widthInput.value = Math.round(heightInput.value * ratio);
};

document.getElementById("resizeBtn").onclick = () => {
  results.innerHTML = "";
  images.forEach(i => resize(i));
};

function resize(i) {
  const c = document.createElement("canvas");
  const w = +widthInput.value;
  const h = +heightInput.value;
  c.width = w;
  c.height = h;
  c.getContext("2d").drawImage(i.img,0,0,w,h);
  c.toBlob(b=>{
    const url = URL.createObjectURL(b);
    results.innerHTML += `
      <div class="result-card">
        <img src="${url}">
        <a class="download" href="${url}" download="resized-${i.file.name}">Download</a>
      </div>`;
  });
}
