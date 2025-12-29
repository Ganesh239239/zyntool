const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const preview = document.getElementById("preview");

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  [...fileInput.files].forEach(file => compressImage(file));
};

function compressImage(file) {
  const reader = new FileReader();

  reader.onload = e => {
    const img = new Image();
    img.src = e.target.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scale = 0.7; // compression level
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);

        const card = document.createElement("div");
        card.innerHTML = `
          <img src="${url}" style="max-width:100%;border-radius:12px">
          <a href="${url}" download="compressed-${file.name}">
            Download
          </a>
        `;

        preview.appendChild(card);
      }, "image/jpeg", 0.7);
    };
  };

  reader.readAsDataURL(file);
}
