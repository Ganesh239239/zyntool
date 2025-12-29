const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const resizeBtn = document.getElementById("resizeBtn");
const results = document.getElementById("results");

let files = [];

uploadArea.onclick = () => fileInput.click();

fileInput.addEventListener("change", e => {
  files = [...e.target.files];
});

resizeBtn.onclick = () => {
  results.innerHTML = "";
  files.forEach(file => process(file));
};

function process(file) {
  const img = new Image();
  const reader = new FileReader();

  reader.onload = e => img.src = e.target.result;

  img.onload = () => {
    const wVal = document.getElementById("widthInput").value;
    const hVal = document.getElementById("heightInput").value;
    const lock = document.getElementById("lockRatio").checked;

    let w = wVal || img.width;
    let h = hVal || img.height;

    if (lock && wVal && !hVal) h = Math.round(w * img.height / img.width);
    if (lock && hVal && !wVal) w = Math.round(h * img.width / img.height);

    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h);

    c.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const div = document.createElement("div");
      div.className = "result";
      div.innerHTML = `<img src="${url}">`;
      results.appendChild(div);
    });
  };

  reader.readAsDataURL(file);
}
