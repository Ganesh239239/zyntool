(() => {
  const input = document.getElementById("resizeInput");
  const selectBtn = document.getElementById("resizeSelectBtn");
  const applyBtn = document.getElementById("resizeApplyBtn");

  const widthInput = document.getElementById("resizeWidth");
  const heightInput = document.getElementById("resizeHeight");
  const lockCheckbox = document.getElementById("resizeLock");

  const results = document.getElementById("resizeResults");

  let images = [];
  let aspectRatio = 1;

  /* Select images */
  selectBtn.addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    images = [];
    results.innerHTML = "";

    [...input.files].forEach(file => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      const img = new Image();

      reader.onload = e => {
        img.src = e.target.result;
      };

      img.onload = () => {
        aspectRatio = img.width / img.height;

        // Autofill first image dimensions
        if (!widthInput.value && !heightInput.value) {
          widthInput.value = img.width;
          heightInput.value = img.height;
        }

        images.push({ file, img });
      };

      reader.readAsDataURL(file);
    });
  });

  /* Maintain aspect ratio */
  widthInput.addEventListener("input", () => {
    if (lockCheckbox.checked && widthInput.value) {
      heightInput.value = Math.round(widthInput.value / aspectRatio);
    }
  });

  heightInput.addEventListener("input", () => {
    if (lockCheckbox.checked && heightInput.value) {
      widthInput.value = Math.round(heightInput.value * aspectRatio);
    }
  });

  /* Resize action */
  applyBtn.addEventListener("click", () => {
    results.innerHTML = "";

    images.forEach(item => resizeImage(item));
  });

  function resizeImage(item) {
    const w = parseInt(widthInput.value) || item.img.width;
    const h = parseInt(heightInput.value) || item.img.height;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(item.img, 0, 0, w, h);

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);

      const wrapper = document.createElement("div");
      wrapper.className = "resize-result";

      wrapper.innerHTML = `
        <img src="${url}" alt="">
        <a href="${url}" download="resized-${item.file.name}">
          Download
        </a>
      `;

      results.appendChild(wrapper);
    }, "image/jpeg", 0.95);
  }
})();
